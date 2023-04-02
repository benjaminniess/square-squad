export {}
const Bonus = require('../bonus')

class Speed extends Bonus {
  constructor(params: any) {
    super(params)
    this.imgX = 0
    this.imgY = 0
  }

  onTrigger() {
    return new Promise((resolve, reject) => {
      let game = this.getGame()
      let playerID = this.getPlayerID()
      let playerData = game.getPlayersManager().getPlayerData(playerID)
      playerData.speedMultiplicator *= 1.5
      game.getPlayersManager().setPlayerData(playerData)
      setTimeout(function () {
        playerData.speedMultiplicator = 1
        game.getPlayersManager().setPlayerData(playerData)

        resolve(true)
      }, this.getDuration())
    })
  }
}

module.exports = Speed
