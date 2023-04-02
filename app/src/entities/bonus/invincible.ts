export {}
const Bonus = require('../bonus')

class Invincible extends Bonus {
  constructor(params: any) {
    super(params)
    this.imgX = 200
    this.imgY = 100
  }

  onTrigger() {
    return new Promise((resolve, reject) => {
      let game = this.getGame()
      let playerID = this.getPlayerID()
      let playersManager = game.getPlayersManager()
      let prevCollisionFilter = playersManager.getDefaultPlayerCollisionFilter()
      playersManager.setPlayerBodyData(playerID, {
        collisionFilter: {
          category: 0x1000,
          mask: 0x1010
        }
      })

      setTimeout(function () {
        playersManager.updatePlayerSingleData(playerID, 'bonusBlinking', false)
        playersManager.setPlayerBodyData(playerID, {
          collisionFilter: prevCollisionFilter
        })

        resolve(true)
      }, this.getDuration())
    })
  }
}

module.exports = Invincible
