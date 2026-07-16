import type { MessageReceivedPayload } from '@slip/shared';
import { create } from 'zustand';

export interface Message {
  id: string;
  fromUsername: string;
  fromDisplayName: string | null;
  text: string;
  timestamp: number;
  direction: 'sent' | 'received';
}

interface MessageState {
  /** Ephemeral, in-memory only — no persistence, matching the "no history" design. */
  messages: Message[];
  activeUsername: string | null;
  setActiveUsername: (username: string | null) => void;
  addReceived: (payload: MessageReceivedPayload) => void;
  addSent: (toUsername: string, text: string) => void;
  clear: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  activeUsername: null,
  setActiveUsername: (activeUsername) => set({ activeUsername }),
  addReceived: (payload) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          fromUsername: payload.fromUsername,
          fromDisplayName: payload.fromDisplayName,
          text: payload.text,
          timestamp: payload.timestamp,
          direction: 'received',
        },
      ],
    })),
  addSent: (toUsername, text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          fromUsername: toUsername,
          fromDisplayName: null,
          text,
          timestamp: Date.now(),
          direction: 'sent',
        },
      ],
    })),
  clear: () => set({ messages: [], activeUsername: null }),
}));
