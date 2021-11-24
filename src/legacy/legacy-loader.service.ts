import { ConflictException, Injectable } from '@nestjs/common';
import { Room } from 'src/rooms/room.entity';
import { Room as RoomEntity } from './entities/room';
import { Panick_Attack } from './games/panic-attack';
import { Sandbox } from './games/sandbox';
import { BonusManager } from './managers/bonus-manager';
import { ObstaclesManager } from './managers/obstacles-manager';
import { PlayersManager } from './managers/players-manager';

@Injectable()
export class LegacyLoaderService {
  instancesData = [];

  constructor() {}

  create(instanceId: number, room: Room) {
    const playersManager = new PlayersManager();
    const legacyGame = new Sandbox(playersManager);
    //const legacyGame = new Panick_Attack();

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

  getDataForInstance(instanceId: number) {
    return this.instancesData.find((game) => (game.instanceID = instanceId));
  }
}
