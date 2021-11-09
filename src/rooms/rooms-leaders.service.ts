import { Injectable } from '@nestjs/common';
import { PlayersService } from '../players/players.service';
import { PlayerDto } from '../players/player.dto.interface';
import { RoomsService } from './rooms.service';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoomsLeadersService implements RoomsLeadersService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    private playersService: PlayersService,
    private roomsService: RoomsService,
  ) {}

  async getLeaderForRoom(roomSlug: string): Promise<PlayerDto> | null {
    let room = undefined;

    try {
      room = await this.roomsService.findBySlug(roomSlug);
      if (!room) {
        return undefined;
      }

      if (!room.leader) {
        return undefined;
      }
    } catch (error) {
      return undefined;
    }

    return room.leader;
  }

  async setLeaderForRoom(playerId: number, roomSlug: string) {
    const room = await this.roomsService.findBySlug(roomSlug);
    if (!room) {
      return {
        success: false,
        error: 'wrong-room-slug',
      };
    }

    const player = await this.playersService.findById(playerId);
    if (!player) {
      return {
        success: false,
        error: 'wrong-player-id',
      };
    }

    room.leader = player;
    await this.roomsRepository.save(room);
  }

  async removeLeaderFromRoom(roomSlug: string) {
    const room = await this.roomsService.findBySlug(roomSlug);
    if (!room) {
      return {
        success: false,
        error: 'wrong-room-slug',
      };
    }

    room.leader = null;

    await this.roomsRepository.save(room);
  }

  async isPlayerLeaderOfRoom(
    player: PlayerDto,
    roomSlug: string,
  ): Promise<boolean> {
    const leader = await this.getLeaderForRoom(roomSlug);
    if (!leader) {
      return false;
    }

    return leader.socketId === player.socketId;
  }
}
