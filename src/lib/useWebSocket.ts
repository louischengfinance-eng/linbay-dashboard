/**
 * WebSocket 即時連接 Hook
 * 連接到後端 WebSocket，自動重連，接收即時數據更新
 */
"use client";
import { useEffect, useRef, useState, useCallback } from "react";

function getWsUrl() {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window === "undefined") return "ws://localhost:8000/ws";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}
const WS_URL = getWsUrl();
const RECONNECT_INTERVAL = 3000; // 斷線重連間隔 3 秒

export interface WsMessage {
  type: "trade_update" | "position_update" | "scan_status" | "heartbeat" | "pong";
  data?: any;
  timestamp?: string;
}

export function useWebSocket() {
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    // 避免 SSR
    if (typeof window === "undefined") return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // 清除重連計時器
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          setLastMessage(msg);
        } catch {
          // 忽略無法解析的消息
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        // 自動重連
        reconnectTimer.current = setTimeout(connect, RECONNECT_INTERVAL);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // 連接失敗，稍後重試
      reconnectTimer.current = setTimeout(connect, RECONNECT_INTERVAL);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { lastMessage, isConnected };
}
