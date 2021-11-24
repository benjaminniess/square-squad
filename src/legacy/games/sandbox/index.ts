import { PlayersManager } from 'src/legacy/managers/players-manager';
import { MasterGame } from '../../games/master-game';

class Sandbox extends MasterGame {
  constructor(playersManager: PlayersManager) {
    super(playersManager);
    this.speed = 2;
    this.slug = 'sandbox';
    this.type = 'battle-royale';
  }

  refreshData() {
    // console.log(this.getDebugMatterTree());
    const playersManager = this.getPlayersManager();
    const playersData = playersManager.getPlayersData();
    if (this.getStatus() === 'playing') {
      playersManager.processPlayersRequests();
    }

    return {
      players: playersData,
      debugBodies: this.getDebugBodies(),
      score: 0,
    };
  }
}
export { Sandbox };
