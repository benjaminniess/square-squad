import { ConflictException, Injectable } from '@nestjs/common';
import { Player } from './player.interface';
import { PlayersServiceInterface } from './players.service.interface';

@Injectable()
export class PlayersService implements PlayersServiceInterface {
  private players: Player[] = [];

  findAll(): Player[] {
    return this.players;
  }

  findById(id: string) {
    let foundPlayer: Player | null = null;

    this.players.map((player) => {
      if (player.id === id) {
        foundPlayer = player;
      }
    });

    return foundPlayer;
  }

  create(player: Player) {
    if (this.findById(player.id) !== null) {
      throw new ConflictException('player-already-exists');
    }
    this.players.push(player);
  }

  update(player: Player) {
    if (this.findById(player.id) === null) {
      throw new ConflictException('player-does-not-exist');
    }

    this.players.map((singlePlayer, key) => {
      if (player.id !== singlePlayer.id) {
        return;
      }

      this.players[key] = player;
    });
  }

  deleteFromId(id: string) {
    if (this.findById(id) === null) {
      throw new ConflictException('player-does-not-exist');
    }

    this.players.map((player, key) => {
      if (player.id !== id) {
        return;
      }

      this.players.splice(key, 1);
    });
  }
}
