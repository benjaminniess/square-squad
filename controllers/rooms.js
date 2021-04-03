'use_strict'

const express = require('express')
const router = express.Router()
const helpers = require('../lib/helpers')
const cookie = require('cookie')

let players = helpers.getPlayers()

const speed = 6
const ballRadius = 10
const canvasWidth = 700

let playersMoves = {}

module.exports = function (app) {
  app.use('/rooms', router)
}

/**
 * Global check. Nobody is allowed here if no session ID or no nickname
 */
router.get('*', function (req, res, next) {
  let currentPlayer = helpers.getPlayerFromSessionID(req.cookies['connect.sid'])
  if (!currentPlayer || !currentPlayer.nickName) {
    res.redirect('/')
  } else {
    next()
  }
})

/**
 * The rooms list view
 */
router.get('/', function (req, res, next) {
  let currentPlayer = helpers.getPlayerFromSessionID(req.cookies['connect.sid'])
  let rooms = helpers.getRooms()
  res.render('rooms', {
    rooms: Object.keys(rooms).length ? rooms : null,
    playerName: currentPlayer.nickName,
  })
})

/**
 * A single room view
 */
router.get('/:roomSlug', function (req, res, next) {
  let currentPlayer = helpers.getPlayerFromSessionID(req.cookies['connect.sid'])
  let room = helpers.getRoom(req.params.roomSlug)
  if (room !== null) {
    res.render('room', {
      roomName: room.getName(),
      roomSlug: room.getSlug(),
      playerName: currentPlayer.nickName,
    })
  } else {
    res.redirect('/rooms')
  }
})

/**
 * A room's game view
 */
router.get('/:roomSlug/play', function (req, res, next) {
  let room = helpers.getRoom(req.params.roomSlug)
  if (room !== null) {
    res.render('play', {
      roomName: room.getName(),
      roomSlug: room.getSlug(),
    })
  } else {
    next()
  }
})

/**
 * The room's add form handling
 */
router.post('/', function (req, res, next) {
  let roomName = req.body['new-room']
  let roomSlug = helpers.createRoom(roomName)
  if (null === roomSlug) {
    res.redirect('/rooms')
  } else {
    res.redirect('/rooms/' + roomSlug)
  }
})

io.on('connection', (socket) => {
  let cookies = cookie.parse(socket.handshake.headers.cookie)
  let currentPlayer = helpers.getPlayerFromSessionID(cookies['connect.sid'])

  if (currentPlayer) {
    currentPlayer.socketID = socket.id
    helpers.updatePlayer(cookies['connect.sid'], currentPlayer)
    io.to(socket.id).emit('player-connected', {
      nickName: currentPlayer.nickName,
      playerID: currentPlayer.playerID,
      sessionID: cookies['connect.sid'],
    })
  }

  // When player ask for joining a room
  socket.on('room-join', (data) => {
    let room = helpers.getRoom(data.roomSlug)
    if (room === null) {
      return
    } else {
      socket.join(room.getSlug())
      room.refreshPlayers()

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

  socket.on('disconnecting', () => {
    socket.rooms.forEach((roomSlug) => {
      let room = helpers.getRoom(roomSlug)
      if (room === null) {
        return
      } else {
        room.refreshPlayers(socket.id)
        if (players[roomSlug] && players[roomSlug][String(socket.id)]) {
          delete players[roomSlug][String(socket.id)]
          delete playersMoves[roomSlug][String(socket.id)]
        }
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
  //for (const [roomSlug, room] of Object.entries(rooms)) {
  //}
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
