"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";
import { Modal, Confirm, PageHeader } from "./Modal";
import { ImageField } from "./MediaPicker";

export type Field = {
  key: string; label: string; type: "text" | "textarea" | "number" | "checkbox" | "select" | "image" | "list" | "html" | "password";
  options?: { value: string; label: string }[]; help?: string; required?: boolean; rows?: number; itemFields?: Field[];
};
export type Column = { key: string; label: string; render?: (row: any) => React.ReactNode }; // eslint-disable-line @typescript-eslint/no-explicit-any
type Values = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const getPath = (o: Values, path: string) => path.split(".").reduce((a: any, k) => (a == null ? undefined : a[k]), o); // eslint-disable-line @typescript-eslint/no-explicit-any
function setPath(o: Values, path: string, v: unknown): Values {
  const [h, ...rest] = path.split(".");
  return { ...o, [h]: rest.length ? setPath(o[h] ?? {}, rest.join("."), v) : v };
}

export function FieldInput({ f, values, onChange }: { f: Field; values: Values; onChange: (k: string, v: unknown) => void }) {
  const v = getPath(values, f.key);
  const id = "f-" + f.key;
  if (f.type === "checkbox")
    return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!v} onChange={(e) => onChange(f.key, e.target.checked)} /> {f.label}</label>;
  if (f.type === "image") return <ImageField label={f.label} value={v ?? ""} onChange={(x) => onChange(f.key, x)} />;
  if (f.type === "list") {
    const list: Values[] = Array.isArray(v) ? v : [];
    const sub = f.itemFields ?? [];
    return (
      <div>
        <label className="a-label">{f.label}</label>
        <div className="space-y-3">
          {list.map((it, i) => (
            <div key={i} className="rounded border bg-slate-50 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {sub.map((sf) => (
                  <div key={sf.key} className={sf.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="a-label">{sf.label}</label>
                    {sf.type === "textarea"
                      ? <textarea className="a-input" rows={2} value={it[sf.key] ?? ""} onChange={(e) => onChange(f.key, list.map((x, j) => (j === i ? { ...x, [sf.key]: e.target.value } : x)))} />
                      : <input className="a-input" value={it[sf.key] ?? ""} onChange={(e) => onChange(f.key, list.map((x, j) => (j === i ? { ...x, [sf.key]: e.target.value } : x)))} />}
                  </div>
                ))}
              </div>
              <button type="button" className="mt-2 text-xs text-red-600" onClick={() => onChange(f.key, list.filter((_, j) => j !== i))}>Remove item</button>
            </div>
          ))}
          <button type="button" className="a-btn-ghost" onClick={() => onChange(f.key, [...list, Object.fromEntries(sub.map((s) => [s.key, ""]))])}><Plus size={14} /> Add item</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <label className="a-label" htmlFor={id}>{f.label}{f.required && " *"}</label>
      {f.type === "textarea" || f.type === "html" ? (
        <textarea id={id} className={`a-input ${f.type === "html" ? "font-mono text-xs" : ""}`} rows={f.rows ?? (f.type === "html" ? 12 : 4)} value={v ?? ""} onChange={(e) => onChange(f.key, e.target.value)} required={f.required} />
      ) : f.type === "select" ? (
        <select id={id} className="a-input" value={v ?? ""} onChange={(e) => onChange(f.key, e.target.value)}>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      ) : (
        <input id={id} className="a-input" type={f.type === "number" ? "number" : f.type === "password" ? "password" : "text"} value={v ?? ""} required={f.required}
          autoComplete={f.type === "password" ? "new-password" : undefined} onChange={(e) => onChange(f.key, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} />
      )}
      {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
    </div>
  );
}

type Props = {
  endpoint: string; resource?: string; title: string; desc?: string; newLabel?: string;
  fields: Field[] | ((values: Values) => Field[]);
  columns: Column[]; defaults?: Values; orderable?: boolean; canDelete?: (row: any) => boolean; // eslint-disable-line @typescript-eslint/no-explicit-any
  toForm?: (row: any) => Values; // eslint-disable-line @typescript-eslint/no-explicit-any
  wide?: boolean; readOnly?: boolean;
};

