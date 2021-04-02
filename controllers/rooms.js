'use_strict'

const express = require('express')
const router = express.Router()
const Room = require('../lib/room')
const helpers = require('../lib/helpers')
const cookie = require('cookie')

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
      let sessionData = sessionStore.findSession(req.cookies['connect.sid'])
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
    let sessionData = sessionStore.findSession(req.cookies['connect.sid'])
    res.render('rooms', {
      rooms: Object.keys(rooms).length ? rooms : null,
      playerName: sessionData.nickName,
    })
  })

  /**
   * A single room view
   */
  router.get('/:roomSlug', function (req, res, next) {
    let sessionData = sessionStore.findSession(req.cookies['connect.sid'])
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
    let sessionData = sessionStore.findSession(cookies['connect.sid'])
    
    
    if (sessionData){
      sessionData.socketID = socket.id
      sessionStore.saveSession(cookies['connect.sid'], sessionData)
      io.to(socket.id).emit('player-connected', { "nickName" : sessionData.nickName, "playerID": sessionData.playerID, "sessionID" : cookies['connect.sid'] })
    }

    players[String(socket.id)] = {
      x: 100,
      y: 200,
      isWolf: Object.keys(players).length === 1 ? true : false,
      name: socket.username,
    }

    playersMoves[String(socket.id)] = {
      up: false,
      down: false,
      left: false,
      right: false,
    }

    // When player ask for joining a room
    socket.on("room-join", (data) => {
      if ( typeof rooms[data.roomSlug] === 'undefined') {
        return
      } else {
        socket.join(data.roomSlug)
        refreshPlayersInRoom(data.roomSlug)
      }
    })

    // When a change occurs, refresh the room's players list
    function refreshPlayersInRoom(roomSlug, disconnectedPlayerSocketID = null) {
      socketClients = Array.from(io.sockets.adapter.rooms.get(roomSlug))
      let sessionsInRoom = []
      let countPlayers = socketClients.length
      socketClients.map((socketID, i) => {
        sessionStore.findSessionFromSocketID(socketID).then(sessionInRoom => {
          // If a player is about to disconnect, don't show it in the room
          if ( disconnectedPlayerSocketID !== socketID ) {
            sessionsInRoom.push(sessionInRoom)
          }
          

          if (countPlayers === i + 1) {
            io.in(roomSlug).emit('refreshPlayers', sessionsInRoom)
          }
        })
      })
    }

    socket.on('disconnecting', () => {
      socket.rooms.forEach(roomSlug => {
        refreshPlayersInRoom(roomSlug, socket.id)
      })
    });

    socket.on('disconnect', function () {
      delete players[String(socket.id)]
      delete playersMoves[String(socket.id)]
    })

    socket.on('keyPressed', function (socketData) {
      if (socketData.key == 39) {
        playersMoves[socket.id].right = true
      } else if (socketData.key == 37) {
        playersMoves[socket.id].left = true
      }

      if (socketData.key == 40) {
        playersMoves[socket.id].top = true
      } else if (socketData.key == 38) {
        playersMoves[socket.id].down = true
      }
    })

    socket.on('keyUp', function (socketData) {
      if (socketData.key == 39) {
        playersMoves[socket.id].right = false
      } else if (socketData.key == 37) {
        playersMoves[socket.id].left = false
      }

      if (socketData.key == 40) {
        playersMoves[socket.id].top = false
      } else if (socketData.key == 38) {
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
