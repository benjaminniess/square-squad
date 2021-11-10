import { Injectable } from '@nestjs/common';
import { RoomsLeadersService } from '../rooms/rooms-leaders.service';
import { PlayersService } from '../players/players.service';
import { RoomsService } from '../rooms/rooms.service';
import { PlayerOutputDto } from 'src/players/player.output.dto.interface';
import { Error } from 'src/contracts/error.interface';

@Injectable()
export class WebsocketsAdapterGameService {
  constructor(
    private playersService: PlayersService,
    private roomsService: RoomsService,
    private roomsLeadersAssociation: RoomsLeadersService,
  ) {}

  startGame() {
    return {
      success: true,
      data: {
        currentRound: 1,
        totalRound: 3,
      },
    };
  }
}
