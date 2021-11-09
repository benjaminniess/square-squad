import { ConflictException, Injectable } from '@nestjs/common';
import validator from 'validator';
import { Helpers } from '../helpers/helpers';
import { Room } from './room.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../players/player.entity';
import { PlayersService } from '../players/players.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    private playersService: PlayersService,
    private helpers: Helpers,
  ) {}

  findAll(): Promise<Room[]> {
    return this.roomsRepository.find();
  }

  findOne(args: any = null): Promise<Room> {
    return this.roomsRepository.findOne(args);
  }

  findBySlug(roomSlug: string): Promise<Room> {
    return this.findOne({
      where: { slug: roomSlug },
    });
  }

  async create(roomName: string): Promise<string> {
    if (!roomName || roomName.length <= 0) {
      throw new ConflictException('room-name-empty');
    }

    roomName = validator.blacklist(roomName, "<>\\/'");
    const roomSlug = this.convertNameToSlug(roomName);

    const room = new Room();
    room.name = roomName;
    room.slug = roomSlug;

    try {
      await this.roomsRepository.save(room);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new ConflictException('room-already-exists');
      }

      throw error;
    }

    return roomSlug;
  }

  private convertNameToSlug(roomName: string): string {
    return this.helpers.stringToSlug(roomName);
  }

  async deleteFromSlug(slug: string) {
    const room = await this.findBySlug(slug);
    if (!room) {
      throw new ConflictException('room-does-not-exist');
    }

    await this.roomsRepository.delete({
      slug: slug,
    });
  }

  async findAllPlayersInRoom(roomSlug: string): Promise<Player[]> {
    const room = await this.findBySlug(roomSlug);
    if (!room) {
      return [];
    }

    return room.players;
  }

  async findEmptyRoomsSlugs(): Promise<string[]> {
    const roomSlugs = [];

    const rooms = await this.findAll();
    rooms.map((room) => {
      if (room.players.length > 0) {
        return;
      }

      roomSlugs.push(room.slug);
    });

    return roomSlugs;
  }

  async addPlayerToRoom(playerId: number, roomSlug: string) {
    const room = await this.findBySlug(roomSlug);
    if (!room) {
      throw new ConflictException('room-does-not-exist');
    }

    const player = await this.playersService.findById(playerId);
    if (!player) {
      throw new ConflictException('player-does-not-exist');
    }

    if (!room.players) {
      room.players = [];
    }

    room.players.push(player);

    await this.roomsRepository.save(room);
  }

  async removePlayerFromRoom(playerId: number, roomSlug: string) {
    const room = await this.findBySlug(roomSlug);
    if (!room) {
      throw new ConflictException('room-does-not-exist');
    }

    room.players = room.players.filter((player) => {
      return player.id !== playerId;
    });

    await this.roomsRepository.save(room);
  }

  async removePlayerFromRooms(playerId: number) {
    const room = await this.playersService.findPlayerRoom(playerId);
    if (!room) {
      return;
    }

    await this.removePlayerFromRoom(playerId, room.slug);
  }

  async removeAllPlayersInRoom(roomSlug: string) {
    const room = await this.findBySlug(roomSlug);
    if (!room) {
      throw new ConflictException('room-does-not-exist');
    }

    room.players = [];
    await this.roomsRepository.save(room);
  }

  async isPlayerInARoom(playerId: number): Promise<boolean> {
    const room = await this.playersService.findPlayerRoom(playerId);
    if (!room) {
      return false;
    }

    return true;
  }

  // /!\ For test usage only
  async clear() {
    await this.roomsRepository.query(
      `PRAGMA foreign_keys=off; DELETE FROM room;`,
    );
    await this.roomsRepository.clear();
  }
}
