import { Injectable } from '@nestjs/common';
import { RoomsService } from '../../rooms/rooms.service';
import { Error } from 'src/contracts/error.interface';
import { Success } from 'src/contracts/success.interface';
import { GamesService } from '../../games/games.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameInstance } from '../../games/game-instance.entity';
import { LegacyLoaderService } from '../../legacy/legacy-loader.service';
import { PlayersService } from '../../players/players.service';

@Injectable()
export class WebsocketsAdapterGameService {
  constructor(
    private gamesService: GamesService,
    private roomsService: RoomsService,
    private playersService: PlayersService,
    private eventEmitter: EventEmitter2,
    private legacyLoader: LegacyLoaderService,
  ) {}

  async startGame(gameData: any): Promise<Success | Error> {
    if (!gameData || !gameData.roomSlug) {
      return {
        success: false,
        error: 'missing-room-slug',
      };
    }

    if (!gameData.gameType) {
      return {
        success: false,
        error: 'missing-game-type',
      };
    }

    const room = await this.roomsService.findBySlug(gameData.roomSlug);
    if (!room) {
      return {
        success: false,
        error: 'wrong-room-slug',
      };
    }

    let gameInstanceId;
    try {
      gameInstanceId = await this.gamesService.create({
        game: gameData.gameType,
        status: 'waiting',
        room: room,
      });
    } catch (error) {
      return { success: false, error: error };
    }

    const legacyData = this.legacyLoader.create(gameInstanceId, room);
    room.players.map((player) => {
      legacyData.playersManager.initPlayer({
        id: player.socketId,
        color: player.color,
        nickName: player.nickName,
      });
    });

    this.eventEmitter.emit('start-game', legacyData);

    return {
      success: true,
      data: { gameInstanceId: gameInstanceId },
    };
  }

  async setStatus(gameInstanceId: number, status: string) {
    const game = await this.gamesService.findById(gameInstanceId);
    // For some reason some tests fail with overriding game instance ids
    if (!game) {
      return;
    }

    await this.gamesService.setStatus(game, status);
  }

  getActiveGameInstances() {
    return this.gamesService.findActives();
  }

  refreshGameData(instance: GameInstance) {
    return this.legacyLoader.getDataForInstance(instance.id).game.refreshData();
  }

  async handlePlayerAction(pressed = true, key: number, socketId) {
    const player = await this.playersService.findBySocketId(socketId);
    if (!player || !player.room) {
      return;
    }

    let keyValue = null;
    switch (key) {
      case 37:
        keyValue = 'left';
        break;
      case 38:
        keyValue = 'down';
        break;
      case 39:
        keyValue = 'right';
        break;
      case 40:
        keyValue = 'top';
        break;
      default:
        break;
    }

    const gameInstance = await this.gamesService.findById(player.room.game.id);
    if (!gameInstance) {
      return;
    }

    if (gameInstance.status !== 'playing') {
      return;
    }

    const gameData = this.legacyLoader.getDataForInstance(player.room.game.id);
    gameData.playersManager.updatePlayerButtonState(
      socketId,
      keyValue,
      pressed,
    );
  }
}
