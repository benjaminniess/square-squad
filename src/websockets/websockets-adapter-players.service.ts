import { Injectable } from '@nestjs/common';
import { PlayersService } from '../players/players.service';

@Injectable()
export class WebsocketsAdapterPlayersService {
  constructor(private playersService: PlayersService) {}

  updatePlayer(playerId: string, data: any) {
    if (!data.name || !data.color) {
      return {
        success: false,
        error: 'empty-name-or-color',
      };
    }

    const existingPlayer = this.playersService.findById(playerId);
    if (!existingPlayer) {
      try {
        this.playersService.create({
          id: playerId,
          nickName: data.name,
          color: data.color,
        });
      } catch (error) {
        return {
          success: false,
          error: 'player-init-error',
        };
      }

      return {
        success: true,
      };
    }

    this.playersService.update({
      id: playerId,
      nickName: data.name,
      color: data.color,
    });

    return {
      success: true,
    };
  }

  deletePlayer(playerId: string): boolean {
    try {
      this.playersService.deleteFromId(playerId);
      return true;
    } catch (error) {
      return false;
    }
  }
}
