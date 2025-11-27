type Listener = (openId: string | null) => void;
let openCardId: string | null = null;
const listeners: Listener[] = [];

export function getOpenCardId(): string | null {
  return openCardId;
}

export function setOpenCardId(id: string | null): void {
  openCardId = id;
  listeners.forEach(l => l(openCardId));
}

export function toggleOpenCard(id: string): void {
  if (openCardId === id) {
    setOpenCardId(null);
  } else {
    setOpenCardId(id);
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  listener(openCardId);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
