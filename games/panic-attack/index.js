'use strict'

const MasterGame = require(__base + '/games/master-game')
const helpers = require(__base + '/lib/helpers')

class Panick_Attack extends MasterGame {
  constructor() {
    super()
    this.speed = 4
    this.slug = 'panic-attack'
    this.obstacles = []
  }

  getObstacles() {
    return this.obstacles
  }

  setObstacles(obstacles) {
    this.obstacles = obstacles
  }

  initObstacle() {
    let direction = helpers.getRandomInt(1, 5)
    let holeSize = helpers.getRandomInt(squareSize * 2, squareSize * 8)
    let obstacleWidth = helpers.getRandomInt(squareSize, squareSize * 4)
    let obstacleSpeed = helpers.getRandomInt(1, 3)
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
          x: 0,
          y: 0,
          width: obstacleWidth,
          height: obstacleSpot,
          direction: 'right',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)

        obstacle = {
          x: 0,
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
          y: 0,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'bottom',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)

        obstacle = {
          x: obstacleSpot + holeSize,
          y: 0,
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
          y: canvasWidth,
          width: obstacleSpot,
          height: obstacleWidth,
          direction: 'top',
          speed: obstacleSpeed,
        }

        this.obstacles.push(obstacle)

        obstacle = {
          x: obstacleSpot + holeSize,
          y: canvasWidth,
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
    if (this.getStatus() === 'playing') {
      if (obstacles.length === 0) {
        this.initObstacle()
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
              if (obstacle.y > 0) {
                updatedObstacles.push(obstacle)
              }
              break
          }

          this.setObstacles(updatedObstacles)
        })
      }
    }

    for (const [playerID, moves] of Object.entries(this.playersMoves)) {
      let playerPosition = this.playersData[playerID]

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

      updatedObstacles.map((obstacle) => {
        if (
          playerPosition.x < obstacle.x + obstacle.width &&
          playerPosition.x + squareSize > obstacle.x &&
          playerPosition.y < obstacle.y + obstacle.height &&
          squareSize + playerPosition.y > obstacle.y
        ) {
          console.log('Collision')
        }
      })
    }

    return { players: this.playersData, obstacles: updatedObstacles }
  }
}

module.exports = Panick_Attack
