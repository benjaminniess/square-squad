import { Injectable, UsePipes } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayDisconnect,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IsAdminPipe } from '../pipes/is-admin.pipe';
import { WebsocketsAdapterGameService } from './websockets-adapter-games.service';
import { WebsocketsAdapterPlayersService } from './websockets-adapter-players.service';
import { WebsocketsAdapterRoomsService } from './websockets-adapter-rooms.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService implements OnGatewayDisconnect {
  constructor(
    private websocketsAdapterPlayers: WebsocketsAdapterPlayersService,
    private websocketsAdapterRooms: WebsocketsAdapterRoomsService,
    private websocketAdapterGames: WebsocketsAdapterGameService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(@ConnectedSocket() client: any) {
    await this.websocketsAdapterRooms.removePlayerFromRooms(client.id);
    await this.websocketsAdapterPlayers.deletePlayer(client.id);
  }

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

  @SubscribeMessage('rooms-refresh')
  async handleRoomsRefresh(@ConnectedSocket() client: any): Promise<void> {
    client.emit(
      'rooms-refresh-result',
      await this.websocketsAdapterRooms.findAllRooms(),
    );
  }

  @UsePipes(IsAdminPipe)
  @SubscribeMessage('start-game')
  async handleStartGame(
    @MessageBody() gameData: any,
    @ConnectedSocket() client: any,
  ): Promise<void> {
    if (gameData.error) {
      client.emit('start-game-result', gameData);
      return;
    }

    const newGame = await this.websocketAdapterGames.startGame(gameData);
    client.emit('start-game-result', newGame);

    if (!newGame.success) {
      return;
    }

    this.server
      .to(gameData.roomSlug)
      .emit(
        'refresh-players',
        await this.websocketsAdapterRooms.getRoomPlayers(gameData.roomSlug),
      );
  }
}
