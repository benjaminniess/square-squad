import { Injectable, UsePipes } from '@nestjs/common';
import {
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IsAdminPipe } from '../pipes/is-admin.pipe';
import { WebsocketsAdapterGameService } from './adapters/websockets-adapter-games.service';
import { WebsocketsAdapterPlayersService } from './adapters/websockets-adapter-players.service';
import { WebsocketsAdapterRoomsService } from './adapters/websockets-adapter-rooms.service';

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
    await this.websocketsAdapterRooms.removeEmptyRooms();
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

  @SubscribeMessage('rooms-refresh')
  async handleRoomsRefresh(@ConnectedSocket() client: any): Promise<void> {
    client.emit(
      'rooms-refresh-result',
      await this.websocketsAdapterRooms.findAllRooms(),
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
    this.server.to(gameData.roomSlug).emit('start-game-result', newGame);
  }

  @SubscribeMessage('keyUp')
  async handleKeyUp(
    @MessageBody() keyData: any,
    @ConnectedSocket() client: any,
  ): Promise<void> {
    this.websocketAdapterGames.handlePlayerAction(
      false,
      keyData.key,
      client.id,
    );
  }

  @SubscribeMessage('keyPressed')
  async handleKeyPressed(
    @MessageBody() keyData: any,
    @ConnectedSocket() client: any,
  ): Promise<void> {
    this.websocketAdapterGames.handlePlayerAction(true, keyData.key, client.id);
  }
}
