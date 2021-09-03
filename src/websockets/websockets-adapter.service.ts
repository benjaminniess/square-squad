import { Injectable } from '@nestjs/common';
import { PlayersService } from '../players/players.service';
import { RoomsPlayersAssociationService } from '../rooms/rooms-players-association.service';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class WebsocketsAdapterService {
  constructor(
    private playersService: PlayersService,
    private roomsService: RoomsService,
    private roomsPlayersAssociation: RoomsPlayersAssociationService,
  ) {}

  updatePlayer(playerId: string, data: any) {
    if (!data.name || !data.color) {
      return {
        success: false,
        error: 'Empty name or color',
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
          error: 'Error while initializing player',
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

  createRoom(playerId: string, roomName: string) {
    const existingPlayer = this.playersService.findById(playerId);
    if (!existingPlayer) {
      return {
        success: false,
        error: 'Wrong player ID',
      };
    }

    if (this.roomsPlayersAssociation.isPlayerInARoom(playerId)) {
      return {
        success: false,
        error: 'Player already in a room',
      };
    }

    try {
      const roomSlug = this.roomsService.create(roomName);
      return {
        success: true,
        data: { roomSlug },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
