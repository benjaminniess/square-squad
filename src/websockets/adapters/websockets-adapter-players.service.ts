import { Injectable } from '@nestjs/common';
import { PlayersService } from '../../players/players.service';

@Injectable()
export class WebsocketsAdapterPlayersService {
  constructor(private playersService: PlayersService) {}

  async updatePlayer(socketId: string, data: any) {
    if (!data.name || !data.color) {
      return {
        success: false,
        error: 'empty-name-or-color',
      };
    }

    const existingPlayer = await this.playersService.findBySocketId(socketId);
    if (!existingPlayer) {
      try {
        await this.playersService.create({
          socketId: socketId,
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

    await this.playersService.update(socketId, {
      socketId: socketId,
      nickName: data.name,
      color: data.color,
    });

    return {
      success: true,
    };
  }

  async deletePlayer(socketId: string): Promise<boolean> {
    try {
      await this.playersService.deleteFromId(socketId);
      return true;
    } catch (error) {
      return false;
    }
  }
}
