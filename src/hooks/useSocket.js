'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getSocketBase } from '@/lib/socketBase';
import { socketClientOptions } from '@/lib/socketClientOptions';

let socket = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection only once
    if (!socket) {
      const socketBase = getSocketBase();
      if (!socketBase) {
        return;
      }

      socket = io(socketBase, {
        ...socketClientOptions,
      });

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on unmount, keep the connection alive
      // socket will persist across component re-renders
    };
  }, []);

  return socket;
}
