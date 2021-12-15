import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LegacyData } from '../contracts/legacyData.interface';

@Injectable()
export class KillPlayerGameOver {
  constructor(private eventEmitter: EventEmitter2) {
    this.eventEmitter.on('start-game', (legacyData: LegacyData) => {
      this.initGameOverEvent(legacyData);
    });
  }

  initGameOverEvent(legacyData: LegacyData) {
    legacyData.game.getEventEmmitter().on('kill-player', (playerId) => {
      const countAlive = legacyData.playersManager.countAlivePlayers();
      if (
        countAlive === 0 ||
        (countAlive === 1 && legacyData.playersManager.countPlayers() > 1)
      ) {
        this.eventEmitter.emit('game-is-over', legacyData);
      }
    });
  }
}
