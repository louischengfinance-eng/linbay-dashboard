"use client";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/useWebSocket";
import { useI18n } from "@/lib/i18n";

type MarketStatus = "Open" | "Closed" | "Pre-market" | "Pre-open" | "After-hours";

function getMarketStatus() {
  const now = new Date();
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  const utcTime = utcH * 60 + utcM;
  const day = now.getUTCDay();

  const etTime = ((utcTime - 300) + 1440) % 1440;
  let us: MarketStatus = "Closed";
  if (day >= 1 && day <= 5) {
    if (etTime >= 240 && etTime < 570) us = "Pre-market";
    else if (etTime >= 570 && etTime < 960) us = "Open";
    else if (etTime >= 960 && etTime < 1200) us = "After-hours";
  }

  const cstTime = (utcTime + 480) % 1440;
  let cn: MarketStatus = "Closed";
  if (day >= 1 && day <= 5) {
    if ((cstTime >= 570 && cstTime < 690) || (cstTime >= 780 && cstTime < 900)) cn = "Open";
    else if (cstTime >= 555 && cstTime < 570) cn = "Pre-open" as MarketStatus;
  }

  return { us, cn, crypto: "24/7" as const };
}

const statusI18nMap: Record<string, string> = {
  "Open": "status.open",
  "Closed": "status.closed",
  "Pre-market": "status.pre_market",
  "Pre-open": "status.pre_market",
  "After-hours": "status.after_hours",
};

export default function StatusBar() {
  const [time, setTime] = useState("");
  const [markets, setMarkets] = useState({ us: "—" as string, cn: "—" as string, crypto: "24/7" as string });
  const { isConnected, lastMessage } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const { t } = useI18n();

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
      setMarkets(getMarketStatus());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (lastMessage?.timestamp) {
      setLastUpdate(new Date(lastMessage.timestamp).toLocaleTimeString("en-US", { hour12: false }));
    } else if (lastMessage) {
      setLastUpdate(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }
  }, [lastMessage]);

  const statusColor = (s: string) =>
    s === "Open" ? "text-green-400" : s === "Pre-market" || s === "Pre-open" || s === "After-hours" ? "text-yellow-400" : "text-muted";

  const translateStatus = (s: string) => {
    const key = statusI18nMap[s];
    return key ? t(key) : s;
  };

  return (
    <div className="status-bar flex items-center justify-between px-3 md:px-4 py-2 text-[10px] md:text-[11px] bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.04)] sticky top-0 z-40">
      <span className="text-muted tabular-nums font-mono">{time}</span>
      <div className="flex items-center gap-2 md:gap-4">
        <span className={`${statusColor(markets.us)} font-medium`}>
          <span className="sm:hidden">🇺🇸</span>
          <span className="hidden sm:inline">US:</span> {translateStatus(markets.us)}
        </span>
        <span className={`${statusColor(markets.cn)} font-medium`}>
          <span className="sm:hidden">🇨🇳</span>
          <span className="hidden sm:inline">CN:</span> {translateStatus(markets.cn)}
        </span>
        <span className="text-green-400 font-medium">
          <span className="sm:hidden">₿</span>
          <span className="hidden sm:inline">Crypto:</span> 24/7
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400 blink-dot" : "bg-red-500"}`} />
        <span className={`${isConnected ? "text-green-400" : "text-red-400"} hidden sm:inline`}>
          {isConnected ? t("status.live") : t("status.offline")}
        </span>
        {lastUpdate && <span className="text-muted/60 hidden md:inline">· {lastUpdate}</span>}
      </div>
    </div>
  );
}
