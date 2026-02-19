"use client";
import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";

export default function NewsPage() {
  const { t, lang } = useI18n();

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">{t("news.title")}</h1>
      </div>

      {/* TradingView Timeline Widget */}
      <div className="bg-[#1C1C1E] rounded-[16px] overflow-hidden">
        <TimelineWidget lang={lang} feedMode="market" market="stock" height={700} />
      </div>

      <div className="bg-[#1C1C1E] rounded-[16px] overflow-hidden">
        <TimelineWidget lang={lang} feedMode="market" market="crypto" height={500} />
      </div>
    </div>
  );
}

function TimelineWidget({ lang, feedMode, market, height }: { lang: string; feedMode: string; market: string; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.textContent = JSON.stringify({
      feedMode,
      market,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height,
      locale: lang === "zh" ? "zh_CN" : "en",
    });

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [lang, feedMode, market, height]);

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ minHeight: height }} />
  );
}
