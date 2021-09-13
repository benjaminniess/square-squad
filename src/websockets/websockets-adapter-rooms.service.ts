import { Injectable } from '@nestjs/common';
import { RoomsLeadersService } from '../rooms/rooms-leaders.service';
import { PlayersService } from '../players/players.service';
import { RoomsService } from '../rooms/rooms.service';
import { PlayerDto } from '../players/player.dto.interface';

@Injectable()
export class WebsocketsAdapterRoomsService {
  constructor(
    private playersService: PlayersService,
    private roomsService: RoomsService,
    private roomsLeadersAssociation: RoomsLeadersService,
  ) {}

  async createRoom(socketId: string, roomName: string) {
    const existingPlayer = await this.playersService.findBySocketId(socketId);
    if (!existingPlayer) {
      return {
        success: false,
        error: 'wrong-player-id',
      };
    }

    if (await this.roomsService.isPlayerInARoom(existingPlayer.id)) {
      return {
        success: false,
        error: 'player-already-in-a-room',
      };
    }

    try {
      const roomSlug = await this.roomsService.create(roomName);
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

  async joinRoom(socketId: string, roomSlug: string) {
    const existingPlayer = await this.playersService.findBySocketId(socketId);
    if (!existingPlayer) {
      return {
        success: false,
        error: 'wrong-player-id',
      };
    }

    if (await this.roomsService.isPlayerInARoom(existingPlayer.id)) {
      return {
        success: false,
        error: 'player-already-in-a-room',
      };
    }

    const room = await this.roomsService.findBySlug(roomSlug);
    if (!room) {
      return {
        success: false,
        error: 'wrong-room-slug',
      };
    }

    try {
      await this.roomsService.addPlayerToRoom(existingPlayer.id, roomSlug);
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

  async findAllRooms() {
    return { success: true, data: await this.roomsService.findAll() };
  }

  async removePlayerFromRooms(socketId: string) {
    const existingPlayer = await this.playersService.findBySocketId(socketId);
    if (!existingPlayer) {
      return {
        success: false,
        error: 'wrong-player-id',
      };
    }

    await this.roomsService.removePlayerFromRooms(existingPlayer.id);
  }

  async removeEmptyRooms() {
    // this.roomsService.findEmptyRoomsSlugs().map((roomSlug) => {
    //   try {
    //     this.roomsService.deleteFromSlug(roomSlug);
    //   } catch (error) {}
    // });
  }

  async maybeResetLeader(roomSlug: string) {
    // if (this.roomsLeadersAssociation.getLeaderForRoom(roomSlug) !== null) {
    //   return;
    // }
    // const roomPlayers = this.roomsPlayersAssociation.findAllPlayersInRoom(
    //   roomSlug,
    // );
    // if (roomPlayers.length === 0) {
    //   return;
    // }
    // this.roomsLeadersAssociation.setLeaderForRoom(roomPlayers[0], roomSlug);
  }

  getRoomPlayers(roomSlug: string): PlayerDto[] {
    return [];
    // return this.roomsPlayersAssociation.findAllPlayersInRoom(roomSlug);
  }
}
