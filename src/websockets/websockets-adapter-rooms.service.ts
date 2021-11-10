import { Injectable } from '@nestjs/common';
import { RoomsLeadersService } from '../rooms/rooms-leaders.service';
import { PlayersService } from '../players/players.service';
import { RoomsService } from '../rooms/rooms.service';
import { PlayerOutputDto } from 'src/players/player.output.dto.interface';
import { Error } from 'src/contracts/error.interface';

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
    const emptyRoomsSlugs = await this.roomsService.findEmptyRoomsSlugs();
    let deleted = 0;

    await Promise.all(
      emptyRoomsSlugs.map(async (roomSlug) => {
        try {
          await this.roomsService.deleteFromSlug(roomSlug);
          deleted++;
        } catch (error) {}
      }),
    );

    return {
      success: true,
      data: { deleted: deleted },
    };
  }

  async maybeResetLeader(roomSlug: string) {
    if (
      (await this.roomsLeadersAssociation.getLeaderForRoom(roomSlug)) !==
      undefined
    ) {
      return;
    }

    const roomPlayers = await this.roomsService.findAllPlayersInRoom(roomSlug);
    if (roomPlayers.length === 0) {
      return;
    }

    await this.roomsLeadersAssociation.setLeaderForRoom(
      roomPlayers[0].id,
      roomSlug,
    );
  }

  async getRoomPlayers(roomSlug: string): Promise<PlayerOutputDto[] | Error> {
    const room = await this.roomsService.findBySlug(roomSlug);
    if (!room) {
      return {
        success: false,
        error: 'wrong-room-slug',
      };
    }

    const leader = await this.roomsLeadersAssociation.getLeaderForRoom(
      roomSlug,
    );

    const roomPlayers: PlayerOutputDto[] = [];
    room.players.map((player) => {
      roomPlayers.push({
        id: player.socketId,
        color: player.color,
        nickName: player.nickName,
        isAdmin: leader && leader.socketId === player.socketId,
      });
    });

    return roomPlayers;
  }
}
