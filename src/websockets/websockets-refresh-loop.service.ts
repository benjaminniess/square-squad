import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameInstance } from 'src/games/game-instance.entity';
import { WebsocketsAdapterGameService } from './adapters/websockets-adapter-games.service';
@WebSocketGateway()
@Injectable()
export class WebsocketsRefreshLoopService {
  private lockedRefresh = false;

  constructor(private websocketAdapterGames: WebsocketsAdapterGameService) {
    setInterval(this.refreshData.bind(this), 10);
  }

  @WebSocketServer()
  server: Server;

  refreshData() {
    if (this.lockedRefresh || !this.server) {
      return;
    }

    this.lockedRefresh = true;
    this.websocketAdapterGames.getActiveGameInstances().then((instances) => {
      instances.map((instance: GameInstance) => {
        this.server.to(instance.room.slug).emit('refresh-canvas', {});
      });
    });

    this.lockedRefresh = false;
  }
}
