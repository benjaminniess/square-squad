import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LegacyData } from '../contracts/legacyData.interface';

@Injectable()
export class StartGameStartCountdown {
  constructor(private eventEmitter: EventEmitter2) {
    this.eventEmitter.on('start-game', (gameData: LegacyData) => {
      this.startCountdown(gameData);
    });
  }

  startCountdown(gameData: LegacyData) {
    let timeleft = 3;
    const countdownTimer = setInterval(
      async function (gameData: LegacyData) {
        if (timeleft <= 0) {
          clearInterval(countdownTimer);

          this.eventEmitter.emit('countdown-over', {
            gameInstanceId: gameData.instanceId,
          });
        }

        this.eventEmitter.emit('countdown-update', {
          roomSlug: gameData.room.getSlug(),
          timeleft,
        });

        timeleft -= 1;
      }.bind(this),
      1000,
      gameData,
    );
  }
}
