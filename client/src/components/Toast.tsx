"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode, memo } from "react";

export type ToastType = "info" | "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timerMap.current.delete(id);
    }, 2800);
    timerMap.current.set(id, timer);
  }, []);

  const dismiss = (id: string) => {
    const timer = timerMap.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timerMap.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Renderer */}
      <div
        aria-live="polite"
        className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`
              pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded border text-xs font-mono
              shadow-2xl select-none cursor-pointer
              animate-[slideUp_0.18s_ease-out]
              ${
                t.type === "error"
                  ? "bg-[#1a0a0a] border-red-500/40 text-red-300"
                  : t.type === "success"
                  ? "bg-[#0a1a0a] border-green-500/40 text-green-300"
                  : "bg-[#131418] border-[#26272b] text-[#f0f0ec]"
              }
            `}
          >
            {t.type === "error" && (
              <span className="text-red-400 shrink-0">✕</span>
            )}
            {t.type === "success" && (
              <span className="text-green-400 shrink-0">✓</span>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
