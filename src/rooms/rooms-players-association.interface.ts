import { Player } from 'src/players/player.interface';

export interface RoomsPlayersAssociation {
  findAllPlayersInRoom(roomSlug: string): Player[];
  removeAllPlayersInRoom(roomSlug: string);
  addPlayerToRoom(player: Player, roomSlug: string);
  removePlayerFromRoom(playerId: string, roomSlug: string);
}
