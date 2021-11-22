import { Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketsAdapterRoomsService } from './adapters/websockets-adapter-rooms.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsRoomsRefreshService {
  constructor(private websocketsAdapterRooms: WebsocketsAdapterRoomsService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('rooms-refresh')
  async handleRoomsRefresh(@ConnectedSocket() client: any): Promise<void> {
    client.emit(
      'rooms-refresh-result',
      await this.websocketsAdapterRooms.findAllRooms(),
    );
  }
}
