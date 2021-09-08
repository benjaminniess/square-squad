import { ConflictException, Injectable } from '@nestjs/common';
import { GameInstance } from './game-instance.interface';

@Injectable()
export class GamesService {
  gameInstances = [];

  findAll(): GameInstance[] {
    return this.gameInstances;
  }

  findBySlug(roomSlug: string) {
    let foundInstance: GameInstance | null = null;

    this.gameInstances.map((instance) => {
      if (instance.roomSlug === roomSlug) {
        foundInstance = instance;
      }
    });

    return foundInstance;
  }

  deleteFromSlug(roomSlug: string) {
    if (this.findBySlug(roomSlug) === null) {
      throw new ConflictException('instance-does-not-exist');
    }

    this.gameInstances.map((instance, key) => {
      if (instance.roomSlug !== roomSlug) {
        return;
      }

      this.gameInstances.splice(key, 1);
    });
  }

  create(gameInstance: GameInstance) {
    if (this.findBySlug(gameInstance.roomSlug) !== null) {
      throw new ConflictException('instance-already-exists');
    }
    this.gameInstances.push(gameInstance);
  }
}
