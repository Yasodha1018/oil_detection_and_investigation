import { useEffect, useState } from 'react';

export function useRealTime() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/api/realtime/ws');
    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };
    socket.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };
    socket.onclose = () => {
      setConnected(false);
      // Reconnect after 3 seconds
      setTimeout(() => {
        const newSocket = new WebSocket('ws://localhost:8000/api/realtime/ws');
        setWs(newSocket);
      }, 3000);
    };
    setWs(socket);
    return () => socket.close();
  }, []);

  return { data, connected };
}