import { Bonus } from '../bonus';

class Invincible extends Bonus {
  constructor(params: any) {
    super(params);
    this.imgX = 200;
    this.imgY = 100;
  }

  onTrigger() {
    return new Promise((resolve, reject) => {
      const game = this.getGame();
      const playerID = this.getPlayerID();
      const playersManager = game.getPlayersManager();
      const prevCollisionFilter = playersManager.getDefaultPlayerCollisionFilter();
      playersManager.setPlayerBodyData(playerID, {
        collisionFilter: {
          category: 0x1000,
          mask: 0x1010,
        },
      });

      setTimeout(function () {
        playersManager.uptadePlayerSingleData(playerID, 'bonusBlinking', false);
        playersManager.setPlayerBodyData(playerID, {
          collisionFilter: prevCollisionFilter,
        });

        resolve(true);
      }, this.getDuration());
    });
  }
}

export { Invincible };
