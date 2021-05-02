'use_strict'

const express = require('express')
const router = express.Router()
const validator = require('validator')

module.exports = function (app) {
  app.use('/', router)

  /**
   * The home URL
   */
  router.get('/', function (req, res, next) {
    // On dev mode, auto create a user and a room
    if (
      process.env.AUTO_CREATE_PLAYER &&
      process.env.AUTO_CREATE_PLAYER === 'true'
    ) {
      if (!req.cookies['connect.sid']) {
        res.redirect('/')
        return
      }
      let playerObj = helpers.getPlayer(req.cookies['connect.sid'])
      playerObj.resetData({
        nickName: 'Tester',
        color: '#222288',
      })

      res.redirect('/rooms')
      return
    }

    let currentPlayer = helpers.getPlayer(req.cookies['connect.sid'])
    if (!currentPlayer) {
      res.render('index', {
        playerColor:
          '#' +
          (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
      })
    } else if (
      req.query.action == 'edit-login' ||
      !currentPlayer.nickName ||
      !currentPlayer.color
    ) {
      res.render('index', {
        nickName: currentPlayer.nickName,
        playerColor: currentPlayer.color
          ? currentPlayer.color
          : '#' +
            (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
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
        nickName: validator.blacklist(req.body.playerName, "<>\\/'"),
        color: validator.blacklist(req.body.playerColor, "<>\\/'"),
      })

      res.redirect('/rooms')
    }
  })
}
