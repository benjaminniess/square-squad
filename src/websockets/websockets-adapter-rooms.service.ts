import { Injectable } from '@nestjs/common';
import { RoomsLeadersService } from '../rooms/rooms-leaders.service';
import { PlayersService } from '../players/players.service';
import { RoomsPlayersAssociationService } from '../rooms/rooms-players-association.service';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class WebsocketsAdapterRoomsService {
  constructor(
    private playersService: PlayersService,
    private roomsService: RoomsService,
    private roomsPlayersAssociation: RoomsPlayersAssociationService,
    private roomsLeadersAssociation: RoomsLeadersService,
  ) {}

  createRoom(playerId: string, roomName: string) {
    const existingPlayer = this.playersService.findById(playerId);
    if (!existingPlayer) {
      return {
        success: false,
        error: 'wrong-player-id',
      };
    }

    if (this.roomsPlayersAssociation.isPlayerInARoom(playerId)) {
      return {
        success: false,
        error: 'player-already-in-a-room',
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

  joinRoom(playerId: string, roomSlug: string) {
    const existingPlayer = this.playersService.findById(playerId);
    if (!existingPlayer) {
      return {
        success: false,
        error: 'wrong-player-id',
      };
    }

    if (this.roomsPlayersAssociation.isPlayerInARoom(playerId)) {
      return {
        success: false,
        error: 'player-already-in-a-room',
      };
    }

    const room = this.roomsService.findBySlug(roomSlug);
    if (!room) {
      return {
        success: false,
        error: 'wrong-room-slug',
      };
    }

    try {
      this.roomsPlayersAssociation.addPlayerToRoom(existingPlayer, roomSlug);
      return {
        success: true,
        data: {
          roomSlug,
          roomName: room.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  findAllRooms() {
    return { success: true, data: this.roomsService.findAll() };
  }

  removePlayerFromRooms(playerId: string) {
    this.roomsPlayersAssociation.removePlayerFromRooms(playerId);
  }

  removeEmptyRooms() {
    this.roomsPlayersAssociation.findEmptyRoomsSlugs().map((roomSlug) => {
      try {
        this.roomsService.deleteFromSlug(roomSlug);
      } catch (error) {}
    });
  }

  maybeResetLeader(roomSlug: string) {
    if (this.roomsLeadersAssociation.getLeaderForRoom(roomSlug) !== null) {
      return;
    }

    const roomPlayers = this.roomsPlayersAssociation.findAllPlayersInRoom(
      roomSlug,
    );

    if (roomPlayers.length === 0) {
      return;
    }

    this.roomsLeadersAssociation.setLeaderForRoom(roomPlayers[0], roomSlug);
  }
}
