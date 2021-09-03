import { ConflictException, Injectable } from '@nestjs/common';
import { Room } from './room.interface';
import { RoomsServiceInterface } from './rooms.service.interface';
import validator from 'validator';
import { Helpers } from '../helpers/helpers';

@Injectable()
export class RoomsService implements RoomsServiceInterface {
  constructor(private helpers: Helpers) {}

  private rooms: Room[] = [];

  findAll(): Room[] {
    return this.rooms;
  }

  findBySlug(slug: string) {
    let foundRoom: Room | null = null;

    this.rooms.map((room) => {
      if (room.slug === slug) {
        foundRoom = room;
      }
    });

    return foundRoom;
  }

  create(roomName: string): string {
    if (!roomName || roomName.length <= 0) {
      throw new ConflictException('room-name-empty');
    }

    roomName = validator.blacklist(roomName, "<>\\/'");
    const roomSlug = this.convertNameToSlug(roomName);

    if (this.findBySlug(roomSlug) !== null) {
      throw new ConflictException('room-already-exists');
    }
    this.rooms.push({ name: roomName, slug: roomSlug });

    return roomSlug;
  }

  deleteFromSlug(slug: string) {
    if (this.findBySlug(slug) === null) {
      throw new ConflictException('room-does-not-exist');
    }

    this.rooms.map((room, key) => {
      if (room.slug !== slug) {
        return;
      }

      this.rooms.splice(key, 1);
    });
  }

  private convertNameToSlug(roomName: string): string {
    return this.helpers.stringToSlug(roomName);
  }
}
