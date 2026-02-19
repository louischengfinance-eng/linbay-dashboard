const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getDashboard: () => fetchApi("/api/dashboard"),
  getPositions: (market?: string) =>
    fetchApi(`/api/positions${market ? `?market=${market}` : ""}`),
  getTrades: (params?: { market?: string; page?: number; page_size?: number }) => {
    const sp = new URLSearchParams();
    if (params?.market) sp.set("market", params.market);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.page_size) sp.set("page_size", String(params.page_size));
    return fetchApi(`/api/trades?${sp}`);
  },
  getPerformance: () => fetchApi("/api/performance"),
  getWatchlist: () => fetchApi("/api/watchlist"),
  addWatchlist: (data: { symbol: string; market: string; max_position_pct?: number }) =>
    fetchApi("/api/watchlist", { method: "POST", body: JSON.stringify(data) }),
  removeWatchlist: (id: number) =>
    fetchApi(`/api/watchlist/${id}`, { method: "DELETE" }),
  getConfig: () => fetchApi("/api/config"),
  updateConfig: (data: { key: string; value: string }) =>
    fetchApi("/api/config", { method: "PUT", body: JSON.stringify(data) }),
  getNotifications: (limit?: number) =>
    fetchApi(`/api/notifications${limit ? `?limit=${limit}` : ""}`),
  runBacktest: (data: { symbol: string; market: string; start_date: string; end_date: string; initial_cash?: number }) =>
    fetchApi("/api/backtest", { method: "POST", body: JSON.stringify(data) }),
  getStockDetail: (symbol: string, market: string = "us") =>
    fetchApi(`/api/stock/${symbol}?market=${market}`),
  getStockChart: (symbol: string, market: string = "us", period: string = "3mo") =>
    fetchApi(`/api/stock/${symbol}/chart?market=${market}&period=${period}`),
  getHotScanner: () => fetchApi("/api/hot-scanner"),
  getSentiment: () => fetchApi("/api/sentiment"),
  getPortfolioAnalytics: () => fetchApi("/api/portfolio/analytics"),
  exportTradesCsv: () => `${API_BASE}/api/trades/export`,
  getNews: (symbol?: string, limit?: number) => {
    const sp = new URLSearchParams();
    if (symbol) sp.set("symbol", symbol);
    if (limit) sp.set("limit", String(limit));
    return fetchApi(`/api/news?${sp}`);
  },
  getAlerts: () => fetchApi("/api/alerts"),
  createAlert: (data: { symbol: string; market: string; alert_type: string; threshold: number }) =>
    fetchApi("/api/alerts", { method: "POST", body: JSON.stringify(data) }),
  deleteAlert: (id: number) => fetchApi(`/api/alerts/${id}`, { method: "DELETE" }),
};
