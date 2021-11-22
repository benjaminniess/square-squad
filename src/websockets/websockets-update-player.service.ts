import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketsAdapterPlayersService } from './adapters/websockets-adapter-players.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsUpdatePlayerService {
  constructor(
    private websocketsAdapterPlayers: WebsocketsAdapterPlayersService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('update-player-data')
  async handleUpdatePlayerData(
    @MessageBody() data: any,
    @ConnectedSocket() client: any,
  ) {
    client.emit(
      'update-player-data-result',
      await this.websocketsAdapterPlayers.updatePlayer(client.id, data),
    );
  }
}
