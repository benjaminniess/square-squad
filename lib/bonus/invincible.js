'use strict'

const Bonus = require(__base + '/lib/bonus')

class Invincible extends Bonus {
  constructor(params) {
    super(params)
    this.imgX = 200
    this.imgY = 100
  }

  onTrigger() {
    return new Promise((resolve, reject) => {
      let game = this.getGame()
      let playerID = this.getPlayerID()
      let playerBody = game.getPlayersManager().getPlayerBody(playerID)
      let prevCollisionFilter = playerBody.collisionFilter
      game.getPlayersManager().setPlayerBodyData(playerID, {
        collisionFilter: {
          category: 0x1000,
          mask: 0x1010,
        },
      })
      let bonusTimer = setInterval(function () {
        clearInterval(bonusTimer)

        game
          .getPlayersManager()
          .setPlayerBodyData(playerID, { collisionFilter: prevCollisionFilter })

        resolve()
      }, this.getDuration())
    })
  }
}

module.exports = Invincible
