import { Injectable } from '@nestjs/common';
import { PlayerDto } from 'src/players/player.dto.interface';

type roomLeadersAssociation = {
  roomSlug: string;
  leader: PlayerDto;
};

@Injectable()
export class RoomsLeadersService implements RoomsLeadersService {
  private associations: roomLeadersAssociation[] = [];

  getLeaderForRoom(roomSlug: string): PlayerDto | null {
    let player = null;

    this.associations.map((association) => {
      if (association.roomSlug !== roomSlug) {
        return;
      }

      player = association.leader;
    });

    return player;
  }

  setLeaderForRoom(leader: PlayerDto, roomSlug: string) {
    const associationKey = this.getRoomAssociationKey(roomSlug);
    if (associationKey === null) {
      this.associations.push({ roomSlug, leader });
      return;
    }

    this.associations[associationKey].leader = leader;
  }

  removeLeaderFromRoom(roomSlug: string) {
    const associationKey = this.getRoomAssociationKey(roomSlug);
    if (associationKey === null) {
      return;
    }

    this.associations.splice(associationKey, 1);
  }

  isPlayerLeaderOfRoom(player: PlayerDto, roomSlug: string): boolean {
    const associationKey = this.getRoomAssociationKey(roomSlug);
    if (associationKey === null) {
      return false;
    }

    if (this.associations[associationKey].leader !== player) {
      return false;
    }

    return true;
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
}
