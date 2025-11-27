import axios, { AxiosError, AxiosInstance } from "axios";
import { storage } from "../storage";
import { API_BASE_URL, getClientPlatformHeader, getDeviceInfoHeader } from "../constants";
import { getAccessTokenFromMemory, clearSession, readSession, setSession } from "../auth/session";

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const resolvePending = (token: string | null) => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

const createClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};

    (config.headers as any)["x-client-platform"] = getClientPlatformHeader();
    (config.headers as any)["x-device-info"] = getDeviceInfoHeader();

    let accessToken = getAccessTokenFromMemory();
    if (!accessToken) {
      // Fallback: read directly from storage if memory not hydrated yet
      accessToken = storage.getString("auth:accessToken") ?? null;
    }
    if (accessToken) {
      (config.headers as any).Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;

      if (!originalRequest || originalRequest._retry) {
        return Promise.reject(wrapError(error));
      }

      const status = error.response?.status;
      if (status !== 401) {
        return Promise.reject(wrapError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((token) => {
            if (!token) {
              reject(wrapError(error));
              return;
            }
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(instance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = await readSession();
        if (!refreshToken) {
          await clearSession();
          resolvePending(null);
          return Promise.reject(wrapError(error));
        }

        // Use a bare Axios call without interceptors to avoid infinite loops
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
          {
            withCredentials: true,
            headers: {
              "x-client-platform": getClientPlatformHeader(),
              "x-device-info": getDeviceInfoHeader(),
            }
          },

        );

        const data: any = refreshResponse.data?.data;
        const newAccessToken: string | undefined = data?.accessToken;
        const newRefreshToken: string | undefined = data?.refreshToken ?? refreshToken;

        if (!newAccessToken) {
          await clearSession();
          resolvePending(null);
          return Promise.reject(wrapError(error));
        }

        const { user } = await readSession();
        await setSession({ user, accessToken: newAccessToken, refreshToken: newRefreshToken ?? null });

        resolvePending(newAccessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshErr: any) {
        await clearSession();
        resolvePending(null);
        return Promise.reject(wrapError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    },
  );

  return instance;
};

export const apiClient = createClient();

function wrapError(error: any): Error {
  const axiosError = error as AxiosError<any>;
  const status = axiosError.response?.status;
  const responseData = axiosError.response?.data;
  const backendMessage = responseData?.message;
  const message = backendMessage && typeof backendMessage === "string" ? backendMessage : (error instanceof Error ? error.message : "Request failed");
  const err = new Error(message);
  (err as any).status = status ?? null;
  (err as any).data = responseData ?? null;
  if (axiosError.config) {
    (err as any).request = {
      method: axiosError.config.method,
      url: (axiosError.config.baseURL || "") + (axiosError.config.url || ""),
      headers: axiosError.config.headers,
      data: axiosError.config.data,
    };
  }
  return err;
}
