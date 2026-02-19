"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const MARKET_TAG: Record<string, string> = {
  us: "bg-[rgba(0,255,240,0.15)] text-accent-green border border-accent-green/30",
  cn: "bg-[rgba(255,215,0,0.15)] text-accent-gold border border-accent-gold/30",
  crypto: "bg-[rgba(191,90,242,0.15)] text-accent-purple border border-accent-purple/30",
};

export default function Admin() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newMarket, setNewMarket] = useState("us");

  const reload = () => {
    api.getWatchlist().then(setWatchlist).catch(console.error);
    api.getConfig().then(setConfigs).catch(console.error);
  };
  useEffect(reload, []);

  const addSymbol = async () => {
    if (!newSymbol.trim()) return;
    await api.addWatchlist({ symbol: newSymbol.trim().toUpperCase(), market: newMarket });
    setNewSymbol("");
    reload();
  };

  const removeSymbol = async (id: number) => {
    await api.removeWatchlist(id);
    reload();
  };

  const updateConfig = async (key: string, value: string) => {
    await api.updateConfig({ key, value });
    reload();
  };

  return (
    <div className="space-y-8">
      {/* Warning bar */}
      <div className="bg-[rgba(255,0,64,0.1)] border border-[rgba(255,0,64,0.3)] rounded-lg px-4 py-2 flex items-center gap-2">
        <span className="text-accent-red text-sm">⚠</span>
        <span className="text-xs text-accent-red font-bold tracking-[0.15em] uppercase">ADMIN PANEL — AUTHORIZED ACCESS ONLY</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-wide">Admin</h1>
        <p className="text-xs text-muted tracking-[0.2em] uppercase mt-0.5">SYSTEM CONFIGURATION</p>
      </div>

      {/* Watchlist */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-lg mb-4 font-semibold tracking-wide">WATCHLIST · UNIVERSE</h2>
        <div className="flex gap-2 mb-4">
          <input
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSymbol()}
            placeholder="Symbol (e.g. AAPL)"
            className="bg-[#0a0a1a] border border-[rgba(0,255,240,0.2)] rounded-lg px-3 py-2 text-sm flex-1 focus:border-accent-green focus:shadow-neon-cyan outline-none transition-all"
          />
          <select
            value={newMarket}
            onChange={(e) => setNewMarket(e.target.value)}
            className="bg-[#0a0a1a] border border-[rgba(0,255,240,0.2)] rounded-lg px-3 py-2 text-sm focus:border-accent-green outline-none"
          >
            <option value="us">🇺🇸 US</option>
            <option value="cn">🇨🇳 CN</option>
            <option value="crypto">₿ CRYPTO</option>
          </select>
          <button
            onClick={addSymbol}
            className="glow-btn bg-accent-green/20 text-accent-green border border-accent-green/40 px-5 py-2 rounded-lg text-sm font-bold"
          >
            + ADD
          </button>
        </div>
        <div className="space-y-1">
          {watchlist.map((w) => (
            <div key={w.id} className="flex items-center justify-between p-2.5 hover:bg-[rgba(0,255,240,0.05)] rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white">{w.symbol}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${MARKET_TAG[w.market] || ""}`}>
                  {w.market === "us" ? "🇺🇸 US" : w.market === "cn" ? "🇨🇳 CN" : "₿ CRYPTO"}
                </span>
                <span className={`text-xs font-bold ${w.status === "active" ? "text-accent-green neon-text" : "text-muted"}`}>
                  {w.status}
                </span>
              </div>
              <button
                onClick={() => removeSymbol(w.id)}
                className="text-accent-red text-sm font-bold hover:shadow-neon-red px-2 py-1 rounded border border-transparent hover:border-accent-red/30 transition-all"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Config */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-lg mb-4 font-semibold tracking-wide">RISK PARAMETERS</h2>
        <div className="space-y-4">
          {configs.map((c) => {
            const numVal = parseFloat(c.value);
            const isNumeric = !isNaN(numVal);
            return (
              <div key={c.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{c.description || c.key}</div>
                    <div className="text-[10px] text-muted tracking-wider uppercase">{c.key}</div>
                  </div>
                  <input
                    defaultValue={c.value}
                    onBlur={(e) => {
                      if (e.target.value !== c.value) updateConfig(c.key, e.target.value);
                    }}
                    className="bg-[#0a0a1a] border border-[rgba(0,255,240,0.2)] rounded px-3 py-1.5 text-sm w-32 text-right focus:border-accent-green focus:shadow-neon-cyan outline-none transition-all tabular-nums"
                  />
                </div>
                {isNumeric && numVal <= 100 && numVal >= 0 && (
                  <div className="h-1 rounded-full bg-[rgba(0,255,240,0.1)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent-green/50"
                      style={{ width: `${Math.min(numVal, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
