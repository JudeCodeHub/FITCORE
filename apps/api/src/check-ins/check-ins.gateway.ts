import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { RequestUser } from '../auth/guards/jwt-auth.guard.js';

const ALLOWED_ROLES = ['ADMIN', 'FRONT_DESK'];

@WebSocketGateway({
  namespace: '/check-ins',
  cors: {
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class CheckInsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(CheckInsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token as string | undefined;

    try {
      if (!token) throw new Error('Missing token');
      const payload = await this.jwt.verifyAsync<RequestUser>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      if (!ALLOWED_ROLES.includes(payload.role)) {
        throw new Error('Insufficient role');
      }
    } catch {
      this.logger.debug(`Rejected socket connection ${client.id}`);
      client.disconnect();
    }
  }

  broadcastCheckIn(payload: unknown) {
    this.server.emit('check-in:new', payload);
  }
}
