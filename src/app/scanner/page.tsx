"use client";
import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";

export default function ScannerPage() {
  const { t, lang } = useI18n();

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">{t("markets.title")}</h1>
        <p className="text-[11px] text-[#8E8E93] tracking-wide mt-0.5">{t("markets.subtitle")}</p>
      </div>

      {/* Market Overview */}
      <div className="bg-[#1C1C1E] rounded-[16px] overflow-hidden">
        <TradingViewWidget
          widgetType="market-overview"
          lang={lang}
          height={500}
        />
      </div>

      {/* Screener */}
      <div className="bg-[#1C1C1E] rounded-[16px] overflow-hidden">
        <TradingViewWidget
          widgetType="screener"
          lang={lang}
          height={600}
        />
      </div>
    </div>
  );
}

function TradingViewWidget({ widgetType, lang, height }: { widgetType: "market-overview" | "screener"; lang: string; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.async = true;

    if (widgetType === "market-overview") {
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
      script.textContent = JSON.stringify({
        colorTheme: "dark",
        dateRange: "12M",
        showChart: true,
        locale: lang === "zh" ? "zh_CN" : "en",
        largeChartUrl: "",
        isTransparent: true,
        showSymbolLogo: true,
        showFloatingTooltip: false,
        width: "100%",
        height: height,
        tabs: [
          {
            title: "Indices",
            symbols: [
              { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
              { s: "FOREXCOM:NSXUSD", d: "US 100" },
              { s: "FOREXCOM:DJI", d: "Dow 30" },
              { s: "INDEX:NKY", d: "Nikkei 225" },
              { s: "INDEX:HSI", d: "Hang Seng" },
            ],
          },
          {
            title: "Forex",
            symbols: [
              { s: "FX:EURUSD", d: "EUR to USD" },
              { s: "FX:GBPUSD", d: "GBP to USD" },
              { s: "FX:USDJPY", d: "USD to JPY" },
              { s: "FX:AUDUSD", d: "AUD to USD" },
              { s: "FX:USDCNH", d: "USD to CNH" },
            ],
          },
          {
            title: "Crypto",
            symbols: [
              { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
              { s: "BINANCE:ETHUSDT", d: "Ethereum" },
              { s: "BINANCE:SOLUSDT", d: "Solana" },
              { s: "BINANCE:XRPUSDT", d: "XRP" },
            ],
          },
        ],
      });
    } else {
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
      script.textContent = JSON.stringify({
        width: "100%",
        height: height,
        defaultColumn: "overview",
        defaultScreen: "most_capitalized",
        market: "america",
        showToolbar: true,
        colorTheme: "dark",
        locale: lang === "zh" ? "zh_CN" : "en",
        isTransparent: true,
      });
    }

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [widgetType, lang, height]);

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ minHeight: height }} />
  );
}
