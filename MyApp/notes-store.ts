import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { storage } from "./storage";

export type Note = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: number;
  updatedAt?: number;
};

const INDEX_KEY = "notes:index";

export function saveNote(note: Note) {
  storage.set(`note:${note.id}`, JSON.stringify(note));
}

export function getNote(id: string): Note | null {
  const json = storage.getString(`note:${id}`);
  return json ? JSON.parse(json) : null;
}

export function deleteNote(id: string) {
  storage.remove(`note:${id}`);
  const ids = getIndex().filter((i) => i !== id);
  saveIndex(ids);
}

function getIndex(): string[] {
  const json = storage.getString(INDEX_KEY);
  return json ? JSON.parse(json) : [];
}

function saveIndex(ids: string[]) {
  storage.set(INDEX_KEY, JSON.stringify(ids));
}

export function createNote(payload: {
  title: string;
  description: string;
  tags?: string[];
}): Note {
  const id = uuidv4();
  const now = Date.now();
  const note: Note = {
    id,
    title: payload.title,
    description: payload.description,
    tags: payload.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
  saveNote(note);
  const ids = getIndex();
  saveIndex([...ids, id]);
  return note;
}

export function getAllNotes(): Note[] {
  return getIndex()
    .map((id) => getNote(id))
    .filter((n): n is Note => n !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}