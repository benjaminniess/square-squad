'use_strict'

const express = require('express')
const router = express.Router()

module.exports = function (app) {
  app.use('/', router)

  /**
   * The dynamic public end data
   */
  router.get('/env', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        ga_id: process.env.GA_ID
      })
    )
  })

  /**
   * Redirect everything to vueapp
   */
  router.get('*', function (req, res, next) {
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
