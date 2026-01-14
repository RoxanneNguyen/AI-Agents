/**
 * Zustand store for chat state management
 */

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Message, Artifact, ChatStore } from "../types";

// Simple UUID generator fallback
const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useChatStore = create<ChatStore>((set, get) => ({
  sessionId: null,
  messages: [],
  isLoading: false,
  currentArtifacts: [],
  selectedArtifact: null,

  setSessionId: (id: string) => set({ sessionId: id }),

  addMessage: (message: Message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: message.id || generateId() },
      ],
    })),

  updateMessage: (id: string, updates: Partial<Message>) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  addArtifact: (artifact: Artifact) =>
    set((state) => ({
      currentArtifacts: [...state.currentArtifacts, artifact],
    })),

  setSelectedArtifact: (artifact: Artifact | null) =>
    set({ selectedArtifact: artifact }),

  clearChat: () =>
    set({
      messages: [],
      currentArtifacts: [],
      selectedArtifact: null,
      sessionId: generateId(),
    }),
}));
