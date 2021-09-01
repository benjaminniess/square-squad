import { Player } from 'src/players/player.interface';

export interface RoomsPlayersAssociation {
  findAllPlayersInRoom(roomId: string): Player[];
  removeAllPlayersInRoom(roomId: string);
  addPlayerToRoom(player: Player, roomId: string);
  removePlayerFromRoom(playerId: string, roomId: string);
}
