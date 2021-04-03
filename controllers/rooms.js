'use_strict'

const express = require('express')
const router = express.Router()
const Room = require('../lib/room')
const helpers = require('../lib/helpers')
const cookie = require('cookie')

let players = helpers.getPlayers()
let rooms = helpers.getRooms()

const speed = 6
const ballRadius = 10
const canvasWidth = 700

let playersMoves = {}

module.exports = function (app, io) {
  app.use('/rooms', router)

  /**
   * Global check. Nobody is allowed here if no session ID or no nickname
   */
  router.get('*', function (req, res, next) {
    let sessionData = helpers.getPlayerFromSessionID(req.cookies['connect.sid'])
    if (!sessionData || !sessionData.nickName) {
      res.redirect('/')
    } else {
      next()
    }
  })

  /**
   * The rooms list view
   */
  router.get('/', function (req, res, next) {
    let sessionData = helpers.getPlayerFromSessionID(req.cookies['connect.sid'])
    res.render('rooms', {
      rooms: Object.keys(rooms).length ? rooms : null,
      playerName: sessionData.nickName,
    })
  })

  /**
   * A single room view
   */
  router.get('/:roomSlug', function (req, res, next) {
    let sessionData = helpers.getPlayerFromSessionID(req.cookies['connect.sid'])
    if (typeof rooms[req.params.roomSlug] !== 'undefined') {
      res.render('room', {
        roomName: rooms[req.params.roomSlug].getName(),
        roomSlug: req.params.roomSlug,
        playerName: sessionData.nickName,
      })
    }
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
    if (typeof rooms[roomSlug] !== 'undefined' || roomName === '') {
      res.redirect('/')
    } else {
      rooms[roomSlug] = new Room(roomName)
      res.redirect('/rooms/' + roomSlug)
    }
  })

  io.on('connection', (socket) => {
    let cookies = cookie.parse(socket.handshake.headers.cookie)
    let sessionData = helpers.getPlayerFromSessionID(cookies['connect.sid'])

    if (sessionData) {
      sessionData.socketID = socket.id
      helpers.updatePlayer(cookies['connect.sid'], sessionData)
      io.to(socket.id).emit('player-connected', {
        nickName: sessionData.nickName,
        playerID: sessionData.playerID,
        sessionID: cookies['connect.sid'],
      })
    }

    // When player ask for joining a room
    socket.on('room-join', (data) => {
      if (typeof rooms[data.roomSlug] === 'undefined') {
        return
      } else {
        socket.join(data.roomSlug)
        refreshPlayersInRoom(data.roomSlug)

        if (!players[data.roomSlug]) {
          players[data.roomSlug] = {}
          playersMoves[data.roomSlug] = {}
        }
        players[data.roomSlug][String(socket.id)] = {
          x: 100,
          y: 200,
          isWolf: Object.keys(players).length === 1 ? true : false,
          name: socket.username,
        }

        playersMoves[data.roomSlug][String(socket.id)] = {
          up: false,
          down: false,
          left: false,
          right: false,
        }
      }
    })

    // When a change occurs, refresh the room's players list
    function refreshPlayersInRoom(roomSlug, disconnectedPlayerSocketID = null) {
      socketClients = Array.from(io.sockets.adapter.rooms.get(roomSlug))
      let sessionsInRoom = []
      let countPlayers = socketClients.length
      socketClients.map((socketID, i) => {
        helpers.getPlayerFromSocketID(socketID).then((sessionInRoom) => {
          // If a player is about to disconnect, don't show it in the room
          if (disconnectedPlayerSocketID !== socketID) {
            sessionsInRoom.push(sessionInRoom)
          }

          if (countPlayers === i + 1) {
            io.in(roomSlug).emit('refreshPlayers', sessionsInRoom)
          }
        })
      })
    }

    socket.on('disconnecting', () => {
      socket.rooms.forEach((roomSlug) => {
        refreshPlayersInRoom(roomSlug, socket.id)
        if (players[roomSlug] && players[roomSlug][String(socket.id)]) {
          delete players[roomSlug][String(socket.id)]
          delete playersMoves[roomSlug][String(socket.id)]
        }
      })
    })

    socket.on('disconnect', function () {})

    socket.on('keyPressed', function (socketData) {
      socket.rooms.forEach((roomSlug) => {
        if (roomSlug != socket.id) {
          if (socketData.key == 39) {
            playersMoves[roomSlug][socket.id].right = true
          } else if (socketData.key == 37) {
            playersMoves[roomSlug][socket.id].left = true
          }

          if (socketData.key == 40) {
            playersMoves[roomSlug][socket.id].top = true
          } else if (socketData.key == 38) {
            playersMoves[roomSlug][socket.id].down = true
          }
        }
      })
    })

    socket.on('keyUp', function (socketData) {
      socket.rooms.forEach((roomSlug) => {
        if (roomSlug != socket.id) {
          if (socketData.key == 39) {
            playersMoves[roomSlug][socket.id].right = false
          } else if (socketData.key == 37) {
            playersMoves[roomSlug][socket.id].left = false
          }

          if (socketData.key == 40) {
            playersMoves[roomSlug][socket.id].top = false
          } else if (socketData.key == 38) {
            playersMoves[roomSlug][socket.id].down = false
          }
        }
      })
    })
  })

  setInterval(refreshData, 10)

  function refreshData() {
    for (const [roomSlug, room] of Object.entries(rooms)) {
    }
    for (const [roomSlug, roomPlayers] of Object.entries(playersMoves)) {
      for (const [socketID, moves] of Object.entries(roomPlayers)) {
        if (moves.top) {
          players[roomSlug][socketID].y += speed
          if (players[roomSlug][socketID].y > canvasWidth - ballRadius) {
            players[roomSlug][socketID].y = canvasWidth - ballRadius
          }
        }
        if (moves.right) {
          players[roomSlug][socketID].x += speed
          if (players[roomSlug][socketID].x > canvasWidth - ballRadius) {
            players[roomSlug][socketID].x = canvasWidth - ballRadius
          }
        }
        if (moves.down) {
          players[roomSlug][socketID].y -= speed
          if (players[roomSlug][socketID].y < ballRadius) {
            players[roomSlug][socketID].y = ballRadius
          }
        }
        if (moves.left) {
          players[roomSlug][socketID].x -= speed
          if (players[roomSlug][socketID].x < ballRadius) {
            players[roomSlug][socketID].x = ballRadius
          }
        }
      }

      io.to(roomSlug).emit('refreshCanvas', {
        players: players[roomSlug],
      })
    }
  }
}
