import { PlayerDto } from './player.dto.interface';

export interface PlayersServiceInterface {
  findAll(): PlayerDto[];
  findById(string): PlayerDto | null;
  create(Player);
  update(Player);
  deleteFromId(string);
}
