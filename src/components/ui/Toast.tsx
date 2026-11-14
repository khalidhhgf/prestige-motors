"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type T = { id: number; kind: "success" | "error"; text: string };
const Ctx = createContext<(kind: T["kind"], text: string) => void>(() => {});
export const useToast = () => {
  const push = useContext(Ctx);
  return { success: (t: string) => push("success", t), error: (t: string) => push("error", t) };
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const push = useCallback((kind: T["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setItems((a) => [...a, { id, kind, text }]);
    setTimeout(() => setItems((a) => a.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex items-start gap-2 rounded-md px-4 py-3 text-sm text-white shadow-lg ${t.kind === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
            {t.kind === "success" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            <span className="flex-1">{t.text}</span>
            <button aria-label="Dismiss" onClick={() => setItems((a) => a.filter((x) => x.id !== t.id))}><X size={16} /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
