"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-xs">
        {toasts.map((toast) => {
          const styles = {
            success: "bg-neon-lime text-brutal-black border-brutal-black",
            error: "bg-neon-red text-white border-brutal-black",
            warning: "bg-neon-yellow text-brutal-black border-brutal-black",
            info: "bg-neon-cyan text-brutal-black border-brutal-black",
          };
          const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };

          return (
            <div
              key={toast.id}
              className={`animate-[slide-down_0.3s_cubic-bezier(0.16,1,0.3,1)] px-4 py-3 rounded-xl text-sm font-bold border-2 shadow-[3px_3px_0px_rgba(26,26,46,0.8)] cursor-pointer ${styles[toast.type]}`}
              onClick={() => removeToast(toast.id)}
            >
              <span className="mr-2">{icons[toast.type]}</span>
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
