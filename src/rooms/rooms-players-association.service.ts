import { ConflictException, Injectable } from '@nestjs/common';
import { PlayerDto } from '../players/player.dto.interface';

type roomPlayersAssociation = {
  roomSlug: string;
  players: PlayerDto[];
};

@Injectable()
export class RoomsPlayersAssociationService
  implements RoomsPlayersAssociationService {
  private associations: roomPlayersAssociation[] = [];

  findAllPlayersInRoom(roomSlug: string): PlayerDto[] {
    let foundPlayers: PlayerDto[] = [];

    this.associations.map((association) => {
      if (association.roomSlug !== roomSlug) {
        return;
      }
      foundPlayers = association.players;
    });

    return foundPlayers;
  }

  findEmptyRoomsSlugs(): string[] {
    const roomSlugs = [];
    this.associations.map((association) => {
      if (association.players.length > 0) {
        return;
      }

      roomSlugs.push(association.roomSlug);
    });

    return roomSlugs;
  }

  addPlayerToRoom(player: PlayerDto, roomSlug: string) {
    if (this.getPlayerRoomAssociationKey(player.id) !== null) {
      throw new ConflictException('player-already-in-room');
    }

    const associationKey = this.getRoomAssociationKey(roomSlug);
    if (associationKey === null) {
      this.associations.push({
        roomSlug: roomSlug,
        players: [player],
      });
    } else {
      this.associations[associationKey].players.push(player);
    }
  }

  removePlayerFromRoom(playerId: string, roomSlug: string) {
    const roomKey = this.getRoomAssociationKey(roomSlug);
    if (roomKey === null) {
      throw new ConflictException('room-does-not-exist');
    }

    this.associations[roomKey].players.map((player, playersRowId) => {
      if (player.id !== playerId) {
        return;
      }

      this.associations[roomKey].players.splice(playersRowId, 1);
    });
  }

  removePlayerFromRooms(playerId: string) {
    this.associations.map((association) => {
      this.removePlayerFromRoom(playerId, association.roomSlug);
    });
  }

  removeAllPlayersInRoom(roomSlug: string) {
    const roomKey = this.getRoomAssociationKey(roomSlug);
    if (roomKey === null) {
      throw new ConflictException('room-does-not-exist');
    }

    this.associations[roomKey].players = [];
  }

  isPlayerInARoom(playerId: string): boolean {
    return this.getPlayerRoomAssociationKey(playerId) !== null;
  }

  private getRoomAssociationKey(roomSlug: string): number | null {
    let associationKey = null;

    this.associations.map((association, arrayKey) => {
      if (association.roomSlug !== roomSlug) {
        return;
      }
      associationKey = arrayKey;
    });

    return associationKey;
  }

  private getPlayerRoomAssociationKey(playerId: string): number | null {
    let associationKey = null;

    this.associations.map((association, arrayKey) => {
      association.players.map((player) => {
        if (player.id !== playerId) {
          return;
        }
        associationKey = arrayKey;
      });
    });

    return associationKey;
  }
}
