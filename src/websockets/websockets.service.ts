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

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(@ConnectedSocket() client: any): Promise<void> {
    await this.websocketsAdapterRooms.removePlayerFromRooms(client.id);

    client.rooms.forEach(async (roomSlug) => {
      if (roomSlug === client.id) {
        return;
      }

      await this.websocketsAdapterRooms.maybeResetLeader(roomSlug);
      this.server
        .to(roomSlug)
        .emit(
          'refresh-players',
          await this.websocketsAdapterRooms.getRoomPlayers(roomSlug),
        );
    });

    await this.websocketsAdapterRooms.removeEmptyRooms();
  }
}