export default function ResourceManager({ endpoint, resource, title, desc, newLabel = "Add new", fields, columns, defaults = {}, orderable, canDelete, toForm, wide, readOnly }: Props) {
  const [rows, setRows] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<{ id?: string; values: Values } | null>(null);
  const [del, setDel] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const resName = resource ?? endpoint.split("/").pop()!;

  const load = useCallback(async () => {
    try { setRows((await api<{ items: any[] }>(endpoint)).items); } // eslint-disable-line @typescript-eslint/no-explicit-any
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setBusy(true);
    try {
      const body = { ...edit.values }; if (!body.password) delete body.password;
      if (edit.id) await api(`${endpoint}/${edit.id}`, { method: "PUT", body });
      else await api(endpoint, { body });
      toast.success("Saved");
      setEdit(null); await load();
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true);
    try { await api(`${endpoint}/${del.id}`, { method: "DELETE" }); toast.success("Deleted"); setDel(null); await load(); }
    catch (err) { toast.error((err as Error).message); setDel(null); }
    finally { setBusy(false); }
  }

  async function move(i: number, d: number) {
    const next = [...rows]; const j = i + d; if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]]; setRows(next);
    try { await api("/api/admin/reorder", { body: { resource: resName, ids: next.map((r) => r.id) } }); }
    catch (err) { toast.error((err as Error).message); load(); }
  }

  const fl = edit ? (typeof fields === "function" ? fields(edit.values) : fields) : [];
  const setVal = (k: string, v: unknown) => setEdit((s) => (s ? { ...s, values: setPath(s.values, k, v) } : s));

  return (
    <div>
      <PageHeader title={title} desc={desc} action={!readOnly && <button className="a-btn-primary" onClick={() => setEdit({ values: { ...defaults } })}><Plus size={16} /> {newLabel}</button>} />
      <div className="a-card overflow-x-auto">
        <table className="sticky-actions min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr>{columns.map((c) => <th key={c.key} className="a-th">{c.label}</th>)}<th className="a-th text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={columns.length + 1} className="a-td py-10 text-center text-slate-500">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={columns.length + 1} className="a-td py-10 text-center text-slate-500">Nothing here yet.{!readOnly && " Click “" + newLabel + "” to add the first one."}</td></tr>}
            {rows.map((r, i) => (
              <tr key={r.id} className="hover:bg-slate-50">
                {columns.map((c) => <td key={c.key} className="a-td">{c.render ? c.render(r) : String(getPath(r, c.key) ?? "")}</td>)}
                <td className="a-td whitespace-nowrap text-right">
                  {orderable && <><button className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={16} /></button><button className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={16} /></button></>}
                  {!readOnly && <button className="p-1.5 text-slate-600 hover:text-slate-900" onClick={() => setEdit({ id: r.id, values: toForm ? toForm(r) : { ...r } })} aria-label="Edit"><Pencil size={16} /></button>}
                  {(!canDelete || canDelete(r)) && <button className="p-1.5 text-red-600 hover:text-red-800" onClick={() => setDel(r)} aria-label="Delete"><Trash2 size={16} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <Modal title={edit.id ? `Edit ${title.toLowerCase()}` : newLabel} onClose={() => setEdit(null)} wide={wide}>
          <form onSubmit={save} className="space-y-4">
            {fl.map((f) => <FieldInput key={f.key} f={f} values={edit.values} onChange={setVal} />)}
            <div className="flex justify-end gap-2 border-t pt-4"><button type="button" className="a-btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="a-btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button></div>
          </form>
        </Modal>
      )}
      {del && <Confirm text={`Delete “${del.name ?? del.title ?? del.label ?? del.question ?? del.email ?? "this item"}”? This cannot be undone.`} busy={busy} onYes={remove} onNo={() => setDel(null)} />}
    </div>
  );
}

export const Badge = ({ on, yes = "Active", no = "Hidden" }: { on: boolean; yes?: string; no?: string }) => (
  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${on ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{on ? yes : no}</span>
);
