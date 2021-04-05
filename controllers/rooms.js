'use_strict'

const express = require('express')
const router = express.Router()
const helpers = require('../lib/helpers')
const cookie = require('cookie')

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
      isAdmin: room.getAdminPlayer() === currentPlayer.playerID,
      status: room.getGameStatus(),
    })
  } else {
    res.render('error', { message: 'This room does not exist' })
  }
})

/**
 * A room's game view
 */
router.get('/:roomSlug/play', function (req, res, next) {
  let room = helpers.getRoom(req.params.roomSlug)
  let gameStatus = room.getGameStatus()
  if (gameStatus === 'waiting') {
    res.redirect(room.getLobbyURL())
  } else if (gameStatus === 'playing') {
    res.redirect(room.getLobbyURL())
  } else if (room !== null) {
    res.render('error', { message: 'This room does not exist' })
  } else {
    res.render('play', {
      roomName: room.getName(),
      roomSlug: room.getSlug(),
    })
  }
})

/**
 * The room's add form handling
 */
router.post('/', function (req, res, next) {
  let currentPlayer = helpers.getPlayerFromSessionID(req.cookies['connect.sid'])
  let roomName = req.body['new-room']
  let roomSlug = helpers.createRoom(roomName)
  if (!currentPlayer) {
    res.redirect('/')
  } else {
    if (!roomSlug) {
      res.render('error', { message: 'This name is already taken' })
    } else {
      let room = helpers.getRoom(roomSlug)
      room.setAdminPlayer(currentPlayer.playerID)
      res.redirect(room.getLobbyURL())
    }
  }
})

io.on('connection', (socket) => {
  let cookies = cookie.parse(socket.handshake.headers.cookie)
  let currentPlayer = helpers.getPlayerFromSessionID(cookies['connect.sid'])
  let rooms = helpers.getRooms()

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
    }
  })

  socket.on('disconnecting', () => {
    socket.rooms.forEach((roomSlug) => {
      let room = helpers.getRoom(roomSlug)
      if (room === null) {
        return
      } else {
        room.refreshPlayers(socket.id)
      }
    })
  })

  socket.on('start-game', (data) => {
    helpers.getPlayerFromSocketID(socket.id).then((emiter) => {
      let room = helpers.getRoom(data.roomSlug)
      if (room && room.getAdminPlayer() === emiter.playerID) {
        room.setGameStatus('starting')
        io.to(data.roomSlug).emit('game-is-starting', {
          href: room.getPlayURL(),
        })
      }
    })
  })

  socket.on('disconnect', function () {})

  socket.on('keyPressed', function (socketData) {
    socket.rooms.forEach((roomSlug) => {
      if (roomSlug != socket.id) {
        if (socketData.key == 39) {
          rooms[roomSlug]
            .getGame()
            .updatePlayerButtonState(currentPlayer.playerID, 'right', true)
        } else if (socketData.key == 37) {
          rooms[roomSlug]
            .getGame()
            .updatePlayerButtonState(currentPlayer.playerID, 'left', true)
        }

        if (socketData.key == 40) {
          rooms[roomSlug]
            .getGame()
            .updatePlayerButtonState(currentPlayer.playerID, 'top', true)
        } else if (socketData.key == 38) {
          rooms[roomSlug]
            .getGame()
            .updatePlayerButtonState(currentPlayer.playerID, 'down', true)
        }
      }
    })
  })

  socket.on('keyUp', function (socketData) {
    socket.rooms.forEach((roomSlug) => {
      if (roomSlug != socket.id) {
        if (socketData.key == 39) {
          rooms[roomSlug]
            .getGame()
            .updatePlayerButtonState(currentPlayer.playerID, 'right', false)
        } else if (socketData.key == 37) {
          rooms[roomSlug]
            .getGame()
            .updatePlayerButtonState(currentPlayer.playerID, 'left', false)
        }

        if (socketData.key == 40) {
          rooms[roomSlug]
            .getGame()
            .updatePlayerButtonState(currentPlayer.playerID, 'top', false)
        } else if (socketData.key == 38) {
          rooms[roomSlug]
            .getGame()
            .updatePlayerButtonState(currentPlayer.playerID, 'down', false)
        }
      }
    })
  })
})

setInterval(refreshData, 10)

function refreshData() {
  for (const [roomSlug, room] of Object.entries(helpers.getRooms())) {
    let roomGame = room.getGame()
    if (roomGame) {
      let players = roomGame.refreshData()

      io.to(roomSlug).emit('refreshCanvas', {
        players: players,
      })
    }
  }
}
