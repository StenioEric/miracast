import { expeditionSteps, nextStep } from "../domain/expedition.ts";
import type { Answer, ExpeditionStep } from "../domain/expedition.ts";

const prefix = "miracast:v1:";
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const maxCodeAttempts = 20;

export type Room = { code: string; name: string; started: boolean };
export type Participant = {
  id: string;
  roomCode: string;
  name: string;
  step: ExpeditionStep;
  answers: Partial<Record<ExpeditionStep, Answer>>;
};

type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "key" | "length">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRoom(value: unknown): value is Room {
  return isRecord(value) && typeof value.code === "string" && typeof value.name === "string"
    && typeof value.started === "boolean";
}

function isAnswer(value: unknown): value is Answer {
  return isRecord(value) && typeof value.value === "string"
    && (value.correct === undefined || typeof value.correct === "boolean");
}

function isParticipant(value: unknown): value is Participant {
  return isRecord(value) && typeof value.id === "string" && typeof value.roomCode === "string"
    && typeof value.name === "string" && expeditionSteps.some((step) => step === value.step)
    && isRecord(value.answers) && Object.values(value.answers).every(isAnswer);
}

export function normalizeRoomCode(code: string) {
  return code.trim().toUpperCase();
}

export function createRoomStore(storage: Storage, notify: () => void = () => {}) {
  const read = <T,>(key: string, isValid: (value: unknown) => value is T): T | null => {
    const value = storage.getItem(key);
    if (!value) return null;
    try {
      const parsed: unknown = JSON.parse(value);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };
  const write = <T,>(key: string, value: T) => {
    storage.setItem(key, JSON.stringify(value));
    notify();
  };
  const all = <T,>(keyPrefix: string, isValid: (value: unknown) => value is T): T[] =>
    Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter((key): key is string => key !== null && key.startsWith(keyPrefix))
      .flatMap((key) => {
        const value = read(key, isValid);
        return value ? [value] : [];
      });

  const getRoom = (code: string) => read(prefix + "room:" + normalizeRoomCode(code), isRoom);
  const getParticipant = (id: string) => read(prefix + "participant:" + id, isParticipant);
  const participants = (roomCode: string) =>
    all(prefix + "participant:", isParticipant).filter((participant) => participant.roomCode === roomCode);

  function createRoom(name: string, randomCode = generateRoomCode): Room {
    if (!name.trim()) throw new Error("Informe um nome para a sala.");
    for (let attempt = 0; attempt < maxCodeAttempts; attempt++) {
      const code = randomCode();
      if (!getRoom(code)) {
        const room = { name: name.trim(), code, started: false };
        write(prefix + "room:" + code, room);
        return room;
      }
    }
    throw new Error("Não foi possível gerar um código de sala. Tente novamente.");
  }

  function startRoom(code: string) {
    const room = getRoom(code);
    if (!room) throw new Error("Sala não encontrada.");
    if (!room.started) write(prefix + "room:" + room.code, { ...room, started: true });
  }

  function joinRoom(code: string, name: string): Participant {
    const room = getRoom(code);
    if (!room) throw new Error("Sala não encontrada. Confira o código com o professor.");
    if (!name.trim()) throw new Error("Informe seu nome para entrar.");
    const id = Array.from(
      globalThis.crypto.getRandomValues(new Uint8Array(16)),
      (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");
    const participant: Participant = { id, roomCode: room.code, name: name.trim(), step: "motivation", answers: {} };
    write(prefix + "participant:" + id, participant);
    return participant;
  }

  function advance(id: string, step: ExpeditionStep, answer?: Answer) {
    const participant = getParticipant(id);
    if (!participant || !getRoom(participant.roomCode)?.started) {
      throw new Error("Aguarde o início da expedição.");
    }
    if (participant.step !== step) return;
    const next = nextStep(step);
    if (!next) return;
    const answers = answer ? { ...participant.answers, [step]: answer } : participant.answers;
    write(prefix + "participant:" + id, { ...participant, step: next, answers });
  }

  return {
    getRoom,
    getParticipant,
    participants,
    rooms: () => all(prefix + "room:", isRoom),
    createRoom,
    startRoom,
    joinRoom,
    advance,
  };
}

export function generateRoomCode() {
  return Array.from(
    globalThis.crypto.getRandomValues(new Uint8Array(6)),
    (value) => codeAlphabet[value % codeAlphabet.length],
  ).join("");
}

const sameTabEvent = "miracast:rooms-changed";

export function browserRoomStore() {
  return createRoomStore(window.localStorage, () => window.dispatchEvent(new Event(sameTabEvent)));
}

export function subscribeToRooms(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith(prefix)) onChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(sameTabEvent, onChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(sameTabEvent, onChange);
  };
}
