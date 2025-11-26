import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readSession, setSession, clearSession, type SessionState } from "../auth/session";
import * as authApi from "../api/auth";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: session } = useQuery<SessionState>({
    queryKey: ["session"],
    queryFn: async () => readSession(),
    initialData: {
      user: null,
      accessToken: null,
      refreshToken: null,
    },
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const next = {
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken ?? null,
      };
      setSession(next);
      queryClient.setQueryData(["session"], next);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      const next = {
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken ?? null,
      };
      setSession(next);
      queryClient.setQueryData(["session"], next);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const current = await readSession();
      await authApi.logout(current.refreshToken);
    },
    onSettled: async () => {
      await clearSession();
      queryClient.setQueryData<SessionState>(["session"], {
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: authApi.logoutAll,
    onSettled: async () => {
      await clearSession();
      queryClient.setQueryData<SessionState>(["session"], {
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    },
  });

  const isAuthenticated = !!session.user && !!session.accessToken;

  const bootRefresh = useCallback(async () => {
    const current = await readSession();
    if (!current.refreshToken) {
      await clearSession();
      queryClient.setQueryData<SessionState>(["session"], {
        user: null,
        accessToken: null,
        refreshToken: null,
      });
      return;
    }
    try {
      const res = await authApi.refresh(current.refreshToken);
      const next = {
        user: current.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken ?? current.refreshToken,
      };
      await setSession(next);
      queryClient.setQueryData(["session"], next);
    } catch {
      await clearSession();
      queryClient.setQueryData<SessionState>(["session"], {
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  }, [queryClient]);

  return {
    session,
    isAuthenticated,
    loginMutation,
    registerMutation,
    logoutMutation,
    logoutAllMutation,
    bootRefresh,
  };
}
