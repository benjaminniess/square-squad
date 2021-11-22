export { MasterGame };
import { BonusManager } from '../managers/bonus-manager';
import { ObstaclesManager } from '../managers/obstacles-manager';
import { PlayersManager } from '../managers/players-manager';
import { Matter } from 'matter-js';
import { EventEmitter } from 'events';
import { _ } from 'lodash';

const Engine = Matter.Engine;
const Runner = Matter.Runner;
const Composite = Matter.Composite;

class MasterGame {
  protected speed = 6;
  protected type = 'countdown';
  protected slug = '';
  protected obstaclesManager: any;
  private score = 0;
  private duration = 30;
  private status = 'waiting';
  private room: any;
  private ranking: any[] = [];
  private lastRoundRanking: any[] = [];
  private totalRounds = 3;
  private bonusFrequency = 5;
  private bonusManager;
  private eventEmitter;
  private engine: any;
  private runner: any;
  private playersManager: any;
  private roundNumber = 3;

  constructor(room: any) {
    if (!room) {
      throw new Error('Missing room');
    }

    this.room = room;

    this.bonusManager = new BonusManager(this);
    this.eventEmitter = new EventEmitter();
    this.initEngine();
  }

  initEngine() {
    this.engine = Engine.create();
    this.engine.world.gravity.y = 0;
    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);
    this.obstaclesManager = new ObstaclesManager(this);
    this.playersManager = new PlayersManager(this);

    Composite.add(this.engine.world, [
      this.getPlayersManager().getComposite(),
      this.getObstaclesManager().getComposite(),
      this.getObstaclesManager().getWallsComposite(),
    ]);
  }

  getDebugMatterTree() {
    const worldComposites = Matter.Composite.allComposites(this.engine.world);
    const worldBodies = Matter.Composite.allBodies(this.engine.world);

    const tree = [
      {
        label: 'world',
        composites: _.size(worldComposites),
        bodies: _.size(worldBodies),
      },
    ];

    _.forEach(worldComposites, (composite: any) => {
      tree.push({
        label: composite.label,
        composites: _.size(Matter.Composite.allComposites(composite)),
        bodies: _.size(Matter.Composite.allBodies(composite)),
      });
    });

    return tree;
  }

  getDebugBodies() {
    const debugBodies: any[] = [];
    if (process.env.MATTER_DEBUG && process.env.MATTER_DEBUG === 'true') {
      const worldBodies = Matter.Composite.allBodies(this.engine.world);
      _.forEach(worldBodies, (wb: any) => {
        _.forEach(wb.vertices, (vertice: any) => {
          debugBodies.push({ x: vertice.x, y: vertice.y });
        });
      });
    }

    return debugBodies;
  }

  getEngine() {
    return this.engine;
  }

  getRoom() {
    return this.room;
  }

  getSlug() {
    return this.slug;
  }

  /**
   * waiting: waiting for players to join the lobby | game ended
   * starting: redirecting users to the play screen + launching the countdown
   * playing: game has started
   * end-round: atfer a round but some more rounds are coming
   *
   * @returns
   */
  getStatus() {
    return this.status;
  }

  getObstaclesManager() {
    return this.obstaclesManager;
  }

  getBonusManager() {
    return this.bonusManager;
  }

  getPlayersManager() {
    return this.playersManager;
  }

  getEventEmmitter() {
    return this.eventEmitter;
  }

  getRoundNumber() {
    return this.roundNumber;
  }

  getTotalRounds() {
    return this.totalRounds;
  }

  getBonusFrequency() {
    return this.bonusFrequency;
  }

  getScore() {
    return this.score;
  }

  getSpeed() {
    return this.speed;
  }

  getDuration() {
    return this.duration;
  }

  getType() {
    return this.type;
  }

  getRanking() {
    return this.ranking;
  }

  getHighestScore() {
    const globalRanking = this.getRanking();
    if (globalRanking.length === 0) {
      return 0;
    } else {
      return globalRanking[0].score;
    }
  }

  getLastRoundRanking() {
    return this.lastRoundRanking;
  }

  getLastRoundWinner() {
    return this.getLastRoundRanking()[0];
  }

  getBasicData() {
    return {
      squareSize: 30,
    };
  }

  initGame() {
    this.roundNumber = 0;
    this.initRound();
    this.resetRanking();
    this.resetLastRoundRanking();
    this.setStatus('starting');
    this.getEventEmmitter().emit('initGame');
  }

  initRound() {
    this.roundNumber++;
    this.score = 0;
    this.lastRoundRanking = [];
    this.getObstaclesManager().resetObstacles();

    this.getBonusManager().setFrequency(this.getBonusFrequency());
    this.getBonusManager().resetBonus();
    this.getEventEmmitter().emit('initRound');
  }

  setTotalRounds(roundsNumber: number) {
    this.totalRounds = roundsNumber;
  }

  setBonusFrequency(frequency: number) {
    this.bonusFrequency = frequency;
  }

  increaseScore() {
    this.score++;
  }

  resetRanking() {
    this.ranking = [];
  }

  resetLastRoundRanking() {
    this.lastRoundRanking = [];
  }

  syncScores() {
    const playersData = this.getPlayersManager().getPlayersData();
    this.lastRoundRanking = [];
    _.forEach(playersData, (playerData: any, playerID: string) => {
      this.lastRoundRanking.push({
        playerID: playerID,
        score: playerData.score,
      });
    });

    this.lastRoundRanking = _.orderBy(
      this.lastRoundRanking,
      ['score'],
      ['desc'],
    );
  }

  saveRoundScores() {
    const lastRoundRanking = this.getLastRoundRanking();
    _.forEach(lastRoundRanking, (lastRoundResult: any) => {
      const index = _.findIndex(this.ranking, {
        playerID: lastRoundResult.playerID,
      });

      if (index === -1) {
        this.ranking.push({
          playerID: lastRoundResult.playerID,
          score: lastRoundResult.score,
        });
      } else {
        this.ranking[index].score += lastRoundResult.score;
      }
    });

    this.ranking = _.orderBy(this.ranking, ['score'], ['desc']);
  }

  setStatus(status: string) {
    this.status = status;
  }

  refreshData() {
    // Required method
  }
}

module.exports = MasterGame;
