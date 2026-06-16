export type ChatMsg = {
  de: "yo" | "ellos";
  texto: string;
  hora: string;
  foto?: string;
};

export const CHAT_STORE = new Map<string, ChatMsg[]>();
type Listener = (id: string) => void;
const listeners = new Set<Listener>();

export function getChat(walkerId: string): ChatMsg[] {
  return CHAT_STORE.get(walkerId) ?? [];
}

export function setChat(walkerId: string, msgs: ChatMsg[]) {
  CHAT_STORE.set(walkerId, msgs);
  listeners.forEach((l) => l(walkerId));
}

export function pushMessage(walkerId: string, msg: ChatMsg) {
  const next = [...getChat(walkerId), msg];
  setChat(walkerId, next);
}

export function subscribeChat(l: Listener) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function ahora(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
