"use client";
import { X } from "lucide-react";

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`w-full rounded-lg bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-xl"}`}>
        <div className="flex items-center justify-between border-b p-4"><h2 className="font-semibold">{title}</h2><button onClick={onClose} aria-label="Close"><X /></button></div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ text, onYes, onNo, busy }: { text: string; onYes: () => void; onNo: () => void; busy?: boolean }) {
  return (
    <Modal title="Please confirm" onClose={onNo}>
      <p className="text-sm text-slate-700">{text}</p>
      <div className="mt-5 flex justify-end gap-2"><button className="a-btn-ghost" onClick={onNo}>Cancel</button><button className="a-btn-danger" disabled={busy} onClick={onYes}>{busy ? "Working…" : "Confirm"}</button></div>
    </Modal>
  );
}

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-semibold">{title}</h1>{desc && <p className="text-sm text-slate-500">{desc}</p>}</div>
      {action}
    </div>
  );
}
