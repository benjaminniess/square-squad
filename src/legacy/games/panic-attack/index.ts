const squareSize = 30;
import { Matter } from 'matter-js';
import { MasterGame } from '../../games/master-game';
import { _ } from 'lodash';
import { Helpers } from 'src/helpers/helpers';

class Panick_Attack extends MasterGame {
  private helpers: Helpers;

  constructor(room: any) {
    super(room);
    this.speed = 2;
    this.slug = 'panic-attack';
    this.type = 'battle-royale';
    this.helpers = new Helpers();
    this.eventSubscriptions();
  }

  eventSubscriptions() {
    this.getObstaclesManager()
      .getEventEmmitter()
      .on('obstacleOver', (data: any) => {
        this.getPlayersManager().addPlayersPoints();
        this.syncScores();
        this.getRoom().refreshPlayers();
      });

    Matter.Events.on(this.getEngine(), 'collisionStart', (event: any) => {
      _.forEach(event.pairs, (collisionPair: any) => {
        if (collisionPair.bodyA.enableCustomCollisionManagement === true) {
          const targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
            collisionPair.bodyA.id,
          );

          if (targetObstacle) {
            targetObstacle.onCollisionStart(
              collisionPair.bodyA,
              collisionPair.bodyB,
            );
          }
        }

        if (collisionPair.bodyB.enableCustomCollisionManagement === true) {
          const targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
            collisionPair.bodyB.id,
          );

          if (targetObstacle) {
            targetObstacle.onCollisionStart(
              collisionPair.bodyB,
              collisionPair.bodyA,
            );
          }
        }

        let player;
        let otherBody;
        if (collisionPair.bodyA.gamePlayerID) {
          player = collisionPair.bodyA;
          otherBody = collisionPair.bodyB;
        } else if (collisionPair.bodyB.gamePlayerID) {
          player = collisionPair.bodyB;
          otherBody = collisionPair.bodyA;
        } else {
          return;
        }

        if (otherBody.customType !== 'obstacle') {
          return;
        }

        Matter.Composite.remove(
          this.getPlayersManager().getComposite(),
          player,
          true,
        );

        this.getPlayersManager().killPlayer(player.gamePlayerID);
        this.getRoom().refreshPlayers();
      });

      Matter.Events.on(this.getEngine(), 'collisionEnd', (event: any) => {
        _.forEach(event.pairs, (collisionPair: any) => {
          if (collisionPair.bodyA.enableCustomCollisionManagement === true) {
            const targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
              collisionPair.bodyA.id,
            );

            if (targetObstacle) {
              targetObstacle.onCollisionEnd(
                collisionPair.bodyA,
                collisionPair.bodyB,
              );
            }
          }

          if (collisionPair.bodyB.enableCustomCollisionManagement === true) {
            const targetObstacle = this.getObstaclesManager().getObstacleFromBodyID(
              collisionPair.bodyB.id,
            );

            if (targetObstacle) {
              targetObstacle.onCollisionEnd(
                collisionPair.bodyB,
                collisionPair.bodyA,
              );
            }
          }
        });
      });
    });
  }

  refreshData() {
    //console.log(this.getDebugMatterTree())
    const obstacleManager = this.getObstaclesManager();
    const obstacles = obstacleManager.getObstacles();
    const bonusManager = this.getBonusManager();
    const bonusList = bonusManager.getActiveBonus();
    const playersManager = this.getPlayersManager();
    const playersData = playersManager.getPlayersData();

    let increasePoints = 0;

    const updatedBonus: any[] = [];

    if (this.getStatus() === 'playing') {
      if (
        !process.env.DISABLE_OBSTACLES ||
        process.env.DISABLE_OBSTACLES !== 'true'
      ) {
        if (obstacles.length === 0) {
          obstacleManager.initObstacle();
          if (this.getScore() > 2 && this.helpers.getRandomInt(1, 3) === 2) {
            obstacleManager.initObstacle({ speedMultiplicator: 0.5 });
          }
          this.increaseScore();
          increasePoints = this.getScore();
          this.obstaclesManager.setLevel(increasePoints);
          this.getRoom().refreshPlayers();
        } else {
          obstacleManager.updateObstacles();
        }

        if (bonusList.length < bonusManager.getFrequency()) {
          bonusManager.maybeInitBonus();
        }
      }

      _.forEach(
        playersManager.getPlayersMoves(),
        (moves: any, playerID: string) => {
          const playerData = playersData[playerID];

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
      obstacles: obstacleManager.getObstaclesParts(),
      debugBodies: this.getDebugBodies(),
      bonusList: updatedBonus,
      score: increasePoints > 0 ? increasePoints - 1 : null,
    };
  }
}
export { Panick_Attack };
