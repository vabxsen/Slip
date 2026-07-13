import { create } from 'zustand';

export type ToastSeverity = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
}

interface ToastState {
  queue: Toast[];
  show: (message: string, severity?: ToastSeverity) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  queue: [],
  show: (message, severity = 'info') =>
    set((state) => ({ queue: [...state.queue, { id: nextId++, message, severity }] })),
  dismiss: (id) => set((state) => ({ queue: state.queue.filter((t) => t.id !== id) })),
}));

/** Imperative helper so non-React code (services, engines) can raise toasts. */
export function showToast(message: string, severity: ToastSeverity = 'info'): void {
  useToastStore.getState().show(message, severity);
}

if (import.meta.env.DEV) {
  (window as unknown as { __slipToast?: typeof showToast }).__slipToast = showToast;
}
