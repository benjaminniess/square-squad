import { Player } from './player.interface';

export interface PlayersServiceInterface {
  findAll(): Player[];
  findById(string): Player | null;
  create(Player);
}
