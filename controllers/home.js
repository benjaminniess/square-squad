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
      console.log('ok', sessionStore.findAllSessions())
      socket.emit('nicknameSet', { sessionID: sessionID })
    })
  })
}

router.get('/', function (req, res, next) {
  if (!req.session.nickname || req.query.action == 'edit-login') {
    res.render('index', { nickName: req.session.nickname })
  } else {
    res.redirect('/rooms')
  }
})

router.post('/', function (req, res, next) {
  req.session.nickname = req.body.playerName
  res.redirect('/rooms')
})
