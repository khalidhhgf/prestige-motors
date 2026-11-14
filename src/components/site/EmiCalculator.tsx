"use client";
import { useMemo, useState } from "react";

const fmt = (n: number, sym: string) => `${sym} ${Math.round(n).toLocaleString("en-PK")}`;

/** Indicative monthly installment (reducing-balance markup). Not a bank offer. */
export default function EmiCalculator({ price = 5_000_000, symbol = "Rs." }: { price?: number; symbol?: string }) {
  const [amount, setAmount] = useState(price);
  const [down, setDown] = useState(30);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(17);

  const r = useMemo(() => {
    const principal = amount * (1 - down / 100);
    const i = rate / 12 / 100, n = years * 12;
    const emi = i === 0 ? principal / n : (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return { principal, emi, total: emi * n, interest: emi * n - principal, downAmt: amount - principal };
  }, [amount, down, years, rate]);

  const Slider = ({ label, value, set, min, max, step, show }: { label: string; value: number; set: (v: number) => void; min: number; max: number; step: number; show: string }) => (
    <div>
      <div className="mb-1 flex justify-between text-sm"><label className="font-medium">{label}</label><span className="text-charcoal-500">{show}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full accent-[var(--accent)]" aria-label={label} />
    </div>
  );

  return (
    <div className="bg-white p-6">
      <h2 className="text-2xl font-semibold">Installment calculator</h2>
      <div className="mt-5 space-y-5">
        <div><label className="label" htmlFor="emi-price">Vehicle price ({symbol})</label><input id="emi-price" type="number" min={100000} step={50000} className="input" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} /></div>
        <Slider label="Down payment" value={down} set={setDown} min={10} max={80} step={5} show={`${down}% · ${fmt(r.downAmt, symbol)}`} />
        <Slider label="Tenure" value={years} set={setYears} min={1} max={7} step={1} show={`${years} year${years > 1 ? "s" : ""}`} />
        <Slider label="Markup rate (p.a.)" value={rate} set={setRate} min={5} max={30} step={0.5} show={`${rate}%`} />
      </div>
      <div className="mt-6 bg-ink p-5 text-white">
        <p className="text-xs uppercase tracking-wider text-white/75">Estimated monthly installment</p>
        <p className="mt-1 font-display text-4xl font-semibold text-accent">{fmt(r.emi, symbol)}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px] text-white/80">
          <div><dt>Financed amount</dt><dd className="text-sm text-white">{fmt(r.principal, symbol)}</dd></div>
          <div><dt>Total markup</dt><dd className="text-sm text-white">{fmt(r.interest, symbol)}</dd></div>
        </dl>
      </div>
      <p className="mt-3 text-[13px] text-charcoal-700">Indicative only. Actual rates, eligibility and fees are set by the financing bank.</p>
    </div>
  );
}
