/**
 * Custom Socket.IO Adapter
 *
 * FIX-BE-016-2026-01-29: Resolves "handleUpgrade() was called more than once" error
 * by providing a single, unified Socket.IO adapter for all gateways.
 *
 * This adapter ensures that:
 * 1. All WebSocket gateways share the same underlying Socket.IO server
 * 2. CORS is configured once, globally
 * 3. Multiple namespaces (/battle, /matchmaking, etc.) work correctly
 */

import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class SocketIOAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly corsOrigins: string[],
  ) {
    super(app);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createIOServer(port: number, options?: ServerOptions): any {
    const serverOptions: Partial<ServerOptions> = {
      ...options,
      cors: {
        origin: this.corsOrigins,
        credentials: true,
        methods: ['GET', 'POST'],
      },
      // Use same path for all gateways
      path: '/socket.io/',
      // Enable both transports
      transports: ['websocket', 'polling'],
      // Prevent issues with multiple connections
      allowEIO3: true,
    };

    return super.createIOServer(port, serverOptions);
  }
}
