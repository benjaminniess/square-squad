import { Injectable } from '@nestjs/common';
import { LegacyData } from 'src/contracts/legacyData.interface';
import { Room } from '../entities/room.entity';
import { Room as RoomEntity } from './entities/room';
import { Panick_Attack } from './games/panic-attack';
import { BonusManager } from './managers/bonus-manager';
import { ObstaclesManager } from './managers/obstacles-manager';
import { PlayersManager } from './managers/players-manager';

@Injectable()
export class LegacyLoaderService {
  instancesData = [];

  constructor() {}

  create(instanceId: number, room: Room): LegacyData {
    const playersManager = new PlayersManager();
    const legacyGame = new Panick_Attack(playersManager);

    const gameData = {
      instanceId: instanceId,
      obstacleManager: new ObstaclesManager(legacyGame),
      bonusManager: new BonusManager(legacyGame),
      playersManager: playersManager,
      room: new RoomEntity(room.slug, room.name, legacyGame),
      game: legacyGame,
    };
    this.instancesData.push(gameData);

    return gameData;
  }

  getDataForInstance(instanceId: number): LegacyData {
    return this.instancesData.find((game) => (game.instanceId = instanceId));
  }
}
