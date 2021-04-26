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
    this.engine = Engine.create()
    this.runner = Runner.create()
    Runner.run(this.runner, this.engine)
    this.obstaclesManager = new ObstaclesManager(Composite.create('obstacles'))
    this.playersManager = new PlayersManager(this, Composite.create('players'))
    this.bonusManager = new BonusManager(this)
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

  getScore() {
    return this.score
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
    return JSON.parse(JSON.stringify(this.lastRoundRanking)).reverse()
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
    this.setStatus('starting')
  }

  initRound() {
    this.roundNumber++
    this.score = 0
    this.lastRoundRanking = []
    this.getObstaclesManager().resetObstacles()
    this.getBonusManager().resetBonus()
  }

  increaseScore() {
    this.score++
  }

  resetRanking() {
    this.ranking = []
    this.lastRoundRanking = []
  }

  addRoundScore(scoreData) {
    this.lastRoundRanking.push(scoreData)
    let index = _.findIndex(this.ranking, { playerID: scoreData.playerID })

    if (index === -1) {
      this.ranking.push(scoreData)
    } else {
      this.ranking[index].score += scoreData.score
    }

    this.ranking = _.orderBy(this.ranking, ['score'], ['desc'])
  }

  setStatus(status) {
    this.status = status
  }

  // Required method
  refreshData() {}
}

module.exports = MasterGame
