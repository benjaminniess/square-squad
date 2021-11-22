import { Helpers } from 'src/helpers/helpers';
import { Bonus } from '../bonus';

class Speed extends Bonus {
  constructor(params: any) {
    super(params);
    this.imgX = 0;
    this.imgY = 0;
  }

  onTrigger() {
    return new Promise((resolve, reject) => {
      const game = this.getGame();
      const playerID = this.getPlayerID();
      const playerData = game.getPlayersManager().getPlayerData(playerID);
      playerData.speedMultiplicator *= 1.5;
      game.getPlayersManager().setPlayerData(playerID, playerData);
      setTimeout(function () {
        playerData.speedMultiplicator = 1;
        game.getPlayersManager().setPlayerData(playerID, playerData);

        resolve(true);
      }, this.getDuration());
    });
  }
}

export { Speed };
