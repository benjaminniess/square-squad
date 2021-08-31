import { ConflictException, Injectable } from '@nestjs/common';
import { Room } from './room.interface';
import { RoomsServiceInterface } from './rooms.service.interface';

@Injectable()
export class RoomsService implements RoomsServiceInterface {
  private rooms: Room[] = [];

  findAll(): Room[] {
    return this.rooms;
  }

  findById(id: string) {
    let foundRoom: Room | null = null;

    this.rooms.map((room) => {
      if (room.id === id) {
        foundRoom = room;
      }
    });

    return foundRoom;
  }

  create(room: Room) {
    if (this.findById(room.id) !== null) {
      throw new ConflictException('room-already-exists');
    }
    this.rooms.push(room);
  }

  deleteFromId(id: string) {
    if (this.findById(id) === null) {
      throw new ConflictException('room-does-not-exist');
    }

    this.rooms.map((room, key) => {
      if (room.id !== id) {
        return;
      }

      this.rooms.splice(key, 1);
    });
  }
}
