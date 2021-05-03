'use strict'

const BonusManager = require(__base + '/lib/bonus-manager')
const ObstaclesManager = require(__base + '/lib/obstacles-manager')
const PlayersManager = require(__base + '/lib/players-manager')
const Matter = require('matter-js')

const Engine = Matter.Engine
const Runner = Matter.Runner
const Bodies = Matter.Bodies
const Composite = Matter.Composite

class MasterGame {
  constructor(room) {
    this.speed = 6
    this.duration = 30
    this.playersData = {}
    this.playersMoves = {}
    this.status = 'waiting'
    this.type = 'countdown'
    this.room = room
    this.ranking = []
    this.lastRoundRanking = []
    this.lastWinner = {}
    this.totalRounds = 3
    this.bonusFrequency = 5
    this.bonusManager = new BonusManager(this)
    this.initEngine()
  }

  initEngine() {
    this.engine = Engine.create()
    this.engine.world.gravity.y = 0
    this.runner = Runner.create()
    Runner.run(this.runner, this.engine)
    this.obstaclesManager = new ObstaclesManager(
      this,
      Composite.create('obstacles'),
    )
    this.playersManager = new PlayersManager(this, Composite.create('players'))
    let walls = Composite.create('walls')
    Matter.Composite.add(walls, [
      // Top
      Matter.Bodies.rectangle(canvasWidth / 2, -20, canvasWidth, 10, {
        isStatic: true,
      }),
      // Left
      Matter.Bodies.rectangle(-20, canvasWidth / 2, 10, canvasWidth, {
        isStatic: true,
      }),
      // Right
      Matter.Bodies.rectangle(
        canvasWidth - 10,
        canvasWidth / 2,
        10,
        canvasWidth,
        {
          isStatic: true,
        },
      ),
      // Bottom
      Matter.Bodies.rectangle(
        canvasWidth / 2,
        canvasWidth - 10,
        canvasWidth,
        10,
        { isStatic: true },
      ),
    ])
    Composite.add(this.engine.world, [
      this.getPlayersManager().getComposite(),
      this.getObstaclesManager().getComposite(),
      walls,
    ])
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
      squareSize: squareSize,
    }
  }

  initGame() {
    this.roundNumber = 0
    this.initRound()
    this.resetRanking()
    this.resetLastRoundRanking()
    this.setStatus('starting')
  }

  initRound() {
    this.roundNumber++
    this.score = 0
    this.lastRoundRanking = []
    this.getObstaclesManager().resetObstacles()

    this.getBonusManager().setFrequency(this.getBonusFrequency())
    this.getBonusManager().resetBonus()
  }

  setTotalRounds(roundsNumber) {
    this.totalRounds = roundsNumber
  }

  setBonusFrequency(frequency) {
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
    _.forEach(playersData, (playerData, playerID) => {
      this.lastRoundRanking.push({
        playerID: playerID,
        score: playerData.score,
      })
    })

    this.lastRoundRanking = _.orderBy(
      this.lastRoundRanking,
      ['score'],
      ['desc'],
    )
  }

  saveRoundScores() {
    let lastRoundRanking = this.getLastRoundRanking()
    _.forEach(lastRoundRanking, (lastRoundResult) => {
      let index = _.findIndex(this.ranking, {
        playerID: lastRoundResult.playerID,
      })

      if (index === -1) {
        this.ranking.push({
          playerID: lastRoundResult.playerID,
          score: lastRoundResult.score,
        })
      } else {
        this.ranking[index].score += lastRoundResult.score
      }
    })

    this.ranking = _.orderBy(this.ranking, ['score'], ['desc'])
  }

  setStatus(status) {
    this.status = status
  }

  // Required method
  refreshData() {}
}

module.exports = MasterGame
