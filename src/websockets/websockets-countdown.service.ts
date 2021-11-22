import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketsAdapterGameService } from './adapters/websockets-adapter-games.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsCountdownService {
  constructor(
    private websocketAdapterGames: WebsocketsAdapterGameService,
    private eventEmitter: EventEmitter2,
  ) {
    this.eventEmitter.on('countdown-update', (eventData) => {
      this.handleCountdownUpdate(eventData);
    });

    this.eventEmitter.on('countdown-over', async (eventData) => {
      await this.handleCountdownOver(eventData);
    });
  }

  @WebSocketServer()
  server: Server;

  handleCountdownUpdate(eventData: any) {
    // Null for some reason during tests
    if (!this.server) {
      return;
    }

    this.server.to(eventData.roomSlug).emit('countdown-update', {
      timeleft: eventData.timeleft,
    });
  }

  async handleCountdownOver(eventData: any) {
    return await this.websocketAdapterGames.setStatus(
      eventData.gameInstanceId,
      'playing',
    );
  }
}
