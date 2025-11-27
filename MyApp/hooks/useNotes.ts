import { useQuery } from "@tanstack/react-query";
import { getNotes, getNote, Note } from "../api/notes";

export function useNotes(opts?: { enabled?: boolean }) {
  return useQuery<Note[], Error>({
    queryKey: ["notes"] as const,
    queryFn: getNotes,
    staleTime: 60_000, // 1 minute
    refetchOnMount: "always",
    enabled: opts?.enabled ?? true,
  });
}

export function useNote(id: string) {
  return useQuery<Note | null, Error>({
    queryKey: ["note", id] as const,
    queryFn: () => getNote(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}
