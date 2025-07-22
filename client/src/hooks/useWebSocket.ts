import { useState, useEffect, useRef, useCallback } from 'react';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface WebSocketMessage {
  type: string;
  payload?: any;
  requestId?: string;
}

export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const messageQueue = useRef<WebSocketMessage[]>([]);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      setConnectionStatus('connected');
      // Send queued messages
      while (messageQueue.current.length > 0) {
        const message = messageQueue.current.shift();
        if (message && ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(message));
        }
      }
    };
    
    ws.current.onmessage = (event) => {
      setLastMessage(event);
    };
    
    ws.current.onclose = () => {
      setConnectionStatus('disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (ws.current?.readyState !== WebSocket.OPEN) {
          connect();
        }
      }, 3000);
    };
    
    ws.current.onerror = () => {
      setConnectionStatus('disconnected');
    };
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    const messageWithId = {
      ...message,
      requestId: message.requestId || Date.now().toString(),
    };

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(messageWithId));
    } else {
      // Queue message for when connection is established
      messageQueue.current.push(messageWithId);
      if (connectionStatus === 'disconnected') {
        connect();
      }
    }
  }, [connect, connectionStatus]);

  useEffect(() => {
    connect();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
  };
}
