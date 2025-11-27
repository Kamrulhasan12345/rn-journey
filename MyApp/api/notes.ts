import { apiClient } from "./client";

export type NoteMember = { user: string; role: "editor" | "viewer" };

export type Note = {
  id: string; // mapped from _id
  _id?: string;
  title: string;
  content?: string;
  contentPreview?: string;
  owner?: string;
  members?: NoteMember[];
  createdAt?: string;
  updatedAt?: string;
};

function mapServerNote(raw: any): Note {
  return {
    id: raw._id ?? raw.id,
    _id: raw._id,
    title: raw.title ?? "Untitled",
    content: raw.content ?? "",
    contentPreview: raw.contentPreview ?? "",
    owner: raw.owner && typeof raw.owner === "string" ? raw.owner : raw.owner?._id,
    members: raw.members ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function getNotes(): Promise<Note[]> {
  const res = await apiClient.get("/api/notes");
  const data = res.data?.data ?? res.data;
  if (!Array.isArray(data)) return [];
  return data.map(mapServerNote);
}

export async function getNote(id: string): Promise<Note | null> {
  const res = await apiClient.get(`/api/notes/${id}`);
  const data = res.data?.data ?? res.data;
  if (!data) return null;
  return mapServerNote(data);
}

export async function createNoteApi(payload: { title: string }): Promise<Note> {
  const res = await apiClient.post(`/api/notes`, payload);
  const data = res.data?.data ?? res.data;
  return mapServerNote(data);
}

export async function updateNoteTitle(id: string, payload: { title: string }): Promise<Note> {
  const res = await apiClient.patch(`/api/notes/${id}`, payload);
  const data = res.data?.data ?? res.data;
  return mapServerNote(data);
}

export async function deleteNote(id: string): Promise<{ ok: boolean }> {
  const res = await apiClient.delete(`/api/notes/${id}`);
  return { ok: res.status >= 200 && res.status < 300 };
}
