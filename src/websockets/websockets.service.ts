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
import { WebsocketsAdapterPlayersService } from './websockets-adapter-players.service';
import { WebsocketsAdapterRoomsService } from './websockets-adapter-rooms.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService implements OnGatewayDisconnect {
  constructor(
    private websocketsAdapterPlayers: WebsocketsAdapterPlayersService,
    private websocketsAdapterRooms: WebsocketsAdapterRoomsService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleDisconnect(@ConnectedSocket() client: any) {
    this.websocketsAdapterRooms.removePlayerFromRooms(client.id);
    this.websocketsAdapterPlayers.deletePlayer(client.id);
  }

  @SubscribeMessage('update-player-data')
  handleUpdatePlayerData(
    @MessageBody() data: any,
    @ConnectedSocket() client: any,
  ): void {
    client.emit(
      'update-player-data-result',
      this.websocketsAdapterPlayers.updatePlayer(client.id, data),
    );
  }

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: any,
  ): void {
    client.emit(
      'create-room-result',
      this.websocketsAdapterRooms.createRoom(client.id, roomName),
    );
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() roomSlug: string,
    @ConnectedSocket() client: any,
  ): void {
    const roomJoinResult = this.websocketsAdapterRooms.joinRoom(
      client.id,
      roomSlug,
    );

    client.emit('join-room-result', roomJoinResult);
    if (roomJoinResult.success !== true) {
      return;
    }

    this.websocketsAdapterRooms.maybeResetLeader(roomSlug);
    client.emit('refresh-game-status', { gameStatus: 'waiting' });
    client.join(roomSlug);
    this.server
      .to(roomSlug)
      .emit(
        'refresh-players',
        this.websocketsAdapterRooms.getRoomPlayers(roomSlug),
      );
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() roomSlug: string,
    @ConnectedSocket() client: any,
  ): void {
    this.websocketsAdapterRooms.removePlayerFromRooms(client.id);
    this.websocketsAdapterRooms.maybeResetLeader(roomSlug);
    this.websocketsAdapterRooms.removeEmptyRooms();
  }

  @SubscribeMessage('rooms-refresh')
  handleRoomsRefresh(
    @MessageBody() roomSlug: string,
    @ConnectedSocket() client: any,
  ): void {
    client.emit(
      'rooms-refresh-result',
      this.websocketsAdapterRooms.findAllRooms(),
    );
  }
}
