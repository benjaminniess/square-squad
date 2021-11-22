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
export class WebsocketsJoinRoomService {
  constructor(private websocketsAdapterRooms: WebsocketsAdapterRoomsService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() roomSlug: string,
    @ConnectedSocket() client: any,
  ): Promise<void> {
    const roomJoinResult = await this.websocketsAdapterRooms.joinRoom(
      client.id,
      roomSlug,
    );

    client.emit('join-room-result', roomJoinResult);
    if (roomJoinResult.success !== true) {
      return;
    }

    await this.websocketsAdapterRooms.maybeResetLeader(roomSlug);
    client.emit('refresh-game-status', { gameStatus: 'waiting' });
    client.join(roomSlug);
    this.server
      .to(roomSlug)
      .emit(
        'refresh-players',
        await this.websocketsAdapterRooms.getRoomPlayers(roomSlug),
      );
  }
}
