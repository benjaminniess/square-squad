'use_strict'

const express = require('express')
const router = express.Router()

const crypto = require('crypto')
const randomId = () => crypto.randomBytes(8).toString('hex')

let players = {}
let playersMoves = {}

module.exports = function (app, io, sessionStore) {
  app.use('/', router)

  io.on('connection', (socket) => {
    socket.on('nicknameSubmitted', function (data) {
      let sessionID = randomId()
      sessionStore.saveSession(sessionID, { nickName: data.nickName })
      socket.emit('nicknameSet', { sessionID: sessionID })
    })
  })

  router.get('/', function (req, res, next) {
    if (!req.session.ID || req.query.action == 'edit-login') {
      res.render('index', { nickName: req.session.nickname })
    } else {
      let sessionData = sessionStore.findSession(req.session.ID)
      if (!sessionData.nickName) {
        res.render('index')
      } else {
        res.redirect('/rooms')
      }
    }
  })

  router.post('/', function (req, res, next) {
    if (!req.session.ID) {
      req.session.ID = randomId()
    }

    sessionStore.saveSession(req.session.ID, { nickName: req.body.playerName })
    res.redirect('/rooms')
  })
}
