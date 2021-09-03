import { ConflictException, Injectable } from '@nestjs/common';
import { Room } from './room.interface';
import { RoomsServiceInterface } from './rooms.service.interface';

@Injectable()
export class RoomsService implements RoomsServiceInterface {
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

  create(room: Room) {
    if (this.findBySlug(room.slug) !== null) {
      throw new ConflictException('room-already-exists');
    }
    this.rooms.push(room);
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
}
