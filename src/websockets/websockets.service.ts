import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WebsocketsAdapterPlayersService } from './websockets-adapter-players.service';
import { WebsocketsAdapterRoomsService } from './websockets-adapter-rooms.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService implements OnGatewayDisconnect {
  constructor(
    private websocketsAdapterPlayers: WebsocketsAdapterPlayersService,
    private websocketsAdapterRooms: WebsocketsAdapterRoomsService,
  ) {}

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
    client.emit(
      'join-room-result',
      this.websocketsAdapterRooms.joinRoom(client.id, roomSlug),
    );
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
