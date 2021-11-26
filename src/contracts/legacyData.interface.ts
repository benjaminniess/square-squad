import { Room } from 'src/legacy/entities/room';
import { MasterGame } from 'src/legacy/games/master-game';
import { BonusManager } from 'src/legacy/managers/bonus-manager';
import { ObstaclesManager } from 'src/legacy/managers/obstacles-manager';
import { PlayersManager } from 'src/legacy/managers/players-manager';

export interface LegacyData {
  instanceId: number;
  obstacleManager: ObstaclesManager;
  bonusManager: BonusManager;
  playersManager: PlayersManager;
  room: Room;
  game: MasterGame;
}
