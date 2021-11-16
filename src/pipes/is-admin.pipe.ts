import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class IsAdminPipe implements PipeTransform {
  socketId: string;
  roomsService: RoomsService;

  constructor(roomsService: RoomsService) {
    this.roomsService = roomsService;
  }
  async transform(value: any, metadata: ArgumentMetadata) {
    // It sends the whole socket on a first call for some reason
    if (metadata.type === 'custom') {
      this.socketId = value.id;
      return value;
    }

    const room = await this.roomsService.findBySlug(value.roomSlug);
    if (!room || !room.leader) {
      return {
        success: false,
        error: 'user-is-not-admin',
      };
    }

    return value;
  }
}
