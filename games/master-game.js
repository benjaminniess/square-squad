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

  initGame() {
    this.engine = Engine.create()
    this.runner = Runner.create()
    Runner.run(this.runner, this.engine)
    this.obstaclesManager = new ObstaclesManager(Composite.create('obstacles'))
    this.playersManager = new PlayersManager(Composite.create('players'))
    this.bonusManager = new BonusManager(this)
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

  renewPlayers() {
    _.forEach(this.playersData, (moves, playerID) => {
      this.playersData[playerID].alive = true
      this.resetTouches(playerID)
    })
  }

  getPlayersData() {
    return this.playersData
  }

  getObstaclesManager() {
    return this.obstaclesManager
  }

  getBonusManager() {
    return this.bonusManager
  }

  killPlayer(playerID) {
    this.playersData[playerID].alive = false
    this.playersData[playerID].score = this.getScore() - 1
    this.addRoundScore({
      playerID: playerID,
      score: this.playersData[playerID].score,
      nickname: this.playersData[playerID].nickname,
    })
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

  increaseScore() {
    this.score++
  }

  initPlayer(playerSession) {
    this.playersData[playerSession.id] = {
      x: -100,
      y: canvasWidth / 2,
      nickname: playerSession.nickname,
      alive: true,
      speedMultiplicator: 1,
      score: 0,
      color: playerSession.color,
    }

    this.resetPlayersPositions()
    this.resetTouches(playerSession.id)
  }

  resetPlayersPositions() {
    let existingPlayers = _.size(this.playersData)
    let i = 0
    let playerRequiredWidth = squareSize * 1.3
    _.forEach(this.playersData, (playerData, playerID) => {
      this.playersData[playerID].x =
        canvasWidth / 2 +
        i * playerRequiredWidth -
        (playerRequiredWidth * existingPlayers) / 2
      i++
    })
  }

  resetTouches(playerID) {
    this.playersMoves[playerID] = {
      up: false,
      down: false,
      left: false,
      right: false,
    }
  }

  removePlayer(playerID) {
    delete this.playersData[playerID]
    delete this.playersMoves[playerID]
  }

  updatePlayerButtonState(playerID, button, state) {
    if (this.playersMoves[playerID]) {
      this.playersMoves[playerID][button] = state
    }
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

  countPlayers() {
    return _.size(this.playersData)
  }

  countAlivePlayers() {
    return new Promise((resolve, reject) => {
      let alive = 0
      let countRows = 0
      _.forEach(this.playersData, (playerData, playerID) => {
        countRows++
        if (playerData.alive) {
          alive++
        }

        if (countRows >= _.size(this.playersData)) {
          resolve(alive)
        }
      })
    })
  }

  getPlayerData(playerID) {
    return this.getPlayersData()[playerID]
  }

  setPlayerData(playerID, playerData) {
    this.playersData[playerID] = playerData
  }

  getPlayersData() {
    return this.playersData
  }

  setStatus(status) {
    this.status = status
  }

  // Required method
  refreshData() {}
}

module.exports = MasterGame
