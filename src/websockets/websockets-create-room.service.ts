import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketsAdapterRoomsService } from './adapters/websockets-adapter-rooms.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsCreateRoomService {
  constructor(private websocketsAdapterRooms: WebsocketsAdapterRoomsService) {}

  @WebSocketServer()
  server: Server;

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
