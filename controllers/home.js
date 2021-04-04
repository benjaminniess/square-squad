'use_strict'

const express = require('express')
const router = express.Router()

const helpers = require('../lib/helpers')

const crypto = require('crypto')
const randomId = () => crypto.randomBytes(8).toString('hex')

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
      res.render('index', { nickName: sessionData.nickName })
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
      helpers.updatePlayer(req.cookies['connect.sid'], {
        nickName: req.body.playerName,
        playerID: randomId(),
      })

      res.redirect('/rooms')
    }
  })
}
