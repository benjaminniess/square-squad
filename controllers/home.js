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
    res.sendFile(__base + '/vueapp/dist/index.html')
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
        color: validator.blacklist(req.body.playerColor, "<>\\/'")
      })

      res.redirect('/rooms')
    }
  })

  /**
   * The about page
   */
  router.get('/about-us', function (req, res, next) {
    res.render('about', {})
  })
}
