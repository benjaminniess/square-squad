import { PlayerDto } from 'src/players/player.dto.interface';

export interface RoomsPlayersAssociation {
  findAllPlayersInRoom(roomSlug: string): PlayerDto[];
  removeAllPlayersInRoom(roomSlug: string);
  addPlayerToRoom(player: PlayerDto, roomSlug: string);
  removePlayerFromRoom(playerId: string, roomSlug: string);
}
