"use client";

import React, { useState } from "react";

const T = {
  bg: "#09090B", surface: "#111113", border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.03)", white: "#FAFAFA", t1: "#E4E4E7",
  t2: "#71717A", t3: "#3F3F46", green: "#10B981", red: "#F43F5E", line: "#818CF8",
};

/* ── Fee tiers (progressive / marginal) ── */
const TIERS = [
  { from: 0,   to: 20, rate: 25, label: "0% – 20%" },
  { from: 20,  to: 35, rate: 30, label: "20% – 35%" },
  { from: 35,  to: 50, rate: 40, label: "35% – 50%" },
  { from: 50,  to: Infinity, rate: 50, label: "50%+" },
];

function calcFee(capital: number, profit: number) {
  const returnPct = capital > 0 ? (profit / capital) * 100 : 0;
  const breakdown: { tier: string; rate: number; profitSlice: number; fee: number }[] = [];
  let remaining = profit;
  let prevThreshold = 0;

  for (const t of TIERS) {
    if (remaining <= 0) break;
    const tierCeiling = t.to === Infinity ? Infinity : (t.to - t.from) / 100 * capital;
    const sliceMax = t.to === Infinity ? remaining : Math.min(tierCeiling, remaining);
    const slice = Math.max(0, sliceMax);
    const fee = slice * t.rate / 100;
    if (slice > 0) {
      breakdown.push({ tier: t.label, rate: t.rate, profitSlice: slice, fee });
    }
    remaining -= slice;
  }

  const totalFee = breakdown.reduce((s, b) => s + b.fee, 0);
  const effectiveRate = profit > 0 ? (totalFee / profit) * 100 : 0;
  const netProfit = profit - totalFee;

  return { breakdown, totalFee, effectiveRate, netProfit, returnPct };
}

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function PricingPage() {
  const [capital, setCapital] = useState(500000);
  const [profit, setProfit] = useState(500000);

  const result = calcFee(capital, profit);

  return (
    <div className="min-h-screen page-enter" style={{ background: T.bg, color: T.t1 }}>
      <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: T.white }}>Fee Structure</h1>
            <p className="text-[11px] mt-0.5" style={{ color: T.t2 }}>Progressive Performance Fee · Marginal Rate System</p>
          </div>
          <a href="/" className="text-[11px] font-medium px-3 py-1.5 rounded-lg"
             style={{ color: T.t2, background: T.surface, border: `1px solid ${T.border}` }}>← Home</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">

          {/* ── Left: Tier table + explanation ── */}
          <div className="space-y-4">
            {/* Tier cards */}
            <div className="rounded-xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] uppercase tracking-[0.12em] mb-4 pb-2" style={{ color: T.t3, borderBottom: `1px solid ${T.borderLight}` }}>
                Performance Fee Tiers
              </p>
              <div className="space-y-3">
                {TIERS.map((t, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {/* Bar visual */}
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-[14px] font-bold"
                         style={{ background: `rgba(129,140,248,${0.06 + i * 0.04})`, color: T.line }}>
                      {t.rate}%
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium" style={{ color: T.t1 }}>
                          Return {t.label}
                        </span>
                        <span className="text-[12px] font-semibold tabular-nums" style={{ color: T.line }}>
                          {t.rate}% fee
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: T.borderLight }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(t.rate * 2, 100)}%`, background: T.line, opacity: 0.3 + i * 0.15 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] uppercase tracking-[0.12em] mb-3 pb-2" style={{ color: T.t3, borderBottom: `1px solid ${T.borderLight}` }}>
                How It Works
              </p>
              <div className="space-y-3 text-[12px]" style={{ color: T.t2 }}>
                <div className="flex gap-3">
                  <span className="text-[11px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(129,140,248,0.1)", color: T.line }}>1</span>
                  <p>Fees are calculated on a <span style={{ color: T.t1 }}>marginal basis</span> — each tier only applies to the profit within that range, not the total.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[11px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(129,140,248,0.1)", color: T.line }}>2</span>
                  <p>Return rate is calculated as <span style={{ color: T.t1 }}>profit ÷ initial capital</span>.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[11px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(129,140,248,0.1)", color: T.line }}>3</span>
                  <p>Only charged on <span style={{ color: T.t1 }}>realized profits</span>. No profit = no fee.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[11px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(129,140,248,0.1)", color: T.line }}>4</span>
                  <p>Higher returns benefit from the <span style={{ color: T.t1 }}>lower marginal rates</span> on earlier tiers — the effective rate is always lower than the top tier.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Calculator ── */}
          <div className="space-y-4">
            {/* Inputs */}
            <div className="rounded-xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] uppercase tracking-[0.12em] mb-4 pb-2" style={{ color: T.t3, borderBottom: `1px solid ${T.borderLight}` }}>
                Fee Calculator
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em]" style={{ color: T.t3 }}>Initial Capital</label>
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color: T.t1 }}>${fmt(capital)}</span>
                  </div>
                  <input type="range" min={10000} max={5000000} step={10000} value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${T.line} ${capital/50000}%, ${T.borderLight} 0%)`, accentColor: T.line }} />
                  <div className="flex justify-between text-[9px] mt-1" style={{ color: T.t3 }}>
                    <span>$10K</span><span>$5M</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em]" style={{ color: T.t3 }}>Profit</label>
                    <span className="text-[13px] font-semibold tabular-nums" style={{ color: T.green }}>${fmt(profit)}</span>
                  </div>
                  <input type="range" min={0} max={Math.max(capital * 2, 100000)} step={5000} value={profit}
                    onChange={(e) => setProfit(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${T.green} ${profit/(capital*2)*100}%, ${T.borderLight} 0%)`, accentColor: T.green }} />
                  <div className="flex justify-between text-[9px] mt-1" style={{ color: T.t3 }}>
                    <span>$0</span><span>Return: {result.returnPct.toFixed(1)}%</span><span>${fmt(Math.max(capital * 2, 100000))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="rounded-xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] uppercase tracking-[0.12em] mb-3 pb-2" style={{ color: T.t3, borderBottom: `1px solid ${T.borderLight}` }}>
                Fee Breakdown
              </p>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                    {["Tier", "Rate", "Profit Slice", "Fee"].map((h, i) => (
                      <th key={i} className={`pb-2 text-[9px] uppercase tracking-[0.1em] font-medium ${i > 0 ? "text-right" : "text-left"}`} style={{ color: T.t3 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((b, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                      <td className="py-2 font-medium" style={{ color: T.t1 }}>{b.tier}</td>
                      <td className="py-2 text-right tabular-nums" style={{ color: T.line }}>{b.rate}%</td>
                      <td className="py-2 text-right tabular-nums" style={{ color: T.t2 }}>${fmt(b.profitSlice)}</td>
                      <td className="py-2 text-right font-medium tabular-nums" style={{ color: T.red }}>${fmt(b.fee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="rounded-xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] mb-1" style={{ color: T.t3 }}>Total Fee</p>
                  <p className="text-[22px] font-bold tabular-nums" style={{ color: T.red }}>${fmt(result.totalFee)}</p>
                  <p className="text-[10px] tabular-nums mt-0.5" style={{ color: T.t3 }}>Effective rate: {result.effectiveRate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] mb-1" style={{ color: T.t3 }}>Client Net Profit</p>
                  <p className="text-[22px] font-bold tabular-nums" style={{ color: T.green }}>${fmt(result.netProfit)}</p>
                  <p className="text-[10px] tabular-nums mt-0.5" style={{ color: T.t3 }}>Net return: {(result.netProfit / capital * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] mb-1" style={{ color: T.t3 }}>Gross Return</p>
                  <p className="text-[22px] font-bold tabular-nums" style={{ color: T.t1 }}>{result.returnPct.toFixed(1)}%</p>
                  <p className="text-[10px] tabular-nums mt-0.5" style={{ color: T.t3 }}>On ${fmt(capital)} capital</p>
                </div>
              </div>
            </div>

            {/* Example callout */}
            <div className="rounded-xl p-4" style={{ background: "rgba(129,140,248,0.04)", border: `1px solid rgba(129,140,248,0.1)` }}>
              <p className="text-[11px]" style={{ color: T.t2 }}>
                <span style={{ color: T.line }}>Example:</span> $500K capital with $500K profit (100% return) →
                Tier 1: $100K × 25% = $25K,
                Tier 2: $75K × 30% = $22.5K,
                Tier 3: $75K × 40% = $30K,
                Tier 4: $250K × 50% = $125K.
                <span style={{ color: T.t1 }}> Total fee: $202,500 (effective 40.5%)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: `1px solid ${T.borderLight}` }}>
          <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: T.t3 }}>LINBAY</p>
          <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: T.t3 }}>Performance Fee Schedule</p>
        </div>
      </div>
    </div>
  );
}
