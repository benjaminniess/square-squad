import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LegacyData } from '../contracts/legacyData.interface';

@Injectable()
export class KillPlayerRefreshPlayers {
  constructor(private eventEmitter: EventEmitter2) {
    this.eventEmitter.on('start-game', (legacyData: LegacyData) => {
      this.initKillPlayerEvent(legacyData);
    });
  }

  initKillPlayerEvent(legacyData: LegacyData) {
    legacyData.game.getEventEmmitter().on('kill-player', (playerId) => {
      legacyData.room.refreshPlayers();
    });
  }
}
