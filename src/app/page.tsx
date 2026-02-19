"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/useWebSocket";
import { useI18n } from "@/lib/i18n";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

/* ── Design tokens ── */
const T = {
  bg: "#09090B",
  surface: "#111113",
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.03)",
  white: "#FAFAFA",
  t1: "#E4E4E7",
  t2: "#71717A",
  t3: "#3F3F46",
  green: "#10B981",
  greenBg: "rgba(16,185,129,0.08)",
  red: "#F43F5E",
  redBg: "rgba(244,63,94,0.08)",
  line: "#818CF8",
};

/* ── MT5 Performance Data (end.pdf — all positions closed) ── */
const MT5 = {
  id: "107442147", period: "Feb 4 – 14, 2026", deposit: 40000, balance: 89966.52,
  equity: 89966.52, fp: 0, fm: 89966.52, ml: "0.00%",
  np: 39966.52, npPct: 79.93, trades: 205, wr: 76.10, pf: 1.29,
  sharpe: 0.08, avgW: 1132.71, avgL: -2790.54, bestT: 41221.50, worstT: -23533.94,
  gp: 176702.80, gl: -136736.28, comm: -3393.30, swap: -1198.50, hold: "2h 14m",
  wsMax: 18, lsMax: 3,
};
const EQ = [
  { d: "04", b: 40000, e: 40000 }, { d: "05", b: 42503, e: 39500 }, { d: "06", b: 21009, e: 21009 },
  { d: "07", b: 45600, e: 45600 }, { d: "08", b: 52300, e: 52300 }, { d: "09", b: 58700, e: 58700 },
  { d: "10", b: 65500, e: 65500 }, { d: "11", b: 74659, e: 74659 }, { d: "12", b: 85433, e: 85433 },
  { d: "13", b: 89967, e: 89967 },
];
const INST = [
  { sym: "XAUUSD", name: "Gold", pnl: 35200.00, n: 160, wr: 77.5, pct: 81.2 },
  { sym: "US30", name: "Dow Jones", pnl: 2850.00, n: 24, wr: 66.7, pct: 6.6 },
  { sym: "NAS100", name: "Nasdaq 100", pnl: 1100.00, n: 12, wr: 66.7, pct: 2.5 },
  { sym: "JP225", name: "Nikkei 225", pnl: 1733.33, n: 4, wr: 100.0, pct: 4.0 },
  { sym: "XAGUSD", name: "Silver", pnl: -547.50, n: 5, wr: 40.0, pct: -1.3 },
];
const DPL = [
  { d: "04", pnl: 105 }, { d: "05", pnl: -10460 }, { d: "06", pnl: 31493 },
  { d: "07", pnl: 0 }, { d: "08", pnl: 0 }, { d: "09", pnl: 6400 },
  { d: "10", pnl: 9359 }, { d: "11", pnl: 9159 }, { d: "12", pnl: 10774 },
  { d: "13", pnl: -17136 },
];

/* ── Helpers ── */
const usd = (n: number, sign = true) => {
  const a = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (!sign) return `$${a}`;
  return n >= 0 ? `+$${a}` : `-$${a}`;
};

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-[11px] shadow-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <p className="mb-1" style={{ color: T.t3 }}>Feb {label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-medium tabular-nums" style={{ color: p.color || T.t1 }}>{p.name}: ${Number(p.value).toLocaleString()}</p>
      ))}
    </div>
  );
}

function TRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between py-[4px] md:py-[6px]" style={{ borderBottom: `1px solid ${T.borderLight}` }}>
      <span className="text-[9px] md:text-[11px]" style={{ color: T.t2 }}>{label}</span>
      <span className="text-[9px] md:text-[11px] font-medium tabular-nums" style={{ color: color || T.t1 }}>{value}</span>
    </div>
  );
}

/* ── Watchlist row (from original) ── */
const SYMBOL_COLORS: Record<string, string> = {
  NVDA: '#76B900', AAPL: '#555555', TSLA: '#CC0000', MSFT: '#00A4EF',
  GOOGL: '#4285F4', AMZN: '#FF9900', META: '#0668E1', AMD: '#ED1C24',
  'BTC/USDT': '#F7931A', 'ETH/USDT': '#627EEA',
};

