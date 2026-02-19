"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [watchlist, setWatchlist] = useState<any[]>([]);

  useEffect(() => {
    api.getWatchlist().then(setWatchlist).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const symbol = filter === "all" ? undefined : filter;
    api.getNews(symbol, 30)
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-wider text-white" style={{ textShadow: "0 0 20px rgba(0,255,240,0.4)" }}>
        📰 MARKET NEWS
      </h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-[rgba(0,255,240,0.15)] text-accent-green neon-border"
              : "bg-[rgba(255,255,255,0.05)] text-muted hover:text-white"
          }`}
        >
          ALL
        </button>
        {watchlist.map((w: any) => (
          <button
            key={w.symbol}
            onClick={() => setFilter(w.symbol)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === w.symbol
                ? "bg-[rgba(0,255,240,0.15)] text-accent-green neon-border"
                : "bg-[rgba(255,255,255,0.05)] text-muted hover:text-white"
            }`}
          >
            {w.symbol}
          </button>
        ))}
      </div>

      {/* News Cards */}
      {loading ? (
        <div className="text-accent-green neon-text animate-pulse text-center py-12">LOADING NEWS...</div>
      ) : news.length === 0 ? (
        <div className="text-muted text-center py-12">No news available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item: any, i: number) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-xl p-4 hover:border-[rgba(0,255,240,0.3)] transition-all group block"
              style={{ border: "1px solid rgba(0,255,240,0.1)" }}
            >
              <div className="flex gap-3">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-accent-green transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted">
                    <span>{item.publisher}</span>
                    <span>·</span>
                    <span>{timeAgo(item.published_at)}</span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {item.related_symbols?.map((s: string) => (
                      <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,255,240,0.1)] text-accent-green font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
