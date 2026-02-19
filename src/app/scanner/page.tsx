"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { SkeletonTable } from "@/components/Skeleton";
import { useI18n } from "@/lib/i18n";

export default function ScannerPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState<any>(null);
  const router = useRouter();

  const { t } = useI18n();

  const fetch = () => {
    setLoading(true);
    api.getHotScanner().then(setData).catch(console.error).finally(() => setLoading(false));
    api.getSentiment().then(setSentiment).catch(console.error);
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{t("markets.title")}</h1>
          <p className="text-[11px] text-[#8E8E93] tracking-wide mt-0.5">{t("markets.subtitle")}</p>
        </div>
        <button onClick={fetch}
          className="px-4 py-2 rounded-[12px] bg-[#1C1C1E] text-[#30D158] text-xs font-semibold hover:bg-[#2C2C2E] transition-all self-start sm:self-auto">
          ⟳ {t("markets.refresh")}
        </button>
      </div>

      {/* Fear & Greed */}
      {sentiment && <SentimentBar sentiment={sentiment} t={t} />}

      {loading ? (
        <SkeletonTable rows={8} cols={8} />
      ) : data.length === 0 ? (
        <div className="bg-[#1C1C1E] rounded-[16px] py-16 text-center">
          <p className="text-[#8E8E93] text-sm">{t("markets.no_signals")}</p>
          <p className="text-[#48484A] text-xs mt-1">{t("markets.monitoring")}</p>
        </div>
      ) : (
        <>
        {/* Desktop table */}
        <div className="bg-[#1C1C1E] rounded-[16px] overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] text-[#8E8E93] text-[11px] uppercase tracking-wider font-medium">
                  <th className="text-left p-4">Symbol</th>
                  <th className="text-right p-4">{t("markets.price")}</th>
                  <th className="text-right p-4">{t("markets.change")}</th>
                  <th className="text-right p-4">RSI</th>
                  <th className="text-center p-4">MACD</th>
                  <th className="text-right p-4">Vol Ratio</th>
                  <th className="text-right p-4">Score</th>
                  <th className="text-left p-4">Signals</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.symbol} onClick={() => router.push(`/stock/${row.symbol}?market=us`)}
                    className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[#2C2C2E] cursor-pointer transition-colors">
                    <td className="p-4 font-semibold text-white">{row.symbol}</td>
                    <td className="p-4 text-right tabular-nums text-white">${row.price}</td>
                    <td className={`p-4 text-right font-semibold tabular-nums ${row.change_pct >= 0 ? "text-[#30D158]" : "text-[#FF453A]"}`}>
                      {row.change_pct >= 0 ? "+" : ""}{row.change_pct}%
                    </td>
                    <td className={`p-4 text-right font-semibold tabular-nums ${row.rsi > 70 ? "text-[#FF453A]" : row.rsi < 30 ? "text-[#30D158]" : "text-white"}`}>
                      {row.rsi}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        row.macd_signal === "bullish" ? "bg-[rgba(48,209,88,0.15)] text-[#30D158]" :
                        row.macd_signal === "bearish" ? "bg-[rgba(255,69,58,0.15)] text-[#FF453A]" : "text-[#8E8E93]"
                      }`}>
                        {row.macd_signal === "bullish" ? "Bullish" : row.macd_signal === "bearish" ? "Bearish" : "—"}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-semibold tabular-nums ${row.volume_ratio > 2 ? "text-[#FF9F0A]" : "text-white"}`}>
                      {row.volume_ratio}x
                    </td>
                    <td className="p-4 text-right font-bold text-[#30D158]">{row.score}</td>
                    <td className="p-4 text-xs text-[#8E8E93]">{row.signals?.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Mobile card list */}
        <div className="space-y-3 md:hidden">
          {data.map((row: any) => (
            <div key={row.symbol} onClick={() => router.push(`/stock/${row.symbol}?market=us`)}
              className="bg-[#1C1C1E] rounded-[16px] p-4 cursor-pointer active:bg-[#2C2C2E] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white text-base">{row.symbol}</span>
                <span className="font-bold text-[#30D158] text-lg">{row.score}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-[#8E8E93]">{t("markets.price")}</span><div className="text-white tabular-nums">${row.price}</div></div>
                <div><span className="text-[#8E8E93]">{t("markets.change")}</span><div className={`font-semibold tabular-nums ${row.change_pct >= 0 ? "text-[#30D158]" : "text-[#FF453A]"}`}>{row.change_pct >= 0 ? "+" : ""}{row.change_pct}%</div></div>
                <div><span className="text-[#8E8E93]">RSI</span><div className={`font-semibold tabular-nums ${row.rsi > 70 ? "text-[#FF453A]" : row.rsi < 30 ? "text-[#30D158]" : "text-white"}`}>{row.rsi}</div></div>
                <div><span className="text-[#8E8E93]">MACD</span><div className={row.macd_signal === "bullish" ? "text-[#30D158]" : row.macd_signal === "bearish" ? "text-[#FF453A]" : "text-[#8E8E93]"}>{row.macd_signal === "bullish" ? "Bullish" : row.macd_signal === "bearish" ? "Bearish" : "—"}</div></div>
                <div><span className="text-[#8E8E93]">{t("markets.vol")}</span><div className={`font-semibold tabular-nums ${row.volume_ratio > 2 ? "text-[#FF9F0A]" : "text-white"}`}>{row.volume_ratio}x</div></div>
              </div>
              {row.signals?.length > 0 && (
                <div className="mt-2 text-[10px] text-[#8E8E93]">{row.signals.join(" · ")}</div>
              )}
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}

function SentimentBar({ sentiment, t }: { sentiment: any; t: (k: string) => string }) {
  const score = sentiment.score;
  const getColor = (s: number) => {
    if (s < 25) return "#FF453A";
    if (s < 55) return "#FF9F0A";
    return "#30D158";
  };
  const color = getColor(score);

  return (
    <div className="bg-[#1C1C1E] rounded-[16px] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-semibold text-white">{t("markets.fear_greed")}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tabular-nums" style={{ color }}>{score}</span>
          <span className="text-xs font-medium" style={{ color }}>{sentiment.label}</span>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      {sentiment.factors?.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {sentiment.factors.map((f: any) => (
            <div key={f.name} className="flex-shrink-0 text-center px-3 py-1.5 rounded-[10px] bg-[#2C2C2E]">
              <div className="text-[9px] text-[#8E8E93]">{f.name}</div>
              <div className="text-xs font-bold text-white tabular-nums">{f.value}{f.max ? `/${f.max}` : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
