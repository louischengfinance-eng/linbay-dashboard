"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const ALERT_TYPES = [
  { value: "price_above", label: "Price Above" },
  { value: "price_below", label: "Price Below" },
  { value: "rsi_above", label: "RSI Above" },
  { value: "rsi_below", label: "RSI Below" },
  { value: "change_pct", label: "Change % ≥" },
];

function getTVSymbol(symbol: string, market: string): string {
  if (market === "cn") {
    const code = symbol.split(".")[0];
    const suffix = symbol.split(".")[1];
    return suffix === "SH" || suffix === "SS" ? `SSE:${code}` : `SZSE:${code}`;
  }
  if (market === "crypto") return `BINANCE:${symbol.replace("/", "")}`;
  return symbol;
}

export default function StockDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const symbol = params.symbol as string;
  const market = searchParams.get("market") || "us";

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertForm, setAlertForm] = useState({ alert_type: "price_above", threshold: "" });
  const [alertMsg, setAlertMsg] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    setLoading(true);
    setError("");
    api.getStockDetail(symbol, market)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol, market]);

  const tvSymbol = getTVSymbol(symbol, market);
  const tvWidgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=${encodeURIComponent(tvSymbol)}&interval=D&symboledit=0&saveimage=1&toolbarbg=000000&studies=MASimple%40tv-basicstudies%1FRSI%40tv-basicstudies%1FMACD%40tv-basicstudies&theme=dark&style=1&timezone=Asia%2FTokyo&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=zh_CN&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-[#8E8E93] text-lg animate-pulse">Loading {symbol}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-[#FF453A] text-lg">{error}</div>
      </div>
    );
  }

  if (!detail) return null;

  const { indicators, fundamentals, ai } = detail;

  return (
    <div className="space-y-3 pb-28">
      {/* Header */}
      <div className="pt-2">
        <div className="text-[11px] text-[#8E8E93] uppercase tracking-[0.5px] font-medium mb-0.5">
          {market === "us" ? t("stock.us_equity") : market === "cn" ? t("stock.cn_equity") : t("stock.crypto")}
        </div>
        <h1 className="text-xl font-bold text-white">
          {detail.name || symbol}
          <span className="text-[#8E8E93] text-sm ml-2 font-normal">{symbol}</span>
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[28px] font-bold tabular-nums text-white">${detail.price}</span>
          <span className={`text-[16px] font-semibold ${detail.change_pct >= 0 ? "text-[#30D158]" : "text-[#FF453A]"}`}>
            {detail.change_pct >= 0 ? "▲" : "▼"} {detail.change_pct >= 0 ? "+" : ""}{detail.change_pct}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#1C1C1E] rounded-[16px] p-3">
        <iframe src={tvWidgetUrl} className="w-full rounded-[12px]" style={{ height: "380px", border: "none" }} allowFullScreen />
      </div>

      {/* Technical Indicators — pill tags */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Pill label="RSI(14)" value={indicators.rsi} color={indicators.rsi > 70 ? "#FF453A" : indicators.rsi < 30 ? "#30D158" : "#FFFFFF"} />
        <Pill label="MACD" value={indicators.macd_signal === "bullish" ? "Bullish" : indicators.macd_signal === "bearish" ? "Bearish" : "Neutral"}
          color={indicators.macd_signal === "bullish" ? "#30D158" : indicators.macd_signal === "bearish" ? "#FF453A" : "#8E8E93"} />
        <Pill label="BB" value={`${(indicators.bb_position * 100).toFixed(0)}%`} color="#FF9F0A" />
        <Pill label="Vol" value={`${indicators.volume_ratio}x`} color={indicators.volume_ratio > 2 ? "#FF9F0A" : "#FFFFFF"} />
      </div>

      {/* Moving Averages */}
      <div className="bg-[#1C1C1E] rounded-[16px] p-4">
        <h2 className="text-[13px] font-semibold text-white mb-3">{t("stock.moving_avg")}</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "MA5", value: indicators.ma5 },
            { label: "MA20", value: indicators.ma20 },
            { label: "MA60", value: indicators.ma60 },
          ].map((ma) => (
            <div key={ma.label} className="text-center">
              <div className="text-[11px] text-[#8E8E93] mb-0.5">{ma.label}</div>
              <div className={`text-sm font-semibold tabular-nums ${detail.price > ma.value ? "text-[#30D158]" : "text-[#FF453A]"}`}>
                {ma.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis — badge style */}
      <div className="bg-[#1C1C1E] rounded-[16px] p-4">
        <h2 className="text-[13px] font-semibold text-white mb-3">{t("stock.ai_analysis")}</h2>
        <div className="flex items-center gap-3">
          <div className={`text-lg font-bold px-4 py-2 rounded-full ${
            ai.action === "buy" ? "bg-[rgba(48,209,88,0.15)] text-[#30D158]" :
            ai.action === "sell" ? "bg-[rgba(255,69,58,0.15)] text-[#FF453A]" :
            "bg-[#2C2C2E] text-[#8E8E93]"
          }`}>
            {ai.action.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] text-[#8E8E93]">{t("stock.confidence")}</span>
              <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${ai.confidence * 100}%`, background: ai.action === "buy" ? "#30D158" : ai.action === "sell" ? "#FF453A" : "#8E8E93" }} />
              </div>
              <span className="text-sm font-bold text-white tabular-nums">{(ai.confidence * 100).toFixed(0)}%</span>
            </div>
            <p className="text-[12px] text-[#8E8E93] leading-relaxed line-clamp-3">{ai.reason}</p>
          </div>
        </div>
      </div>

      {/* Fundamentals */}
      {fundamentals && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { label: "P/E Ratio", value: fundamentals.pe ? fundamentals.pe.toFixed(1) : "N/A" },
            { label: "EPS", value: fundamentals.eps ? `$${fundamentals.eps.toFixed(2)}` : "N/A" },
            { label: "Market Cap", value: fundamentals.market_cap ? `$${(fundamentals.market_cap / 1e9).toFixed(1)}B` : "N/A" },
            { label: "52W High", value: fundamentals.week52_high ? `$${fundamentals.week52_high.toFixed(2)}` : "N/A" },
            { label: "52W Low", value: fundamentals.week52_low ? `$${fundamentals.week52_low.toFixed(2)}` : "N/A" },
          ].map((f) => (
            <div key={f.label} className="bg-[#1C1C1E] rounded-[16px] p-3">
              <div className="text-[10px] text-[#8E8E93] uppercase tracking-[0.5px] font-medium mb-0.5">{f.label}</div>
              <div className="text-[16px] font-bold text-white tabular-nums">{f.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Set Alert */}
      <div className="bg-[#1C1C1E] rounded-[16px] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-white">{t("stock.set_alert")}</h2>
          <button onClick={() => setShowAlertForm(!showAlertForm)}
            className="px-3 py-1.5 rounded-full bg-[rgba(48,209,88,0.15)] text-[#30D158] font-semibold text-xs hover:bg-[rgba(48,209,88,0.25)] transition-all">
            {showAlertForm ? "Cancel" : "+ Alert"}
          </button>
        </div>
        {showAlertForm && (
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-[10px] text-[#8E8E93] block mb-1">Type</label>
              <select value={alertForm.alert_type} onChange={(e) => setAlertForm({ ...alertForm, alert_type: e.target.value })}
                className="bg-[#2C2C2E] rounded-[12px] px-3 py-2 text-white text-xs border-none outline-none">
                {ALERT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#8E8E93] block mb-1">Threshold</label>
              <input type="number" step="any" value={alertForm.threshold} onChange={(e) => setAlertForm({ ...alertForm, threshold: e.target.value })}
                className="bg-[#2C2C2E] rounded-[12px] px-3 py-2 text-white text-xs w-28 border-none outline-none" placeholder="e.g. 150" />
            </div>
            <button onClick={async () => {
              if (!alertForm.threshold) return;
              await api.createAlert({ symbol, market, alert_type: alertForm.alert_type, threshold: parseFloat(alertForm.threshold) });
              setAlertMsg("✅ Alert created!");
              setShowAlertForm(false);
              setTimeout(() => setAlertMsg(""), 3000);
            }} className="px-4 py-2 rounded-full bg-[#30D158] text-black font-bold text-xs">Create</button>
            {alertMsg && <span className="text-[#30D158] text-xs">{alertMsg}</span>}
          </div>
        )}
      </div>

      {/* News */}
      {detail.news && detail.news.length > 0 && (
        <div className="bg-[#1C1C1E] rounded-[16px] p-4">
          <h2 className="text-[13px] font-semibold text-white mb-3">{t("stock.latest_news")}</h2>
          <div className="space-y-0">
            {detail.news.map((item: any, i: number) => (
              <div key={i}>
                {i > 0 && <div className="h-px bg-[rgba(255,255,255,0.06)]" />}
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  className="block py-3 group">
                  <div className="text-[14px] font-medium text-white group-hover:text-[#30D158] transition-colors line-clamp-1">{item.title}</div>
                  <div className="text-[11px] text-[#8E8E93] mt-0.5">
                    {item.publisher} · {item.published_at ? new Date(item.published_at).toLocaleDateString() : ""}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="flex-shrink-0 bg-[#1C1C1E] rounded-full px-3 py-1.5 flex items-center gap-1.5">
      <span className="text-[10px] text-[#8E8E93] font-medium">{label}</span>
      <span className="text-[13px] font-bold tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}
