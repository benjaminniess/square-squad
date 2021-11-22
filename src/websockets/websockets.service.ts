import { Injectable, UsePipes } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameInstance } from 'src/games/game-instance.entity';
import { IsAdminPipe } from '../pipes/is-admin.pipe';
import { WebsocketsAdapterGameService } from './adapters/websockets-adapter-games.service';
import { WebsocketsAdapterPlayersService } from './adapters/websockets-adapter-players.service';
import { WebsocketsAdapterRoomsService } from './adapters/websockets-adapter-rooms.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService implements OnGatewayDisconnect {
  private lockedRefresh = false;

  constructor(
    private websocketsAdapterPlayers: WebsocketsAdapterPlayersService,
    private websocketsAdapterRooms: WebsocketsAdapterRoomsService,
    private websocketAdapterGames: WebsocketsAdapterGameService,
    private eventEmitter: EventEmitter2,
  ) {
    setInterval(this.refreshData.bind(this), 10);

    this.eventEmitter.on('countdown-update', (eventData) => {
      this.handleCountdownUpdate(eventData);
    });

    this.eventEmitter.on('countdown-over', async (eventData) => {
      await this.handleCountdownOver(eventData);
    });
  }

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
    this.server.to(gameData.roomSlug).emit('start-game-result', newGame);
  }

  refreshData() {
    if (this.lockedRefresh) {
      return;
    }

    this.lockedRefresh = true;
    this.websocketAdapterGames.getActiveGameInstances().then((instances) => {
      instances.map((instance: GameInstance) => {
        this.server.to(instance.room.slug).emit('refresh-canvas', {});
      });
    });

    this.lockedRefresh = false;
  }

  handleCountdownUpdate(eventData: any) {
    this.server.to(eventData.roomSlug).emit('countdown-update', {
      timeleft: eventData.timeleft,
    });
  }

  async handleCountdownOver(eventData: any) {
    return await this.websocketAdapterGames.setStatus(
      eventData.gameInstanceId,
      'playing',
    );
  }
}
