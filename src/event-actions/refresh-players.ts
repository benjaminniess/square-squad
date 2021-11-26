import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LegacyData } from '../contracts/legacyData.interface';

@Injectable()
export class RefreshPlayers {
  constructor(private eventEmitter: EventEmitter2) {
    this.eventEmitter.on('start-game', (gameData: LegacyData) => {
      gameData.room.refreshPlayers();
    });
  }
}
