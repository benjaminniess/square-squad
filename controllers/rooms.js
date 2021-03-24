'use_strict'

const express = require('express')
const router = express.Router()
const cookie = require('cookie')
const Room = require('../lib/room')
const helpers = require('../lib/helpers')

let rooms = {}

const speed = 6
const ballRadius = 10
const canvasWidth = 700

let players = {}
let playersMoves = {}

module.exports = function (app, io, sessionStore) {
  app.use('/rooms', router)

  /**
   * Global check. Nobody is allowed here if no session ID or no nickname
   */
  router.get('*', function (req, res, next) {
    if (!req.session.ID) {
      res.redirect('/')
    } else {
      let sessionData = sessionStore.findSession(req.session.ID)
      if (!sessionData.nickName) {
        res.render('index')
      }
      next()
    }
  })

  /**
   * The rooms list view
   */
  router.get('/', function (req, res, next) {
    let sessionData = sessionStore.findSession(req.session.ID)
    res.render('rooms', {
      rooms: Object.keys(rooms).length ? rooms : null,
      playerName: sessionData.nickName,
    })
  })

  /**
   * A single room view
   */
  router.get('/:roomSlug', function (req, res, next) {
    let sessionData = sessionStore.findSession(req.session.ID)
    if (typeof rooms[req.params.roomSlug] === 'undefined') {
      next()
      return
    }
    res.render('room', {
      roomName: rooms[req.params.roomSlug].getName(),
      roomSlug: req.params.roomSlug,
      playerName: sessionData.nickName,
    })
  })

  /**
   * A room's game view
   */
  router.get('/:roomSlug/play', function (req, res, next) {
    if (typeof rooms[req.params.roomSlug] === 'undefined') {
      next()
      return
    }

    res.render('play', {
      roomName: rooms[req.params.roomSlug].getName(),
      roomSlug: req.params.roomSlug,
    })
  })

  /**
   * The room's add form handling
   */
  router.post('/', function (req, res, next) {
    let roomName = req.body['new-room']
    let roomSlug = helpers.stringToSlug(roomName)
    if (typeof rooms[roomSlug] !== 'undefined') {
      res.redirect('/')
    } else {
      rooms[roomSlug] = new Room(roomName)
      res.redirect('/rooms/' + roomSlug)
    }
  })

  io.on('connection', (socket) => {
    players[String(socket.id)] = {
      x: 100,
      y: 200,
      isWolf: Object.keys(players).length === 1 ? true : false,
      name: socket.username,
    }

    io.emit('refreshPlayers', sessionStore.findAllSessions())

    playersMoves[String(socket.id)] = {
      up: false,
      down: false,
      left: false,
      right: false,
    }

    socket.on('disconnect', function () {
      console.log('Player logout: ' + socket.id)
      delete players[String(socket.id)]
      delete playersMoves[String(socket.id)]

      io.emit('refreshPlayers', sessionStore.findAllSessions())
    })

    socket.on('keyPressed', function (socket) {
      if (socket.key == 39) {
        playersMoves[socket.id].right = true
      } else if (socket.key == 37) {
        playersMoves[socket.id].left = true
      }

      if (socket.key == 40) {
        playersMoves[socket.id].top = true
      } else if (socket.key == 38) {
        playersMoves[socket.id].down = true
      }
    })

    socket.on('keyUp', function (socket) {
      if (socket.key == 39) {
        playersMoves[socket.id].right = false
      } else if (socket.key == 37) {
        playersMoves[socket.id].left = false
      }

      if (socket.key == 40) {
        playersMoves[socket.id].top = false
      } else if (socket.key == 38) {
        playersMoves[socket.id].down = false
      }
    })
  })

  setInterval(refreshData, 10)

  function refreshData() {
    for (const [socketID, moves] of Object.entries(playersMoves)) {
      if (moves.top) {
        players[socketID].y += speed
        if (players[socketID].y > canvasWidth - ballRadius) {
          players[socketID].y = canvasWidth - ballRadius
        }
      }
      if (moves.right) {
        players[socketID].x += speed
        if (players[socketID].x > canvasWidth - ballRadius) {
          players[socketID].x = canvasWidth - ballRadius
        }
      }
      if (moves.down) {
        players[socketID].y -= speed
        if (players[socketID].y < ballRadius) {
          players[socketID].y = ballRadius
        }
      }
      if (moves.left) {
        players[socketID].x -= speed
        if (players[socketID].x < ballRadius) {
          players[socketID].x = ballRadius
        }
      }
    }

    io.emit('refreshCanvas', {
      players: players,
    })
  }
}
