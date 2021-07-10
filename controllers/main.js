'use_strict'

const express = require('express')
const router = express.Router()

module.exports = function (app) {
  app.use('/', router)

  /**
   * The home URL
   */
  router.get('/', function (req, res, next) {
    res.sendFile(__base + '/vueapp/dist/index.html')
  })

  setInterval(refreshData, 10)

  let lockedRefresh = false
  function refreshData() {
    if (lockedRefresh) {
      return
    }

    lockedRefresh = true
    _.forEach(helpers.getRooms(), (room) => {
      let roomGame = room.getGame()
      let status = room.getGame().getStatus()

      if (roomGame && (status === 'playing' || status === 'starting')) {
        io.to(room.getSlug()).emit('refresh-canvas', roomGame.refreshData())
      }
    })

    lockedRefresh = false
  }
}
