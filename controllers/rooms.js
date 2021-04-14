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
    playerColor: currentPlayer.playerColor,
  })
})

/**
 * A single room view
 */
router.get('/:roomSlug', function (req, res, next) {
  let currentPlayer = helpers.getPlayerFromSessionID(req.cookies['connect.sid'])
  let room = helpers.getRoom(req.params.roomSlug)
  let gameStatus = room.getGame().getStatus()
  if (room !== null) {
    if (gameStatus === 'starting' || gameStatus === 'playing') {
      res.redirect(room.getPlayURL())
    } else {
      res.render('room', {
        roomName: room.getName(),
        roomSlug: room.getSlug(),
        playerName: currentPlayer.nickName,
        isAdmin: room.getAdminPlayer() === currentPlayer.playerID,
        status: gameStatus,
      })
    }
  } else {
    res.render('error', { message: 'This room does not exist' })
  }
})

/**
 * A room's game view
 */
router.get('/:roomSlug/play', function (req, res, next) {
  let room = helpers.getRoom(req.params.roomSlug)
  let gameStatus = room.getGame().getStatus()
  if (gameStatus === 'waiting') {
    res.redirect(room.getLobbyURL())
  } else if (room === null) {
    res.render('error', { message: 'This room does not exist' })
  } else {
    res.render('play', {
      gameJS: '/assets/' + room.getGame().getSlug() + '/play.js',
      roomName: room.getName(),
      roomSlug: room.getSlug(),
    })
  }
})

/**
 * A room's ranking view
 */
router.get('/:roomSlug/ranking', function (req, res, next) {
  let room = helpers.getRoom(req.params.roomSlug)
  if (room === null) {
    res.render('error', { message: 'This room does not exist' })
  } else {
    let game = room.getGame()
    let gameStatus = game.getStatus()
    if (gameStatus !== 'end-round') {
      res.redirect(room.getLobbyURL())
    } else {
      res.render('ranking', {
        roundWinner: game.getLastRoundWinner(),
        ranking: game.getLastRoundRanking(),
        roomName: room.getName(),
        roomSlug: room.getSlug(),
      })
    }
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
    let cookies = cookie.parse(socket.handshake.headers.cookie)
    let currentPlayer = helpers.getPlayerFromSessionID(cookies['connect.sid'])
    if (room === null) {
      return
    } else {
      socket.join(room.getSlug())
      currentPlayer.isSpectator =
        room.getGame().getStatus() === 'playing' ? true : false
      helpers.updatePlayer(cookies['connect.sid'], currentPlayer)
      room.refreshPlayers().then((sessions) => {
        io.in(room.getSlug()).emit('refreshPlayers', sessions)
      })
    }
  })

  socket.on('disconnecting', () => {
    socket.rooms.forEach((roomSlug) => {
      let room = helpers.getRoom(roomSlug)
      if (room === null) {
        return
      } else {
        if (room.getAdminPlayer() === currentPlayer.playerID) {
          room.resetAdminPlayer()
        }
        room.refreshPlayers(socket.id).then((sessions) => {
          io.in(room.getSlug()).emit('refreshPlayers', sessions)
        })
      }
    })
  })

  socket.on('start-game', (data) => {
    helpers.getPlayerFromSocketID(socket.id).then((emiter) => {
      let room = helpers.getRoom(data.roomSlug)
      let game = room.getGame()
      if (room && room.getAdminPlayer() === emiter.playerID) {
        room.getGame().setStatus('starting')
        io.to(data.roomSlug).emit('game-is-starting', {
          href: room.getPlayURL(),
        })

        let timeleft = 3
        let countdownTimer = setInterval(function () {
          if (timeleft <= 0) {
            clearInterval(countdownTimer)
            game.start()

            if (game.getType() === 'countdown') {
              let gameTimeleft = game.getDuration()
              let gameTimer = setInterval(function () {
                if (gameTimeleft <= 0) {
                  clearInterval(gameTimer)
                  game.setStatus('waiting')
                }

                io.to(data.roomSlug).emit('in-game-countdown-update', {
                  timeleft: gameTimeleft,
                  href: room.getLobbyURL(),
                })

                gameTimeleft -= 1
              }, 1000)
            } else {
              let gameTimer = setInterval(function () {
                game.countAlivePlayers().then((countAlive) => {
                  if (countAlive === 0) {
                    clearInterval(gameTimer)
                    game.setStatus('end-round')
                    io.to(data.roomSlug).emit('in-game-countdown-update', {
                      timeleft: 0,
                      href: room.getRankingURL(),
                    })
                  }
                })
              }, 1000)
            }
          }

          io.to(data.roomSlug).emit('countdown-update', {
            timeleft: timeleft,
            gameData: game.getBasicData(),
          })

          timeleft -= 1
        }, 1000)
      }
    })
  })

  socket.on('disconnect', function () {})

  socket.on('keyPressed', function (socketData) {
    let cookies = cookie.parse(socket.handshake.headers.cookie)
    let currentPlayer = helpers.getPlayerFromSessionID(cookies['connect.sid'])

    if (currentPlayer && !currentPlayer.isSpectator) {
      socket.rooms.forEach((roomSlug) => {
        if (roomSlug != socket.id) {
          let room = helpers.getRoom(roomSlug)
          let gameStatus = room.getGame().getStatus()
          if (room && gameStatus === 'playing') {
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
        }
      })
    }
  })

  socket.on('keyUp', function (socketData) {
    let cookies = cookie.parse(socket.handshake.headers.cookie)
    let currentPlayer = helpers.getPlayerFromSessionID(cookies['connect.sid'])
    if (currentPlayer && !currentPlayer.isSpectator) {
      socket.rooms.forEach((roomSlug) => {
        let room = helpers.getRoom(roomSlug)
        if (room && room.getGame().getStatus() === 'playing') {
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
        }
      })
    }
  })
})

setInterval(refreshData, 10)

function refreshData() {
  for (const [roomSlug, room] of Object.entries(helpers.getRooms())) {
    let roomGame = room.getGame()
    let status = room.getGame().getStatus()
    if (roomGame && (status === 'playing' || status === 'starting')) {
      let gameData = roomGame.refreshData()
      io.to(roomSlug).emit('refreshCanvas', gameData)
    }
  }
}
