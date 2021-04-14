'use_strict'

const express = require('express')
const router = express.Router()

const helpers = require('../lib/helpers')

module.exports = function (app) {
  app.use('/', router)

  /**
   * The home URL
   */
  router.get('/', function (req, res, next) {
    let sessionData = helpers.getPlayerFromSessionID(req.cookies['connect.sid'])
    if (!sessionData) {
      res.render('index')
    } else if (req.query.action == 'edit-login') {
      res.render('index', {
        nickName: sessionData.nickName,
        playerColor: sessionData.playerColor,
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
