import { useEffect, useRef, useState, useCallback } from 'react';

type WebSocketMessage = {
  type: string;
  payload: any;
};

export function useWebSocket(url: string, onMessage?: (data: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('[WebSocket] Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error('[WebSocket] Parse error', e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('[WebSocket] Disconnected, reconnecting...');
      // Attempt reconnect after 3 seconds
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error', error);
      ws.close();
    };
  }, [url, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Not connected, cannot send');
    }
  }, []);

  return { isConnected, sendMessage, lastMessage };
}