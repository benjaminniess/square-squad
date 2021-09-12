import { ConflictException, Injectable } from '@nestjs/common';
import validator from 'validator';
import { Helpers } from '../helpers/helpers';
import { Room } from './room.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    private helpers: Helpers,
  ) {}

  findAll(): Promise<Room[]> {
    return this.roomsRepository.find();
  }

  findOne(args: any = null): Promise<Room> {
    return this.roomsRepository.findOne(args);
  }

  findBySlug(roomSlug: string) {
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

  async deleteFromSlug(slug: string) {
    if (!(await this.findBySlug(slug))) {
      throw new ConflictException('room-does-not-exist');
    }

    await this.roomsRepository.delete({
      slug: slug,
    });
  }

  private convertNameToSlug(roomName: string): string {
    return this.helpers.stringToSlug(roomName);
  }
}
