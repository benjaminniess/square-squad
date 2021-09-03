import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WebsocketsAdapterService } from './websockets-adapter.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService implements OnGatewayDisconnect {
  constructor(private websocketsAdapter: WebsocketsAdapterService) {}

  handleDisconnect(@ConnectedSocket() client: any) {
    this.websocketsAdapter.deletePlayer(client.id);
  }

  @SubscribeMessage('update-player-data')
  handleUpdatePlayerData(
    @MessageBody() data: any,
    @ConnectedSocket() client: any,
  ): void {
    client.emit(
      'update-player-data-result',
      this.websocketsAdapter.updatePlayer(client.id, data),
    );
  }

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: any,
  ): void {
    client.emit(
      'create-room-result',
      this.websocketsAdapter.createRoom(client.id, roomName),
    );
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() roomSlug: string,
    @ConnectedSocket() client: any,
  ): void {
    client.emit(
      'join-room-result',
      this.websocketsAdapter.joinRoom(client.id, roomSlug),
    );
  }

  @SubscribeMessage('rooms-refresh')
  handleRoomsRefresh(
    @MessageBody() roomSlug: string,
    @ConnectedSocket() client: any,
  ): void {
    client.emit('rooms-refresh-result', this.websocketsAdapter.findAllRooms());
  }
}
