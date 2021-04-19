'use strict'

const MasterGame = require(__base + '/games/master-game')

class Panick_Attack extends MasterGame {
  constructor(room) {
    super(room)
    this.speed = 4
    this.slug = 'panic-attack'
    this.obstacles = []
    this.score = null
    this.type = 'battle-royale'
    this.totalRounds = 3
  }

  initGame() {
    this.roundNumber = 0
    this.initRound()
    this.resetRanking()
    this.setStatus('starting')
  }

  initRound() {
    this.roundNumber++
    this.setObstacles([])
    this.score = 0
    this.lastRoundRanking = []
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

  getObstacles() {
    return this.obstacles
  }

  setObstacles(obstacles) {
    this.obstacles = obstacles
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

  initObstacle() {
    let direction = helpers.getRandomInt(1, 5)
    let holeSize = helpers.getRandomInt(squareSize * 2, squareSize * 8)
    let obstacleWidth = helpers.getRandomInt(squareSize, squareSize * 4)
    let obstacleSpeed = this.getScore() / 5 + 2
    let obstacleSpot = helpers.getRandomInt(
      squareSize,
      canvasWidth - squareSize,
    )
    let obstacle = {}

    switch (direction) {
      case 1:
        obstacle = {
          x: canvasWidth,
          y: 0,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'left',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)

        obstacle = {
          x: canvasWidth,
          y: obstacleSpot + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'left',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)
        break
      case 2:
        obstacle = {
          x: -obstacleWidth,
          y: 0,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'right',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)

        obstacle = {
          x: -obstacleWidth,
          y: obstacleSpot + holeSize,
          width: obstacleWidth,
          height: canvasWidth,
          direction: 'right',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)

        break
      case 3:
        obstacle = {
          x: 0,
          y: -obstacleWidth,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'bottom',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)

        obstacle = {
          x: obstacleSpot + holeSize,
          y: -obstacleWidth,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'bottom',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)
        break
      case 4:
        obstacle = {
          x: 0,
          y: canvasWidth + obstacleWidth,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'top',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)

        obstacle = {
          x: obstacleSpot + holeSize,
          y: canvasWidth + obstacleWidth,
          width: canvasWidth,
          height: obstacleWidth,
          direction: 'top',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)
        break
    }
  }

  refreshData() {
    let obstacles = this.getObstacles()
    let updatedObstacles = []
    let increasePoints = false

    if (this.getStatus() === 'playing') {
      if (obstacles.length === 0) {
        this.initObstacle()
        this.increaseScore()
        this.getRoom().refreshPlayers()
        increasePoints = this.getScore()
      } else {
        obstacles.map((obstacle) => {
          switch (obstacle.direction) {
            case 'left':
              obstacle.x -= obstacle.speed
              if (obstacle.x > -obstacle.width) {
                updatedObstacles.push(obstacle)
              }
              break
            case 'right':
              obstacle.x += obstacle.speed
              if (obstacle.x < canvasWidth) {
                updatedObstacles.push(obstacle)
              }
              break
            case 'bottom':
              obstacle.y += obstacle.speed
              if (obstacle.y < canvasWidth) {
                updatedObstacles.push(obstacle)
              }
              break
            case 'top':
              obstacle.y -= obstacle.speed
              if (obstacle.y > -obstacle.height) {
                updatedObstacles.push(obstacle)
              }
              break
          }

          this.setObstacles(updatedObstacles)
        })
      }
    }

    _.forEach(this.playersMoves, (moves, playerID) => {
      let playerData = this.playersData[playerID]
      if (playerData.alive) {
        if (moves.top) {
          this.playersData[playerID].y += this.speed
          if (this.playersData[playerID].y > canvasWidth - squareSize) {
            this.playersData[playerID].y = canvasWidth - squareSize
          }
        }
        if (moves.right) {
          this.playersData[playerID].x += this.speed
          if (this.playersData[playerID].x > canvasWidth - squareSize) {
            this.playersData[playerID].x = canvasWidth - squareSize
          }
        }
        if (moves.down) {
          this.playersData[playerID].y -= this.speed
          if (this.playersData[playerID].y < 0) {
            this.playersData[playerID].y = 0
          }
        }
        if (moves.left) {
          this.playersData[playerID].x -= this.speed
          if (this.playersData[playerID].x < 0) {
            this.playersData[playerID].x = 0
          }
        }

        _.forEach(this.playersMoves, (movesB, playerBID) => {
          let playerBdata = this.playersData[playerBID]
          if (
            playerID !== playerBID &&
            playerData.x < playerBdata.x + squareSize &&
            playerData.x + squareSize > playerBdata.x &&
            playerData.y < playerBdata.y + squareSize &&
            squareSize + playerData.y > playerBdata.y
          ) {
            if (moves.down && playerData.y < playerBdata.y + squareSize) {
              this.playersData[playerBID].y -= this.speed
              if (this.playersData[playerBID].y < 0) {
                this.playersData[playerBID].y = 0
                this.playersData[playerID].y = squareSize
              }
            } else if (moves.top && playerData.y > playerBdata.y - squareSize) {
              this.playersData[playerBID].y += this.speed
              if (this.playersData[playerBID].y > canvasWidth - squareSize) {
                this.playersData[playerBID].y = canvasWidth - squareSize
                this.playersData[playerID].y =
                  canvasWidth - squareSize - squareSize
              }
            }
            if (moves.left && playerData.x < playerBdata.x + squareSize) {
              this.playersData[playerBID].x -= this.speed
              if (this.playersData[playerBID].x < 0) {
                this.playersData[playerBID].x = 0
                this.playersData[playerID].x = squareSize
              }
            } else if (
              moves.right &&
              playerData.x > playerBdata.x - squareSize
            ) {
              this.playersData[playerBID].x += this.speed
              if (this.playersData[playerBID].x > canvasWidth - squareSize) {
                this.playersData[playerBID].x = canvasWidth - squareSize
                this.playersData[playerID].x =
                  canvasWidth - squareSize - squareSize
              }
            }
          }
        })

        updatedObstacles.map((obstacle) => {
          if (
            playerData.x < obstacle.x + obstacle.width &&
            playerData.x + squareSize > obstacle.x &&
            playerData.y < obstacle.y + obstacle.height &&
            squareSize + playerData.y > obstacle.y
          ) {
            this.killPlayer(playerID)
            this.getRoom().refreshPlayers()
          }
        })
      }
    })

    return {
      players: this.playersData,
      obstacles: updatedObstacles,
      score: increasePoints > 0 ? increasePoints - 1 : null,
    }
  }
}

module.exports = Panick_Attack
