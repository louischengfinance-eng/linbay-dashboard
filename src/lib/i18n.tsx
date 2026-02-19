"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "en" | "zh";

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  "nav.home": { en: "Home", zh: "首页" },
  "nav.markets": { en: "Markets", zh: "行情" },
  "nav.portfolio": { en: "Portfolio", zh: "持仓" },
  "nav.alerts": { en: "Alerts", zh: "提醒" },
  "nav.settings": { en: "Settings", zh: "设置" },
  "nav.trades": { en: "Trades", zh: "交易" },
  "nav.performance": { en: "Performance", zh: "绩效" },
  "nav.pricing": { en: "Pricing", zh: "收费" },
  "nav.news": { en: "News", zh: "新闻" },
  "nav.backtest": { en: "Backtest", zh: "回测" },
  "nav.notifications": { en: "Notifications", zh: "通知" },
  "nav.no_notifications": { en: "No notifications", zh: "暂无通知" },
  "nav.engine_running": { en: "Engine: Running", zh: "引擎运行中" },

  // Dashboard
  "dash.greeting": { en: "Hi, Trader", zh: "你好，交易员" },
  "dash.total_balance": { en: "TOTAL BALANCE", zh: "总资产" },
  "dash.send": { en: "Send", zh: "转出" },
  "dash.receive": { en: "Receive", zh: "转入" },
  "dash.swap": { en: "Swap", zh: "兑换" },
  "dash.assets": { en: "Assets", zh: "资产" },
  "dash.see_all": { en: "See All >", zh: "查看全部 >" },
  "dash.activity": { en: "Activity", zh: "交易记录" },
  "dash.no_trades": { en: "No trades yet", zh: "暂无交易记录" },
  "dash.no_assets": { en: "No assets yet", zh: "暂无资产" },
  "dash.waiting": { en: "Waiting for trade signals...", zh: "等待交易信号..." },
  "dash.connected": { en: "Connected", zh: "已连接" },
  "dash.connecting": { en: "Connecting...", zh: "连接中..." },
  "dash.symbols": { en: "symbols", zh: "标的" },
  "dash.positions": { en: "positions", zh: "持仓" },

  // Markets / Scanner
  "markets.title": { en: "Markets", zh: "行情" },
  "markets.subtitle": { en: "Real-time anomaly detection", zh: "实时异动监测" },
  "markets.refresh": { en: "Refresh", zh: "刷新" },
  "markets.fear_greed": { en: "Fear & Greed", zh: "恐惧贪婪指数" },
  "markets.price": { en: "Price", zh: "价格" },
  "markets.change": { en: "Change", zh: "涨跌" },
  "markets.vol": { en: "Vol", zh: "量比" },
  "markets.no_signals": { en: "No signals detected", zh: "暂无异动信号" },
  "markets.monitoring": { en: "Scanner is monitoring the market", zh: "正在监控市场异动" },

  // Stock Detail
  "stock.us_equity": { en: "US EQUITY", zh: "美股" },
  "stock.cn_equity": { en: "CN EQUITY", zh: "A股" },
  "stock.crypto": { en: "CRYPTO", zh: "加密货币" },
  "stock.ai_analysis": { en: "AI Analysis", zh: "AI 分析" },
  "stock.confidence": { en: "Confidence", zh: "置信度" },
  "stock.moving_avg": { en: "Moving Averages", zh: "均线" },
  "stock.set_alert": { en: "Set Alert", zh: "设置提醒" },
  "stock.latest_news": { en: "Latest News", zh: "最新新闻" },

  // Portfolio / Positions
  "portfolio.title": { en: "Portfolio", zh: "持仓管理" },
  "portfolio.subtitle": { en: "LIVE PORTFOLIO", zh: "实时持仓" },
  "portfolio.no_positions": { en: "No open positions", zh: "暂无持仓" },
  "portfolio.start_trading": { en: "Start trading to see positions here", zh: "开始交易后将在此显示持仓" },

  // Trades
  "trades.title": { en: "Trades", zh: "交易记录" },
  "trades.subtitle": { en: "EXECUTION HISTORY", zh: "执行历史" },
  "trades.export": { en: "Export", zh: "导出" },
  "trades.no_trades": { en: "No trades recorded", zh: "暂无交易记录" },
  "trades.waiting": { en: "Waiting for first trade signal...", zh: "等待首个交易信号..." },
  "trades.scanning": { en: "AI engine is scanning opportunities", zh: "AI 引擎正在扫描机会" },

  // Performance
  "perf.title": { en: "Performance", zh: "绩效分析" },
  "perf.subtitle": { en: "ANALYTICS · METRICS", zh: "分析 · 指标" },
  "perf.total_trades": { en: "Total Trades", zh: "总交易数" },
  "perf.win_rate": { en: "Win Rate", zh: "胜率" },
  "perf.sharpe": { en: "Sharpe Ratio", zh: "夏普比率" },
  "perf.max_dd": { en: "Max Drawdown", zh: "最大回撤" },
  "perf.equity_curve": { en: "EQUITY CURVE", zh: "资产曲线" },
  "perf.after_first": { en: "Equity curve will appear after first trade", zh: "首笔交易后将显示资产曲线" },
  "perf.monthly_returns": { en: "MONTHLY RETURNS", zh: "月度收益" },
  "perf.loading": { en: "LOADING METRICS...", zh: "加载指标中..." },
  "perf.market_dist": { en: "MARKET DISTRIBUTION", zh: "市场分布" },
  "perf.pnl_ranking": { en: "P&L RANKING", zh: "盈亏排名" },
  "perf.best_performer": { en: "Best Performer", zh: "最佳标的" },
  "perf.worst_performer": { en: "Worst Performer", zh: "最差标的" },

  // Backtest
  "bt.title": { en: "BACKTEST ENGINE", zh: "回测引擎" },
  "bt.subtitle": { en: "Historical strategy backtesting", zh: "历史数据策略回测" },
  "bt.symbol": { en: "Symbol", zh: "标的" },
  "bt.market": { en: "Market", zh: "市场" },
  "bt.initial_cash": { en: "Initial Cash", zh: "初始资金" },
  "bt.start_date": { en: "Start Date", zh: "开始日期" },
  "bt.end_date": { en: "End Date", zh: "结束日期" },
  "bt.run": { en: "⚡ RUN BACKTEST", zh: "⚡ 运行回测" },
  "bt.running": { en: "RUNNING...", zh: "运行中..." },
  "bt.config": { en: "CONFIGURATION", zh: "配置" },
  "bt.error": { en: "Backtest failed", zh: "回测失败" },

  // Alerts
  "alerts.title": { en: "🔔 PRICE ALERTS", zh: "🔔 价格提醒" },
  "alerts.new": { en: "+ New Alert", zh: "+ 新建提醒" },
  "alerts.no_alerts": { en: "No alerts configured", zh: "暂无提醒" },
  "alerts.loading": { en: "LOADING ALERTS...", zh: "加载提醒中..." },

  // News
  "news.title": { en: "📰 MARKET NEWS", zh: "📰 市场新闻" },
  "news.loading": { en: "LOADING NEWS...", zh: "加载新闻中..." },
  "news.no_news": { en: "No news available", zh: "暂无新闻" },

  // Settings
  "settings.title": { en: "Settings", zh: "设置" },
  "settings.language": { en: "Language", zh: "语言" },
  "settings.theme": { en: "Theme", zh: "主题" },

  // Status bar
  "status.open": { en: "Open", zh: "开盘" },
  "status.closed": { en: "Closed", zh: "收盘" },
  "status.after_hours": { en: "After-hours", zh: "盘后" },
  "status.pre_market": { en: "Pre-market", zh: "盘前" },
  "status.live": { en: "Live", zh: "在线" },
  "status.offline": { en: "Offline", zh: "离线" },
};

const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }>({
  lang: "zh", setLang: () => {}, t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("nexus-lang") as Lang;
    if (saved === "en" || saved === "zh") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("nexus-lang", l);
  };

  const t = (key: string) => translations[key]?.[lang] || key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }
