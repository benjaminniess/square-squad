import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { LegacyLoaderService } from '../legacy/legacy-loader.service';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class IsAdminPipe implements PipeTransform {
  socketId: string;
  roomsService: RoomsService;
  legacyLoader: LegacyLoaderService;

  constructor(roomsService: RoomsService, legacyLoader: LegacyLoaderService) {
    this.roomsService = roomsService;
    this.legacyLoader = legacyLoader;
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    // It sends the whole socket on a first call for some reason
    if (metadata.type === 'custom') {
      this.socketId = value.id;
      return value;
    }

    if (!value.roomSlug && !value.instanceId) {
      return {
        success: false,
        error: 'missing-room-slug-or-id',
      };
    }

    let room;
    if (value.roomSlug) {
      room = await this.roomsService.findBySlug(value.roomSlug);
    } else {
      const legacyData = this.legacyLoader.getDataForInstance(value.instanceId);
      if (!legacyData) {
        return {
          success: false,
          error: 'user-is-not-admin',
        };
      }
      room = await this.roomsService.findBySlug(legacyData.room.getSlug());
    }

    if (!room || !room.leader || room.leader.socketId !== this.socketId) {
      return {
        success: false,
        error: 'user-is-not-admin',
      };
    }

    return value;
  }
}
