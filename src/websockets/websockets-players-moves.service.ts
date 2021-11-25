import { Injectable, UsePipes } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketsAdapterGameService } from './adapters/websockets-adapter-games.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsPlayersMovesService {
  constructor(private websocketAdapterGames: WebsocketsAdapterGameService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('keyUp')
  async handleKeyUp(
    @MessageBody() keyData: any,
    @ConnectedSocket() client: any,
  ): Promise<void> {
    this.websocketAdapterGames.handlePlayerAction(
      false,
      keyData.key,
      client.id,
    );
  }

  @SubscribeMessage('keyPressed')
  async handleKeyPressed(
    @MessageBody() keyData: any,
    @ConnectedSocket() client: any,
  ): Promise<void> {
    this.websocketAdapterGames.handlePlayerAction(true, keyData.key, client.id);
  }
}
