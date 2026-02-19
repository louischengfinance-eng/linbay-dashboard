import { NextRequest, NextResponse } from "next/server";
import { kvGet } from "@/lib/kv";

interface Deal {
  ticket: number; symbol: string; type: string; entry: string;
  volume: number; price: number; profit: number; swap: number;
  commission: number; fee: number; time: number; comment: string;
}

interface Position {
  ticket: number; symbol: string; type: string; volume: number;
  openPrice: number; currentPrice: number; sl: number; tp: number;
  profit: number; swap: number; commission: number; openTime: number;
}

export async function GET(req: NextRequest) {
  try {
    const data = await kvGet("mt5:latest");
    if (!data) return NextResponse.json({ live: false, error: "No data" }, { status: 404 });
    const acct = data.account || {};
    const positions: Position[] = data.positions || [];
    const history: Deal[] = data.history || [];

    // --- Compute stats from deal history ---
    const closedDeals = history.filter((d: Deal) => d.entry === "OUT" || d.entry === "INOUT");
    const wins = closedDeals.filter((d: Deal) => d.profit > 0);
    const losses = closedDeals.filter((d: Deal) => d.profit < 0);

    const grossProfit = wins.reduce((s: number, d: Deal) => s + d.profit, 0);
    const grossLoss = losses.reduce((s: number, d: Deal) => s + d.profit, 0);
    const totalSwap = closedDeals.reduce((s: number, d: Deal) => s + (d.swap || 0), 0);
    const totalComm = closedDeals.reduce((s: number, d: Deal) => s + (d.commission || 0), 0);
    const netProfit = grossProfit + grossLoss + totalSwap + totalComm;

    const deposit = 40000;
    const winRate = closedDeals.length > 0 ? (wins.length / closedDeals.length * 100) : 0;
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const pf = Math.abs(grossLoss) > 0 ? grossProfit / Math.abs(grossLoss) : 0;

    // Best / worst single trade
    const allProfits = closedDeals.map((d: Deal) => d.profit);
    const bestTrade = allProfits.length > 0 ? Math.max(...allProfits) : 0;
    const worstTrade = allProfits.length > 0 ? Math.min(...allProfits) : 0;

    // Win/loss streaks
    let wsMax = 0, lsMax = 0, ws = 0, ls = 0;
    for (const d of closedDeals) {
      if (d.profit > 0) { ws++; ls = 0; wsMax = Math.max(wsMax, ws); }
      else if (d.profit < 0) { ls++; ws = 0; lsMax = Math.max(lsMax, ls); }
    }

    // Daily P&L
    const dailyMap: Record<string, number> = {};
    for (const d of closedDeals) {
      const day = new Date(d.time * 1000).toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + d.profit + (d.swap || 0) + (d.commission || 0);
    }
    const dailyPnl = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, pnl]) => ({ d: day.slice(8, 10), pnl: Math.round(pnl) }));

    // Equity curve (cumulative balance by day)
    let cumBal = deposit;
    const equityCurve = dailyPnl.map(dp => {
      cumBal += dp.pnl;
      return { d: dp.d, b: Math.round(cumBal), e: Math.round(cumBal) };
    });
    equityCurve.unshift({ d: "start", b: deposit, e: deposit });

    // Instrument breakdown
    const instMap: Record<string, { pnl: number; n: number; wins: number }> = {};
    for (const d of closedDeals) {
      if (!instMap[d.symbol]) instMap[d.symbol] = { pnl: 0, n: 0, wins: 0 };
      instMap[d.symbol].pnl += d.profit + (d.swap || 0) + (d.commission || 0);
      instMap[d.symbol].n++;
      if (d.profit > 0) instMap[d.symbol].wins++;
    }
    const totalPnlAbs = Object.values(instMap).reduce((s, v) => s + Math.abs(v.pnl), 0);
    const instruments = Object.entries(instMap)
      .sort(([, a], [, b]) => b.pnl - a.pnl)
      .map(([sym, v]) => ({
        sym,
        name: sym,
        pnl: Math.round(v.pnl * 100) / 100,
        n: v.n,
        wr: v.n > 0 ? Math.round(v.wins / v.n * 1000) / 10 : 0,
        pct: totalPnlAbs > 0 ? Math.round(v.pnl / totalPnlAbs * 1000) / 10 : 0,
      }));

    // Sharpe (daily returns)
    const dailyReturns = dailyPnl.map(dp => dp.pnl / deposit);
    const meanRet = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
    const stdRet = dailyReturns.length > 1
      ? Math.sqrt(dailyReturns.reduce((s, r) => s + (r - meanRet) ** 2, 0) / (dailyReturns.length - 1))
      : 0;
    const sharpe = stdRet > 0 ? Math.round(meanRet / stdRet * 100) / 100 : 0;

    // Avg hold time
    // Pair IN/OUT deals by order to estimate hold time
    const inDeals = history.filter((d: Deal) => d.entry === "IN");
    const outDeals = history.filter((d: Deal) => d.entry === "OUT");
    let totalHoldSec = 0, holdCount = 0;
    for (const out of outDeals) {
      const inp = inDeals.find((d: Deal) => d.symbol === out.symbol && d.time < out.time);
      if (inp) {
        totalHoldSec += out.time - inp.time;
        holdCount++;
      }
    }
    const avgHoldSec = holdCount > 0 ? totalHoldSec / holdCount : 0;
    const holdHrs = Math.floor(avgHoldSec / 3600);
    const holdMin = Math.floor((avgHoldSec % 3600) / 60);
    const holdStr = `${holdHrs}h ${holdMin}m`;

    // Floating P/L from positions
    const floatingPnl = positions.reduce((s: number, p: Position) => s + p.profit + (p.swap || 0), 0);

    const stats = {
      live: true,
      lastUpdate: data.timestamp,
      account: {
        id: String(acct.login || ""),
        server: acct.server || "",
        currency: acct.currency || "USD",
        leverage: acct.leverage || 0,
        deposit,
        balance: acct.balance || 0,
        equity: acct.equity || 0,
        freeMargin: acct.freeMargin || 0,
        marginLevel: acct.marginLevel ? `${acct.marginLevel.toFixed(2)}%` : "0.00%",
        floatingPnl: Math.round(floatingPnl * 100) / 100,
      },
      performance: {
        netProfit: Math.round(netProfit * 100) / 100,
        netProfitPct: Math.round(netProfit / deposit * 10000) / 100,
        totalTrades: closedDeals.length,
        winRate: Math.round(winRate * 100) / 100,
        profitFactor: Math.round(pf * 100) / 100,
        sharpe,
        avgWin: Math.round(avgWin * 100) / 100,
        avgLoss: Math.round(avgLoss * 100) / 100,
        bestTrade: Math.round(bestTrade * 100) / 100,
        worstTrade: Math.round(worstTrade * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossLoss: Math.round(grossLoss * 100) / 100,
        swap: Math.round(totalSwap * 100) / 100,
        commission: Math.round(totalComm * 100) / 100,
        winStreak: wsMax,
        lossStreak: lsMax,
        wins: wins.length,
        losses: losses.length,
        avgHold: holdStr,
      },
      positions: positions.map((p: Position) => ({
        ticket: p.ticket,
        symbol: p.symbol,
        type: p.type,
        volume: p.volume,
        openPrice: p.openPrice,
        currentPrice: p.currentPrice,
        sl: p.sl,
        tp: p.tp,
        profit: p.profit,
        swap: p.swap,
      })),
      charts: {
        equityCurve,
        dailyPnl,
      },
      instruments,
    };

    return NextResponse.json(stats);
  } catch (e: any) {
    return NextResponse.json({ live: false, error: e.message }, { status: 404 });
  }
}