/* ═══ PAGE ═══ */
export default function Dashboard() {
  const [live, setLive] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const { lastMessage, isConnected } = useWebSocket();
  const router = useRouter();
  const { t } = useI18n();

  // Fetch live MT5 data from EA push endpoint
  const fetchMt5 = () => {
    fetch("/api/mt5/stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.live) setLive(d); })
      .catch(() => {});
  };

  const fetchAll = () => {
    fetchMt5();
    api.getDashboard().then(setData).catch(() => {});
    api.getTrades({ page: 1, page_size: 5 }).then((d) => setTrades(d.trades || [])).catch(() => {});
    api.getWatchlist().then(setWatchlist).catch(() => {});
  };

  useEffect(() => { fetchAll(); const iv = setInterval(fetchAll, 30000); return () => clearInterval(iv); }, []);
  useEffect(() => {
    if (lastMessage && ["trade_update","position_update","scan_status"].includes(lastMessage.type)) fetchAll();
  }, [lastMessage]);

  // Use live data if available, otherwise static fallback
  const isLive = !!live;
  const acct = live?.account || {};
  const perf = live?.performance || {};
  const m = {
    id: isLive ? acct.id : MT5.id,
    period: isLive ? `Live · ${acct.server || ""}` : MT5.period,
    deposit: isLive ? acct.deposit : MT5.deposit,
    balance: isLive ? acct.balance : MT5.balance,
    equity: isLive ? acct.equity : MT5.equity,
    fp: isLive ? acct.floatingPnl : MT5.fp,
    fm: isLive ? acct.freeMargin : MT5.fm,
    ml: isLive ? acct.marginLevel : MT5.ml,
    np: isLive ? perf.netProfit : MT5.np,
    npPct: isLive ? perf.netProfitPct : MT5.npPct,
    trades: isLive ? perf.totalTrades : MT5.trades,
    wr: isLive ? perf.winRate : MT5.wr,
    pf: isLive ? perf.profitFactor : MT5.pf,
    sharpe: isLive ? perf.sharpe : MT5.sharpe,
    avgW: isLive ? perf.avgWin : MT5.avgW,
    avgL: isLive ? perf.avgLoss : MT5.avgL,
    bestT: isLive ? perf.bestTrade : MT5.bestT,
    worstT: isLive ? perf.worstTrade : MT5.worstT,
    gp: isLive ? perf.grossProfit : MT5.gp,
    gl: isLive ? perf.grossLoss : MT5.gl,
    comm: isLive ? perf.commission : MT5.comm,
    swap: isLive ? perf.swap : MT5.swap,
    hold: isLive ? perf.avgHold : MT5.hold,
    wsMax: isLive ? perf.winStreak : MT5.wsMax,
    lsMax: isLive ? perf.lossStreak : MT5.lsMax,
    wins: isLive ? perf.wins : 156,
    losses: isLive ? perf.losses : 49,
  };
  const eq = isLive ? live.charts.equityCurve : EQ;
  const dpl = isLive ? live.charts.dailyPnl : DPL;
  const inst = isLive ? live.instruments : INST;

  const rr = (m.avgW / Math.abs(m.avgL || 1)).toFixed(2);
  const exp = (m.avgW * m.wr / 100 + m.avgL * (100 - m.wr) / 100).toFixed(0);

  return (
    <div className="min-h-screen page-enter" style={{ background: T.bg, color: T.t1 }}>
      <div className="max-w-[1320px] mx-auto px-3 md:px-8 py-4 md:py-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 md:mb-5 gap-2">
          <div className="min-w-0">
            <h1 className="text-[15px] md:text-[18px] font-semibold tracking-tight" style={{ color: T.white }}>LINBAY</h1>
            <p className="text-[10px] md:text-[11px] mt-0.5 truncate" style={{ color: T.t2 }}>#{m.id} · {m.period}{isLive ? " 🟢" : ""}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "animate-live-blink" : ""}`} style={{ background: isConnected ? T.green : T.red }} />
              <span className="text-[10px] font-medium uppercase tracking-wider hidden md:inline" style={{ color: T.t3 }}>{isConnected ? "Live" : "Offline"}</span>
            </div>
            <button onClick={() => router.push('/performance/mt5')} className="text-[10px] md:text-[11px] font-medium px-2.5 md:px-3 py-1.5 rounded-lg transition-colors hover:opacity-80 whitespace-nowrap"
              style={{ color: T.t2, background: T.surface, border: `1px solid ${T.border}` }}>
              Report →
            </button>
          </div>
        </div>

        {/* ══ Row 1: 6 KPI ══ */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-3 mb-3 md:mb-4">
          {[
            { l: "Net Profit", v: usd(m.np), c: m.np >= 0 ? T.green : T.red, sub: `$${(m.deposit/1000).toFixed(0)}K → $${(m.balance/1000).toFixed(0)}K`, subD: `${usd(m.deposit,false)} → ${usd(m.balance,false)}` },
            { l: "Return", v: `${m.npPct >= 0 ? "+" : ""}${m.npPct}%`, c: m.npPct >= 0 ? T.green : T.red, sub: `$${(m.deposit/1000).toFixed(0)}K capital`, subD: `On ${usd(m.deposit,false)} capital` },
            { l: "Win Rate", v: `${m.wr}%`, c: T.t1, sub: `${m.wins}W · ${m.losses}L`, subD: `${m.wins}W · ${m.losses}L` },
            { l: "PF", v: `${m.pf}`, c: T.t1, sub: "Profit Factor", subD: `${usd(m.gp,false)} / ${usd(Math.abs(m.gl),false)}` },
            { l: "Sharpe", v: `${m.sharpe}`, c: T.t1, sub: "Risk-adj.", subD: "Risk-adjusted return" },
            { l: "Trades", v: `${m.trades}`, c: T.t1, sub: m.hold, subD: m.hold + " avg hold" },
          ].map((k, i) => (
            <div key={i} className="rounded-lg md:rounded-[10px] px-2.5 py-2 md:p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[8px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.12em] mb-1 md:mb-2" style={{ color: T.t2 }}>{k.l}</p>
              <p className="text-[15px] md:text-[22px] font-semibold tabular-nums leading-none tracking-tight" style={{ color: k.c }}>{k.v}</p>
              <p className="text-[9px] mt-2 tabular-nums truncate hidden md:block" style={{ color: T.t3 }}>{k.subD}</p>
            </div>
          ))}
        </div>

        {/* ══ Row 2: Equity (2/3) + Daily P&L (1/3) ══ */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-2 md:gap-3 mb-4">
          <div className="rounded-lg md:rounded-[10px] p-3 md:p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] md:text-[12px] font-medium" style={{ color: T.t2 }}>Return Rate</p>
              <div className="flex gap-4 text-[9px]" style={{ color: T.t3 }}>
                <span className="flex items-center gap-1.5"><span className="block w-3 h-[2px] rounded-full" style={{ background: T.line }} />Balance %</span>
                <span className="flex items-center gap-1.5"><span className="block w-3 h-[2px] rounded-full opacity-30" style={{ background: T.t2 }} />Equity %</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={eq.map((p: any) => ({ ...p, bPct: ((p.b - m.deposit) / m.deposit * 100), ePct: ((p.e - m.deposit) / m.deposit * 100) }))} margin={{ top: 8, right: 4, bottom: 0, left: -4 }}>
                <defs>
                  <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.line} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={T.line} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={T.borderLight} vertical={false} />
                <XAxis dataKey="d" stroke="transparent" fontSize={9} tick={{ fill: T.t3 }} tickLine={false} axisLine={false} dy={4} />
                <YAxis stroke="transparent" fontSize={9} tick={{ fill: T.t3 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="bPct" name="Balance %" stroke={T.line} strokeWidth={1.5} fill="url(#gL)" dot={false}
                      activeDot={{ r: 3, fill: T.line, stroke: T.surface, strokeWidth: 2 }} />
                <Area type="monotone" dataKey="ePct" name="Equity %" stroke={T.t3} strokeWidth={1} fill="none" dot={false} strokeDasharray="3 3" opacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg md:rounded-[10px] p-3 md:p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[11px] md:text-[12px] font-medium mb-1" style={{ color: T.t2 }}>Daily P&L</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dpl} margin={{ top: 8, right: 0, bottom: 0, left: -8 }}>
                <CartesianGrid stroke={T.borderLight} vertical={false} />
                <XAxis dataKey="d" stroke="transparent" fontSize={9} tick={{ fill: T.t3 }} tickLine={false} axisLine={false} dy={4} />
                <YAxis stroke="transparent" fontSize={9} tick={{ fill: T.t3 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="pnl" name="P&L" radius={[3, 3, 0, 0]} maxBarSize={24}>
                  {dpl.map((d: any, i: number) => <Cell key={i} fill={d.pnl >= 0 ? T.green : T.red} fillOpacity={0.65} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ══ Row 3: Account + Stats + P&L + Instruments ══ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5 md:gap-3 mb-4">
          <div className="rounded-lg md:rounded-[10px] p-3 md:p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.12em] mb-2 md:mb-3 pb-1.5 md:pb-2" style={{ color: T.t3, borderBottom: `1px solid ${T.borderLight}` }}>Account</p>
            <TRow label="Deposit" value={usd(m.deposit, false)} />
            <TRow label="Balance" value={usd(m.balance, false)} />
            <TRow label="Equity" value={usd(m.equity, false)} />
            <TRow label="Floating P/L" value={usd(m.fp)} color={T.red} />
            <TRow label="Free Margin" value={usd(m.fm, false)} />
            <TRow label="Margin Level" value={m.ml} />
          </div>

          <div className="rounded-lg md:rounded-[10px] p-3 md:p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.12em] mb-2 md:mb-3 pb-1.5 md:pb-2" style={{ color: T.t3, borderBottom: `1px solid ${T.borderLight}` }}>Statistics</p>
            <TRow label="Total Trades" value={`${m.trades}`} />
            <TRow label="Wins / Losses" value="156 / 49" />
            <TRow label="Win Rate" value={`${m.wr}%`} />
            <TRow label="Avg Win" value={usd(m.avgW)} color={T.green} />
            <TRow label="Avg Loss" value={usd(m.avgL)} color={T.red} />
            <TRow label="R:R Ratio" value={`1 : ${rr}`} />
            <TRow label="Expectancy" value={`$${exp}`} color={T.green} />
            <TRow label="Win Streak" value={`${m.wsMax}`} />
            <TRow label="Loss Streak" value={`${m.lsMax}`} />
            <TRow label="Avg Hold" value={m.hold} />
          </div>

          <div className="rounded-lg md:rounded-[10px] p-3 md:p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.12em] mb-2 md:mb-3 pb-1.5 md:pb-2" style={{ color: T.t3, borderBottom: `1px solid ${T.borderLight}` }}>P&L</p>
            <TRow label="Gross Profit" value={usd(m.gp)} color={T.green} />
            <TRow label="Gross Loss" value={usd(m.gl)} color={T.red} />
            <TRow label="Swap" value={usd(m.swap)} color={T.green} />
            <TRow label="Commission" value={usd(m.comm)} color={T.red} />
            <div className="my-2" style={{ borderTop: `1px solid ${T.border}` }} />
            <TRow label="Net Profit" value={usd(m.np)} color={T.green} />
            <TRow label="Return Rate" value={`+${m.npPct}%`} color={T.green} />
            <div className="my-2" style={{ borderTop: `1px solid ${T.border}` }} />
            <TRow label="Best Trade" value={usd(m.bestT)} color={T.green} />
            <TRow label="Worst Trade" value={usd(m.worstT)} color={T.red} />
            <TRow label="Profit Factor" value={`${m.pf}`} />
          </div>

          <div className="rounded-lg md:rounded-[10px] p-3 md:p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.12em] mb-2 md:mb-3 pb-1.5 md:pb-2" style={{ color: T.t3, borderBottom: `1px solid ${T.borderLight}` }}>Instruments</p>
            {inst.map((x: any) => (
              <div key={x.sym} className="py-[4px] md:py-[6px]" style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                <div className="flex justify-between items-center mb-0.5 md:mb-1">
                  <div className="min-w-0 truncate">
                    <span className="text-[9px] md:text-[11px] font-medium" style={{ color: T.t1 }}>{x.sym}</span>
                    <span className="text-[7px] md:text-[9px] ml-1 md:ml-1.5 hidden md:inline" style={{ color: T.t3 }}>{x.name}</span>
                  </div>
                  <span className="text-[9px] md:text-[11px] font-medium tabular-nums shrink-0 ml-1" style={{ color: x.pnl >= 0 ? T.green : T.red }}>{usd(x.pnl)}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex-1 h-[2px] md:h-[3px] rounded-full overflow-hidden" style={{ background: T.borderLight }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(x.pct, 0)}%`, background: T.line, opacity: 0.4 }} />
                  </div>
                  <div className="flex gap-1.5 md:gap-2 text-[8px] md:text-[9px] tabular-nums shrink-0" style={{ color: T.t3 }}>
                    <span>{x.n}t</span>
                    <span>{x.wr}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 pb-20 md:pb-4" style={{ borderTop: `1px solid ${T.borderLight}` }}>
          <p className="text-[8px] md:text-[9px] uppercase tracking-[0.15em]" style={{ color: T.t3 }}>LINBAY</p>
          <p className="text-[8px] md:text-[9px] uppercase tracking-[0.15em]" style={{ color: T.t3 }}>{m.period}</p>
        </div>
      </div>
    </div>
  );
}
