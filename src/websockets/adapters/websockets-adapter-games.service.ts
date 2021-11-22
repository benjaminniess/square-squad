import { Injectable } from '@nestjs/common';
import { RoomsService } from '../../rooms/rooms.service';
import { Error } from 'src/contracts/error.interface';
import { Success } from 'src/contracts/success.interface';
import { GamesService } from '../../games/games.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class WebsocketsAdapterGameService {
  constructor(
    private gamesService: GamesService,
    private roomsService: RoomsService,
    private eventEmitter: EventEmitter2,
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

    this.startCountdown({ roomSlug: gameData.roomSlug, gameInstanceId });

    return {
      success: true,
      data: { gameInstanceId: gameInstanceId },
    };
  }

  startCountdown(eventData: any) {
    let timeleft = 3;
    const countdownTimer = setInterval(
      async function (eventData) {
        if (timeleft <= 0) {
          clearInterval(countdownTimer);

          this.eventEmitter.emit('countdown-over', {
            gameInstanceId: eventData.gameInstanceId,
          });
        }

        this.eventEmitter.emit('countdown-update', {
          roomSlug: eventData.roomSlug,
          timeleft,
        });

        timeleft -= 1;
      }.bind(this),
      1000,
      eventData,
    );
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
}
