'use_strict'

const express = require('express')
const router = express.Router()

module.exports = function (app) {
  app.use('/', router)

  /**
   * The home URL
   */
  router.get('/', function (req, res, next) {
    let currentPlayer = helpers.getPlayer(req.cookies['connect.sid'])
    if (!currentPlayer) {
      res.render('index')
    } else if (
      req.query.action == 'edit-login' ||
      !currentPlayer.nickName ||
      !currentPlayer.color
    ) {
      res.render('index', {
        nickName: currentPlayer.nickName,
        playerColor: currentPlayer.color,
      })
    } else {
      res.redirect('/rooms')
    }
  })

  /**
   * Save the new nickname in session. If the session is new, also create a session ID
   */
  router.post('/', function (req, res, next) {
    if (!req.body.playerName) {
      res.render('error', { message: 'Nickame is required' })
    } else {
      let playerObj = helpers.getPlayer(req.cookies['connect.sid'])

      playerObj.resetData({
        nickName: req.body.playerName,
        color: req.body.playerColor,
      })

      res.redirect('/rooms')
    }
  })
}
