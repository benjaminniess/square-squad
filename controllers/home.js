'use_strict'

const express = require('express')
const router = express.Router()

const crypto = require('crypto')
const randomId = () => crypto.randomBytes(8).toString('hex')

module.exports = function (app, io, sessionStore) {
  app.use('/', router)

  /**
   * The home URL
   */
  router.get('/', function (req, res, next) {
    // No session ID yet or explicitely need to update login => show the nickname form
    if (!req.session.ID) {
      res.render('index')
    } else {
      let sessionData = sessionStore.findSession(req.session.ID)

      if (req.query.action == 'edit-login') {
        res.render('index', { nickName: sessionData.nickName })
      } else {
        res.render('index')
      }
    }
  })

  /**
   * Save the new nickname in session. If the session is new, also create a session ID
   */
  router.post('/', function (req, res, next) {
    if (!req.session.ID) {
      req.session.ID = randomId()
    }

    sessionStore.saveSession(req.session.ID, { nickName: req.body.playerName })
    res.redirect('/rooms')
  })
}
