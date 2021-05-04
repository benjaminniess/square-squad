'use_strict'

const express = require('express')
const router = express.Router()
const cookie = require('cookie')
const validator = require('validator')

module.exports = function (app) {
  app.use('/rooms', router)
}

/**
 * Global check. Nobody is allowed here if no session ID or no nickname
 */
router.get('*', function (req, res, next) {
  let currentPlayer = helpers.getPlayer(req.cookies['connect.sid'])
  if (!currentPlayer || !currentPlayer.getNickname()) {
    res.redirect('/')
  } else {
    next()
  }
})

/**
 * The rooms list view
 */
router.get('/', function (req, res, next) {
  let currentPlayer = helpers.getPlayer(req.cookies['connect.sid'])
  let rooms = helpers.getRooms()

  // On dev mode, auto create a user and a room
  if (
    process.env.AUTO_CREATE_ROOM &&
    process.env.AUTO_CREATE_ROOM === 'true' &&
    !_.size(rooms)
  ) {
    let roomSlug = helpers.createRoom('TEST ROOM')

    let room = helpers.getRoom(roomSlug)
    room.setAdminPlayer(currentPlayer.getPublicID())
    res.redirect(room.getLobbyURL())

    return
  }

  res.render('rooms', {
    playerName: currentPlayer.getNickname(),
    playerColor: currentPlayer.getColor(),
  })
})

/**
 * A single room view
 */
router.get('/:roomSlug', function (req, res, next) {
  let currentPlayer = helpers.getPlayer(req.cookies['connect.sid'])
  let room = helpers.getRoom(req.params.roomSlug)
  if (!room) {
    res.render('error', { message: 'This room does not exist' })
    return
  }

  let gameStatus = room.getGame().getStatus()

  res.render('room', {
    roomName: room.getName(),
    roomSlug: room.getSlug(),
    playerName: currentPlayer.getNickname(),
    playerColor: currentPlayer.getColor(),
    isAdmin: room.getAdminPlayer() === currentPlayer.getPublicID(),
    status: gameStatus,
    gameJS: '/assets/' + room.getGame().getSlug() + '/play.js',
  })
})

/**
 * The room's add form handling
 */
router.post('/', function (req, res, next) {
  let currentPlayer = helpers.getPlayer(req.cookies['connect.sid'])
  let roomName = validator.blacklist(req.body['new-room'], "<>\\/'")
  let roomSlug = helpers.createRoom(roomName)
  if (!currentPlayer) {
    res.redirect('/')
    return
  }

  if (!roomSlug) {
    res.render('error', { message: 'This name is already taken' })
    return
  }

  let room = helpers.getRoom(roomSlug)
  room.setAdminPlayer(currentPlayer.getPublicID())
  res.redirect(room.getLobbyURL())
})

