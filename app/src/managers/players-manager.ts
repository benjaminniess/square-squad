export {}
const Matter = require('matter-js')
const Config = require('../config/main')
const _ = require('lodash')

class PlayersManager {
  private compositeObj: any
  private playersData: any
  private playersMoves: any
  private game: any
  private speed: number

  constructor(game: any) {
    this.compositeObj = Matter.Composite.create({ label: 'players' })
    this.playersData = {}
    this.playersMoves = {}
    this.game = game
    this.speed = game.getSpeed()
  }

  getGame() {
    return this.game
  }

  getComposite() {
    return this.compositeObj
  }

  getPlayersData() {
    return this.playersData
  }

  getPlayersPhysicalData() {
    return Matter.Composite.allBodies(this.compositeObj)
  }

  getPlayersMoves() {
    return this.playersMoves
  }

  getPlayersMoveRequests() {
    let playersMovesRequests: any = {}
    let playersData = this.getPlayersData()

    _.forEach(this.getPlayersMoves(), (moves: any, playerID: string) => {
      let playerData = playersData[playerID]
      if (playerData.alive) {
        let playerMoveVector = { x: 0, y: 0 }
        if (moves.top) {
          playerMoveVector.y = 1
        }

        if (moves.right) {
          playerMoveVector.x = 1
        }
        if (moves.down) {
          playerMoveVector.y = -1
        }
        if (moves.left) {
          playerMoveVector.x = -1
        }

        if (playerMoveVector.x !== 0 && playerMoveVector.y !== 0) {
          playerMoveVector.x = playerMoveVector.x * 0.7
          playerMoveVector.y = playerMoveVector.y * 0.7
        }

        playersMovesRequests[playerID] = playerMoveVector
      }
    })

    return playersMovesRequests
  }

  getDefaultPlayerCollisionFilter() {
    return {
      category: 0x1000,
      mask: 0x1111
    }
  }

  processPlayersRequests() {
    let playersMoves: any = this.getPlayersMoveRequests()
    _.forEach(this.getPlayersPhysicalData(), (compositePlayer: any) => {
      if (playersMoves[compositePlayer.gamePlayerID]) {
        Matter.Body.applyForce(compositePlayer, compositePlayer.position, {
          x:
            ((playersMoves[compositePlayer.gamePlayerID].x * this.speed) /
              1700) *
            this.playersData[compositePlayer.gamePlayerID].speedMultiplicator,
          y:
            ((playersMoves[compositePlayer.gamePlayerID].y * this.speed) /
              1700) *
            this.playersData[compositePlayer.gamePlayerID].speedMultiplicator
        })

        this.playersData[compositePlayer.gamePlayerID].x =
          compositePlayer.position.x
        this.playersData[compositePlayer.gamePlayerID].y =
          compositePlayer.position.y
      }
    })
  }

  initPlayer(playerSession: any) {
    this.playersData[playerSession.id] = {
      x: -100,
      y: Config.canvasWidth / 2,
      nickname: playerSession.nickname,
      alive: true,
      speedMultiplicator: 1,
      score: 0,
      color: playerSession.color,
      bonus: null,
      bonusBlinking: false,
      catchable: true
    }

    this.resetPlayersPositions()
    this.resetTouches(playerSession.id)
  }

  killPlayer(playerID: string) {
    if (!this.playersData[playerID]) {
      return
    }

    this.playersData[playerID].alive = false
  }

  addPoints(playerID: string, countPoints: number) {
    this.playersData[playerID].score += countPoints
    if (this.playersData[playerID].score < 0) {
      this.playersData[playerID].score = 0
    }
  }

  addPlayersPoints(countPoints = 1, aliveOnly = true) {
    _.forEach(this.playersData, (playerData: any, playerID: string) => {
      if (aliveOnly) {
        if (playerData.alive) {
          this.addPoints(playerID, countPoints)
        }
      } else {
        this.addPoints(playerID, countPoints)
      }
    })
  }

  renewPlayers() {
    _.forEach(this.playersData, (moves: any, playerID: string) => {
      this.playersData[playerID].alive = true
      this.resetTouches(playerID)
    })
  }

  resetPlayersPositions() {
    Matter.Composite.clear(this.compositeObj)
    let existingPlayers = _.size(this.playersData)
    let i = 0
    let playerRequiredWidth = Config.squareSize * 1.3
    _.forEach(_.shuffle(_.keys(this.playersData)), (playerID: string) => {
      let playerData = this.playersData[playerID]
      this.playersData[playerID].x =
        Config.canvasWidth / 2 +
        i * playerRequiredWidth -
        (playerRequiredWidth * existingPlayers) / 2

      let body = Matter.Bodies.rectangle(
        playerData.x,
        playerData.y,
        Config.squareSize,
        Config.squareSize,
        {
          inertia: Infinity,
          restitution: 2,
          frictionAir: 0.25,
          collisionFilter: this.getDefaultPlayerCollisionFilter()
        }
      )
      Matter.Body.set(body, { gamePlayerID: playerID, customType: 'player' })

      Matter.Composite.add(this.compositeObj, body)
      i++
    })
  }

  resetTouches(playerID: string) {
    this.playersMoves[playerID] = {
      up: false,
      down: false,
      left: false,
      right: false
    }
  }

  removePlayer(playerID: string) {
    delete this.playersData[playerID]
    delete this.playersMoves[playerID]
  }

  updatePlayerButtonState(playerID: string, button: any, state: string) {
    if (this.playersMoves[playerID]) {
      this.playersMoves[playerID][button] = state
    }
  }

  getPlayerData(playerID: string) {
    return this.getPlayersData()[playerID]
  }

  getPlayerBody(playerID: string) {
    let body
    _.forEach(this.getPlayersPhysicalData(), (playerBody: any) => {
      if (playerBody.gamePlayerID === playerID) {
        body = playerBody
      }
    })

    return body
  }

  setPlayerData(playerID: string, playerData: any) {
    this.playersData[playerID] = playerData
  }

  uptadePlayerSingleData(playerID: string, property: string, value: any) {
    this.playersData[playerID][property] = value
  }

  setPlayerBodyData(playerID: string, playerData: any) {
    let body = this.getPlayerBody(playerID)
    if (!body) {
      return
    }

    Matter.Body.set(body, playerData)
  }

  countPlayers() {
    return _.size(this.playersData)
  }

  countAlivePlayers() {
    let alive = 0
    _.forEach(this.playersData, (playerData: any, playerID: string) => {
      if (playerData.alive) {
        alive++
      }
    })

    return alive
  }
}

module.exports = PlayersManager
