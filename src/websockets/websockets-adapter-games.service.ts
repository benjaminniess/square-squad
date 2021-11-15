import { Injectable } from '@nestjs/common';
import { RoomsLeadersService } from '../rooms/rooms-leaders.service';
import { PlayersService } from '../players/players.service';
import { RoomsService } from '../rooms/rooms.service';
import { PlayerOutputDto } from 'src/players/player.output.dto.interface';
import { Error } from 'src/contracts/error.interface';
import { Success } from 'src/contracts/success.interface';
import { GamesService } from '../games/games.service';
import { GameInstance } from '../games/game-instance.entity';

@Injectable()
export class WebsocketsAdapterGameService {
  constructor(
    private gamesService: GamesService,
    private roomsService: RoomsService,
    private roomsLeadersAssociation: RoomsLeadersService,
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
        status: 'playing',
        room: room,
      });
    } catch (error) {
      return { success: false, error: error };
    }

    return {
      success: true,
      data: { gameInstanceId: gameInstanceId },
    };
  }
}
