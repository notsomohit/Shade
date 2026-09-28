"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";

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
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`
              pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium
              shadow-2xl select-none cursor-pointer
              animate-[slideUp_0.15s_ease-out]
              ${
                t.type === "error"
                  ? "bg-[#181113] border-red-500/30 text-red-300"
                  : t.type === "success"
                  ? "bg-[#111813] border-emerald-500/30 text-emerald-300"
                  : "bg-[#16161a] border-[#222227] text-[#ededed]"
              }
            `}
          >
            {t.type === "error" && (
              <span className="text-red-400 shrink-0 text-xs">✕</span>
            )}
            {t.type === "success" && (
              <span className="text-emerald-400 shrink-0 text-xs">✓</span>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
