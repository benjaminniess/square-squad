const squareSize = 30;
import * as Matter from 'matter-js';
import { MasterGame } from '../../games/master-game';
import { _ } from 'lodash';
import { PlayersManager } from 'src/legacy/managers/players-manager';

class Wolf_And_Sheep extends MasterGame {
  private wolf: string;

  constructor(playersManager: PlayersManager) {
    super(playersManager);
    this.speed = 4;
    this.slug = 'wolf-and-sheeps';
    this.type = 'timed';
    this.wolf = null;
    this.eventSubscriptions();
  }

  eventSubscriptions() {
    this.getEventEmmitter().on('initRound', () => {
      const playersData = this.getPlayersManager().getPlayersData();
      _.shuffle(_.keys(playersData));
      this.setWolf(Object.keys(playersData)[0]);
    });

    Matter.Events.on(this.getEngine(), 'collisionStart', (event: any) => {
      if (
        !event.pairs[0].bodyA.gamePlayerID ||
        !event.pairs[0].bodyB.gamePlayerID
      ) {
        return;
      }

      const currentWolf = this.getWolf();
      if (
        event.pairs[0].bodyA.gamePlayerID === currentWolf &&
        this.isCatchable(event.pairs[0].bodyB.gamePlayerID)
      ) {
        this.setCatchable(event.pairs[0].bodyA.gamePlayerID, false);
        this.setWolf(event.pairs[0].bodyB.gamePlayerID);
      } else if (
        event.pairs[0].bodyB.gamePlayerID === currentWolf &&
        this.isCatchable(event.pairs[0].bodyA.gamePlayerID)
      ) {
        this.setCatchable(event.pairs[0].bodyB.gamePlayerID, false);
        this.setWolf(event.pairs[0].bodyA.gamePlayerID);
      }

      //this.getPlayersManager().killPlayer(player.gamePlayerID)
      //this.getRoom().refreshPlayers()
    });
  }

  refreshData() {
    //console.log(this.getDebugMatterTree())

    const bonusManager = this.getBonusManager();
    const bonusList = bonusManager.getActiveBonus();
    const playersManager = this.getPlayersManager();
    const playersData = playersManager.getPlayersData();

    const updatedBonus: any[] = [];

    if (this.getStatus() === 'playing') {
      if (bonusList.length < bonusManager.getFrequency()) {
        bonusManager.maybeInitBonus();
      }

      _.forEach(
        playersManager.getPlayersMoves(),
        (moves: any, playerID: string) => {
          const playerData = playersData[playerID];

          playersData[playerID].isWolf = playerID === this.getWolf();

          bonusList.map((bonus: any) => {
            const bonusData = bonus.getData();
            if (
              playerData.x - squareSize / 2 < bonusData.x + bonusData.width &&
              playerData.x - squareSize / 2 + squareSize > bonusData.x &&
              playerData.y - squareSize / 2 < bonusData.y + bonusData.height &&
              squareSize + playerData.y - squareSize / 2 > bonusData.y
            ) {
              playersManager.uptadePlayerSingleData(
                playerID,
                'bonus',
                bonusData,
              );
              bonus.trigger(playerID).then(() => {
                playersManager.uptadePlayerSingleData(playerID, 'bonus', null);
              });
            } else {
              updatedBonus.push(bonusData);
            }
          });
        },
      );

      playersManager.processPlayersRequests();
    }

    return {
      players: playersData,
      debugBodies: this.getDebugBodies(),
      bonusList: updatedBonus,
    };
  }

  getWolf() {
    return this.wolf;
  }

  setWolf(playerID: string) {
    this.wolf = playerID;
  }

  setCatchable(playerID: string, catchable = true) {
    const playersManager = this.getPlayersManager();
    playersManager.uptadePlayerSingleData(playerID, 'catchable', catchable);
    if (!catchable) {
      const notCatchableTimer = setInterval(function () {
        clearInterval(notCatchableTimer);
        playersManager.uptadePlayerSingleData(playerID, 'catchable', true);
      }, 1000);
    }
  }

  isCatchable(playerID: string) {
    return this.getPlayersManager().getPlayerData(playerID).catchable;
  }
}

module.exports = Wolf_And_Sheep;
