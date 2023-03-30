import {Room} from "../entity/Room";

export {MasterGame}
const {squareSize} = require('../config/main')
const BonusManager = require('../managers/bonus-manager')
const ObstaclesManager = require('../managers/obstacles-manager')
const PlayersManager = require('../managers/players-manager')
const Matter = require('matter-js')
const {EventEmitter} = require('events')
const _ = require('lodash')

const Engine = Matter.Engine
const Runner = Matter.Runner
const Bodies = Matter.Bodies
const Composite = Matter.Composite

class MasterGame {
  private speed: number = 6
  private score: number = 0
  private duration: number = 30
  private playersData: any = {}
  private playersMoves: any = {}
  private status: string = 'waiting'
  private type: string = 'countdown'
  private room: any
  private ranking: any[] = []
  private lastRoundRanking: any[] = []
  private lastWinner: any = {}
  private totalRounds: number = 3
  private bonusFrequency: number = 5
  private bonusManager
  private eventEmitter
  private slug: string = ''
  private engine: any
  private runner: any
  private obstaclesManager: any
  private playersManager: any
  private roundNumber: number = 3

  constructor(room: Room) {
    if (!room) {
      throw new Error('Missing room')
    }

    this.room = room

    this.bonusManager = new BonusManager(this)
    this.eventEmitter = new EventEmitter()
    this.initEngine()
  }

  initEngine() {
    this.engine = Engine.create()
    this.engine.world.gravity.y = 0
    this.runner = Runner.create()
    Runner.run(this.runner, this.engine)
    this.obstaclesManager = new ObstaclesManager(this)
    this.playersManager = new PlayersManager(this)

    Composite.add(this.engine.world, [
      this.getPlayersManager().getComposite(),
      this.getObstaclesManager().getComposite(),
      this.getObstaclesManager().getWallsComposite()
    ])
  }

  getDebugMatterTree() {
    let worldComposites = Matter.Composite.allComposites(this.engine.world)
    let worldBodies = Matter.Composite.allBodies(this.engine.world)

    let tree = [
      {
        label: 'world',
        composites: _.size(worldComposites),
        bodies: _.size(worldBodies)
      }
    ]

    _.forEach(worldComposites, (composite: any) => {
      tree.push({
        label: composite.label,
        composites: _.size(Matter.Composite.allComposites(composite)),
        bodies: _.size(Matter.Composite.allBodies(composite))
      })
    })

    return tree
  }

  getDebugBodies() {
    let debugBodies: any[] = []
    if (process.env.MATTER_DEBUG && process.env.MATTER_DEBUG === 'true') {
      let worldBodies = Matter.Composite.allBodies(this.engine.world)
      _.forEach(worldBodies, (wb: any) => {
        _.forEach(wb.vertices, (vertice: any) => {
          debugBodies.push({x: vertice.x, y: vertice.y})
        })
      })
    }

    return debugBodies
  }

  getEngine() {
    return this.engine
  }

  getRoom() {
    return this.room
  }

  getSlug() {
    return this.slug
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
    return this.status
  }

  getObstaclesManager() {
    return this.obstaclesManager
  }

  getBonusManager() {
    return this.bonusManager
  }

  getPlayersManager() {
    return this.playersManager
  }

  getEventEmmitter() {
    return this.eventEmitter
  }

  getRoundNumber() {
    return this.roundNumber
  }

  getTotalRounds() {
    return this.totalRounds
  }

  getBonusFrequency() {
    return this.bonusFrequency
  }

  getScore() {
    return this.score
  }

  getSpeed() {
    return this.speed
  }

  getDuration() {
    return this.duration
  }

  getType() {
    return this.type
  }

  getRanking() {
    return this.ranking
  }

  getHighestScore() {
    let globalRanking = this.getRanking()
    if (globalRanking.length === 0) {
      return 0
    } else {
      return globalRanking[0].score
    }
  }

  getLastRoundRanking() {
    return this.lastRoundRanking
  }

  getLastRoundWinner() {
    return this.getLastRoundRanking()[0]
  }

  getBasicData() {
    return {
      squareSize: squareSize
    }
  }

  initGame() {
    this.roundNumber = 0
    this.initRound()
    this.resetRanking()
    this.resetLastRoundRanking()
    this.setStatus('starting')
    this.getEventEmmitter().emit('initGame')
  }

  initRound() {
    this.roundNumber++
    this.score = 0
    this.lastRoundRanking = []
    this.getObstaclesManager().resetObstacles()

    this.getBonusManager().setFrequency(this.getBonusFrequency())
    this.getBonusManager().resetBonus()
    this.getEventEmmitter().emit('initRound')
  }

  setTotalRounds(roundsNumber: number) {
    this.totalRounds = roundsNumber
  }

  setBonusFrequency(frequency: number) {
    this.bonusFrequency = frequency
  }

  increaseScore() {
    this.score++
  }

  resetRanking() {
    this.ranking = []
  }

  resetLastRoundRanking() {
    this.lastRoundRanking = []
  }

  syncScores() {
    let playersData = this.getPlayersManager().getPlayersData()
    this.lastRoundRanking = []
    _.forEach(playersData, (playerData: any, playerID: string) => {
      this.lastRoundRanking.push({
        playerID: playerID,
        score: playerData.score
      })
    })

    this.lastRoundRanking = _.orderBy(
      this.lastRoundRanking,
      ['score'],
      ['desc']
    )
  }

  saveRoundScores() {
    let lastRoundRanking = this.getLastRoundRanking()
    _.forEach(lastRoundRanking, (lastRoundResult: any) => {
      let index = _.findIndex(this.ranking, {
        playerID: lastRoundResult.playerID
      })

      if (index === -1) {
        this.ranking.push({
          playerID: lastRoundResult.playerID,
          score: lastRoundResult.score
        })
      } else {
        this.ranking[index].score += lastRoundResult.score
      }
    })

    this.ranking = _.orderBy(this.ranking, ['score'], ['desc'])
  }

  setStatus(status: string) {
    this.status = status
  }

  // Required method
  refreshData() {
  }
}

module.exports = MasterGame
