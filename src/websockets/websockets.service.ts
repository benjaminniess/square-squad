import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketsAdapterPlayersService } from './adapters/websockets-adapter-players.service';
import { WebsocketsAdapterRoomsService } from './adapters/websockets-adapter-rooms.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService implements OnGatewayDisconnect {
  constructor(
    private websocketsAdapterPlayers: WebsocketsAdapterPlayersService,
    private websocketsAdapterRooms: WebsocketsAdapterRoomsService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(@ConnectedSocket() client: any) {
    await this.websocketsAdapterRooms.removePlayerFromRooms(client.id);
    await this.websocketsAdapterPlayers.deletePlayer(client.id);
  }

  @SubscribeMessage('create-room')
  async handleCreateRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: any,
  ) {
    client.emit(
      'create-room-result',
      await this.websocketsAdapterRooms.createRoom(client.id, roomName),
    );
  }
}
