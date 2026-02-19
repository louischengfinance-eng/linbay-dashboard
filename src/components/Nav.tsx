"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const mainLinks = [
  { href: "/", labelKey: "nav.home", key: "home" },
  { href: "/scanner", labelKey: "nav.markets", key: "markets" },
  { href: "/pricing", labelKey: "nav.pricing", key: "pricing" },
  { href: "/news", labelKey: "nav.news", key: "news" },
];

const allLinks = [
  ...mainLinks,
];

/* SVG tab bar icons */
function TabIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "#FFFFFF" : "#8E8E93";
  const sw = "1.8";
  switch (name) {
    case "home": return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    );
    case "markets": return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    );
    case "portfolio": return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    );
    case "alerts": return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    );
    case "settings": return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    );
    default: return null;
  }
}

/* Sidebar icons for desktop */
function SideIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    home: "⌂", markets: "◎", portfolio: "▤", alerts: "◉", settings: "⚙",
    trades: "⚡", performance: "↗", news: "◻", backtest: "⧫", pricing: "◈",
  };
  return <span className="text-sm w-5 text-center">{icons[name] || "·"}</span>;
}

export default function Nav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifs = () => {
      api.getNotifications(20).then((data: any[]) => {
        setNotifications(data);
        setNotifCount(data.length);
      }).catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="fixed left-0 top-0 h-full w-56 bg-[#000000] border-r border-[rgba(255,255,255,0.06)] p-4 hidden md:flex md:flex-col z-50">
        <div className="mb-8 pt-2">
          <div className="text-center font-bold text-lg tracking-[0.15em] text-white">LINBAY</div>
          <div className="text-center text-[10px] text-[#8E8E93] tracking-[0.15em] mt-0.5">AI TRADER</div>
        </div>
        <ul className="space-y-1 flex-1">
          {allLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href}
                className={`block px-3 py-2.5 rounded-[12px] transition-all duration-200 flex items-center gap-2.5 text-sm ${
                  pathname === l.href
                    ? "bg-[#1C1C1E] text-white font-semibold"
                    : "text-[#8E8E93] hover:text-white hover:bg-[#1C1C1E]"
                }`}>
                <SideIcon name={l.key} />
                {t(l.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 mt-3">
          <button onClick={() => setShowNotifs(!showNotifs)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-[#8E8E93] hover:text-white hover:bg-[#1C1C1E] transition-all">
            <span className="flex items-center gap-2 text-sm"><span>◉</span> {t("nav.notifications")}</span>
            {notifCount > 0 && (
              <span className="bg-[#FF453A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="mt-2 max-h-60 overflow-y-auto space-y-1.5 px-1">
              {notifications.length === 0 ? (
                <p className="text-[10px] text-[#8E8E93] text-center py-2">{t("nav.no_notifications")}</p>
              ) : (
                notifications.slice(0, 10).map((n: any, i: number) => (
                  <div key={i} className="p-2 rounded-[12px] bg-[#1C1C1E] text-[10px]">
                    <div className="text-[#30D158] font-bold uppercase">{n.type}</div>
                    <div className="text-[#8E8E93] mt-0.5 whitespace-pre-line">{n.message}</div>
                    <div className="text-[9px] text-[#48484A] mt-0.5">{n.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#30D158] blink-dot" />
            <span className="text-xs text-[#30D158] font-medium">{t("nav.engine_running")}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-[#48484A] tracking-wider">v1.1.0</div>
            <button onClick={() => { localStorage.removeItem("nexus_auth"); window.location.href = "/login"; }}
              className="text-[10px] text-[#71717A] hover:text-[#F43F5E] transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 safe-area-bottom"
           style={{ background: 'rgba(28,28,30,0.92)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
        <div className="flex h-[50px]">
          {mainLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative">
                <TabIcon name={l.key} active={active} />
                <span className={`text-[10px] font-medium ${active ? "text-white" : "text-[#8E8E93]"}`}>{t(l.labelKey)}</span>
                {active && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-[#30D158]" />}
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </nav>
    </>
  );
}
