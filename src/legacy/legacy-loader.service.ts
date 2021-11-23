import { ConflictException, Injectable } from '@nestjs/common';
import { Panick_Attack } from './games/panic-attack';
import { BonusManager } from './managers/bonus-manager';
import { ObstaclesManager } from './managers/obstacles-manager';
import { PlayersManager } from './managers/players-manager';

@Injectable()
export class LegacyLoaderService {
  instancesData = [];

  constructor() {}

  create(instanceId: number) {
    const legacyGame = new Panick_Attack();

    const gameData = {
      instanceId: instanceId,
      obstacleManager: new ObstaclesManager(legacyGame),
      bonusManager: new BonusManager(legacyGame),
      playersManager: new PlayersManager(legacyGame),
    };
    this.instancesData.push(gameData);

    return gameData;
  }

  getDataForInstance(instanceId: number) {
    return this.instancesData.find((game) => (game.instanceID = instanceId));
  }
}