io.on('connection', (socket) => {
  let cookies = cookie.parse(socket.handshake.headers.cookie)
  let currentPlayer = helpers.getPlayer(cookies['connect.sid'])
  let rooms = helpers.getRooms()

  let playerNickName = currentPlayer.getNickname()
  if (playerNickName) {
    currentPlayer.resetData({ socketID: socket.id })
    io.to(socket.id).emit('player-connected', {
      nickName: playerNickName,
      playerColor: currentPlayer.getColor(),
      playerID: currentPlayer.getPublicID(),
      sessionID: cookies['connect.sid'],
    })
  }

  // When player ask for joining a room
  socket.on('room-join', (data) => {
    let room = helpers.getRoom(data.roomSlug)
    let cookies = cookie.parse(socket.handshake.headers.cookie)
    let currentPlayer = helpers.getPlayer(cookies['connect.sid'])
    if (room) {
      let game = room.getGame()
      let gameStatus = game.getStatus()
      socket.join(room.getSlug())
      currentPlayer.resetData({
        socketID: socket.id,
        isSpectator: gameStatus === 'playing',
      })
      if (gameStatus === 'playing') {
        io.to(socket.id).emit('countdown-update', {
          timeleft: 0,
          gameData: game.getBasicData(),
        })
      }

      room.refreshPlayers()
    }
  })

  socket.on('disconnecting', () => {
    socket.rooms.forEach((roomSlug) => {
      let room = helpers.getRoom(roomSlug)
      if (room) {
        if (room.getAdminPlayer() === currentPlayer.getPublicID()) {
          room.resetAdminPlayer()
        }
        room.refreshPlayers(socket.id)
      }
    })
  })

  socket.on('start-game', (data) => {
    let cookies = cookie.parse(socket.handshake.headers.cookie)
    let currentPlayer = helpers.getPlayer(cookies['connect.sid'])

    let room = helpers.getRoom(data.roomSlug)
    if (!room) {
      return
    }

    let game = room.getGame()
    let playersManager = game.getPlayersManager()
    if (room.getAdminPlayer() !== currentPlayer.getPublicID()) {
      return
    }

    // first round of the game?
    let gameStatus = game.getStatus()
    if (gameStatus === 'waiting') {
      let roundsNumber =
        data.roundsNumber &&
        parseInt(data.roundsNumber) > 0 &&
        parseInt(data.roundsNumber) <= 100
          ? parseInt(data.roundsNumber)
          : 3

      let obstaclesStartSpeed =
        data.obstaclesSpeed &&
        parseInt(data.obstaclesSpeed) > 0 &&
        parseInt(data.obstaclesSpeed) <= 30
          ? parseInt(data.obstaclesSpeed)
          : 5

      let bonusFrequency =
        data.bonusFrequency &&
        parseInt(data.bonusFrequency) >= 0 &&
        parseInt(data.bonusFrequency) <= 10
          ? parseInt(data.bonusFrequency)
          : 5
      game.setTotalRounds(roundsNumber)
      game.getObstaclesManager().setStartLevel(obstaclesStartSpeed)
      game.setBonusFrequency(bonusFrequency)
      game.initGame()
    } else {
      game.initRound()
      game.setStatus('starting')
    }

    io.to(data.roomSlug).emit('game-is-starting', {
      currentRound: game.getRoundNumber(),
      totalRounds: game.getTotalRounds(),
    })
    room.refreshPlayers()

    let timeleft = 3
    let countdownTimer = setInterval(function () {
      if (timeleft <= 0) {
        clearInterval(countdownTimer)
        game.setStatus('playing')

        if (game.getType() === 'countdown') {
          let gameTimeleft = game.getDuration()
          let gameTimer = setInterval(function () {
            if (gameTimeleft <= 0) {
              clearInterval(gameTimer)
              game.setStatus('waiting')
            }

            io.to(data.roomSlug).emit('in-game-countdown-update', {
              timeleft: gameTimeleft,
            })

            gameTimeleft -= 1
          }, 1000)
        } else {
          let gameTimer = setInterval(function () {
            let countAlive = playersManager.countAlivePlayers()

            if (
              countAlive === 0 ||
              (countAlive === 1 && playersManager.countPlayers() > 1)
            ) {
              clearInterval(gameTimer)
              if (countAlive) {
                _.forEach(
                  playersManager.getPlayersData(),
                  (playerData, playerID) => {
                    if (playerData.alive) {
                      playersManager.addPoints(playerID, 3)
                    }
                  },
                )
              }

              game.syncScores()
              game.saveRoundScores()

              let lastRoundWinner = game.getLastRoundWinner()
              let lastRoundRanking = game.getLastRoundRanking()
              game.resetLastRoundRanking()
              room.refreshPlayers()

              game.setStatus('end-round')
              game.getPlayersManager().renewPlayers()

              if (game.getRoundNumber() >= game.getTotalRounds()) {
                game.setStatus('waiting')
              }

              io.to(data.roomSlug).emit('in-game-countdown-update', {
                timeleft: 0,
                roundWinner: lastRoundWinner,
                roundRanking: lastRoundRanking,
                ranking: game.getRanking(),
                gameStatus: game.getStatus(),
              })
            }
          }, 1000)
        }
      }

      io.to(data.roomSlug).emit('countdown-update', {
        timeleft: timeleft,
        gameData: game.getBasicData(),
      })

      timeleft -= 1
    }, 1000)
  })

  socket.on('disconnect', function () {
    let rooms = helpers.getRooms()
    if (rooms) {
      _.forEach(rooms, (room) => {
        if (_.size(room.getPlayers()) === 0) {
          helpers.deleteRoom(room.getSlug())
        }
      })
    }
  })

  socket.on('rooms-refresh', function () {
    io.to(socket.id).emit('rooms-refresh-result', helpers.getRoomsData())
  })

  socket.on('keyPressed', function (socketData) {
    let cookies = cookie.parse(socket.handshake.headers.cookie)
    let currentPlayer = helpers.getPlayer(cookies['connect.sid'])

    if (currentPlayer.getNickname() && !currentPlayer.isSpectator()) {
      socket.rooms.forEach((roomSlug) => {
        if (roomSlug != socket.id) {
          let room = helpers.getRoom(roomSlug)
          let gameStatus = room.getGame().getStatus()
          if (room && gameStatus === 'playing') {
            if (socketData.key == 39) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'right',
                  true,
                )
            } else if (socketData.key == 37) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'left',
                  true,
                )
            }

            if (socketData.key == 40) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'top',
                  true,
                )
            } else if (socketData.key == 38) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'down',
                  true,
                )
            }
          }
        }
      })
    }
  })

  socket.on('keyUp', function (socketData) {
    let cookies = cookie.parse(socket.handshake.headers.cookie)
    let currentPlayer = helpers.getPlayer(cookies['connect.sid'])
    if (currentPlayer.getNickname() && !currentPlayer.isSpectator()) {
      socket.rooms.forEach((roomSlug) => {
        let room = helpers.getRoom(roomSlug)
        if (room && room.getGame().getStatus() === 'playing') {
          if (roomSlug != socket.id) {
            if ( typeof socketData === 'undefined' || ! socketData.key ) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .resetTouches(
                  currentPlayer.getPublicID()
                )

                return
            }
            if (socketData.key == 39) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'right',
                  false,
                )
            } else if (socketData.key == 37) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'left',
                  false,
                )
            }

            if (socketData.key == 40) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'top',
                  false,
                )
            } else if (socketData.key == 38) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'down',
                  false,
                )
            }
          }
        }
      })
    }
  })
})

setInterval(refreshData, 10)

function refreshData() {
  _.forEach(helpers.getRooms(), (room) => {
    let roomGame = room.getGame()
    let status = room.getGame().getStatus()

    if (roomGame && (status === 'playing' || status === 'starting')) {
      io.to(room.getSlug()).emit('refreshCanvas', roomGame.refreshData())
    }
  })
}
