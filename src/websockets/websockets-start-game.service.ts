import { Injectable, UsePipes } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IsAdminPipe } from '../pipes/is-admin.pipe';
import { WebsocketsAdapterGameService } from './adapters/websockets-adapter-games.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsStartGameService {
  constructor(private websocketAdapterGames: WebsocketsAdapterGameService) {}

  @WebSocketServer()
  server: Server;

  @UsePipes(IsAdminPipe)
  @SubscribeMessage('start-game')
  async handleStartGame(
    @MessageBody() gameData: any,
    @ConnectedSocket() client: any,
  ): Promise<void> {
    if (gameData.error) {
      client.emit('start-game-result', gameData);
      return;
    }

    const newGame = await this.websocketAdapterGames.startGame(gameData);
    this.server.to(gameData.roomSlug).emit('start-game-result', newGame);
  }
}
