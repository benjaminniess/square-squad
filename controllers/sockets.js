'use_strict'

const validator = require('validator')

module.exports = function (app) {
  io.on('connection', (socket) => {
    socket.on('update-player-data', (data) => {
      let existingPlayer = helpers.getPlayer(socket.id)
      if (!existingPlayer) {
        existingPlayer = helpers.initPlayer(socket.id, data.name, data.color)
        if (!existingPlayer) {
          io.to(socket.id).emit('player-data-updated', {
            success: false,
            error: 'Error while initializing player'
          })
        } else {
          io.to(socket.id).emit('player-data-updated', {
            success: true
          })
        }

        return
      }

      helpers.updatePlayer(socket.id, {
        nickName: data.name,
        color: data.color
      })

      io.to(socket.id).emit('player-data-updated', {
        success: true
      })
    })

    socket.on('rooms-refresh', () => {
      helpers.deleteEmptyRooms()
      io.to(socket.id).emit('rooms-refresh-result', {
        success: true,
        data: helpers.getRoomsData()
      })
    })

    // When player ask for joining a room
    socket.on('room-join', (data) => {
      let room = helpers.getRoom(data.roomSlug)
      if (!room) {
        return
      }

      let currentPlayer = helpers.getPlayer(socket.id)
      if (!currentPlayer) {
        return
      }

      let game = room.getGame()
      let gameStatus = game.getStatus()
      socket.join(room.getSlug())
      currentPlayer.resetData({
        isSpectator: gameStatus === 'playing'
      })

      if (!room.getAdminPlayer()) {
        room.setAdminPlayer(socket.id)
      }

      io.to(socket.id).emit('room-joined', {
        roomSlug: room.getSlug(),
        roomName: room.getName(),
        gameStatus: gameStatus
      })
      if (gameStatus === 'playing') {
        io.to(socket.id).emit('countdown-update', {
          timeleft: 0,
          gameData: game.getBasicData()
        })
      }

      room.refreshPlayers()
    })

    socket.on('rooms-create', (roomName) => {
      let currentPlayer = helpers.getPlayer(socket.id)
      if (!currentPlayer || !currentPlayer.nickName) {
        io.to(socket.id).emit('rooms-create-result', {
          success: false,
          error: 'Player not logged'
        })
        return
      }

      roomName = validator.blacklist(roomName, "<>\\/'")
      let roomSlug = helpers.createRoom(roomName)
      if (!roomSlug) {
        io.to(socket.id).emit('rooms-create-result', {
          success: false,
          error: 'This name is already taken'
        })
        return
      }

      io.to(socket.id).emit('rooms-create-result', {
        success: true,
        data: { roomSlug: roomSlug }
      })
    })

    socket.on('room-leave', () => {
      socket.rooms.forEach((roomSlug) => {
        if (socket.id !== roomSlug) {
          socket.leave(roomSlug)

          let room = helpers.getRoom(roomSlug)
          if (_.size(room.getPlayers()) === 0) {
            helpers.deleteRoom(roomSlug)
          }

          if (room.getAdminPlayer() === socket.id) {
            room.resetAdminPlayer()
          }

          room.refreshPlayers(socket.id)
        }
      })
    })

    socket.on('disconnecting', () => {
      helpers.deletePlayer(socket.id)
      socket.rooms.forEach((roomSlug) => {
        let room = helpers.getRoom(roomSlug)
        if (room) {
          if (room.getAdminPlayer() === socket.id) {
            room.resetAdminPlayer()
          }
          room.refreshPlayers(socket.id)
        }
      })
    })

    socket.on('start-game', (data) => {
      let room = helpers.getRoom(data.roomSlug)
      if (!room) {
        return
      }

      let game = room.getGame()
      let playersManager = game.getPlayersManager()
      if (room.getAdminPlayer() !== socket.id) {
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
        totalRounds: game.getTotalRounds()
      })
      room.refreshPlayers()

      let timeleft = 3
      if (process.env.COUNTDOWN) {
        timeleft = process.env.COUNTDOWN
      }

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
                timeleft: gameTimeleft
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
                    }
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
                  gameStatus: game.getStatus()
                })
              }
            }, 1000)
          }
        }

        io.to(data.roomSlug).emit('countdown-update', {
          timeleft: parseInt(timeleft),
          gameData: game.getBasicData()
        })

        timeleft -= 1
      }, 1000)
    })
  })
}

setInterval(refreshData, 10)

let lockedRefresh = false
function refreshData() {
  if (lockedRefresh) {
    return
  }

  lockedRefresh = true
  _.forEach(helpers.getRooms(), (room) => {
    let roomGame = room.getGame()
    let status = room.getGame().getStatus()

    if (roomGame && (status === 'playing' || status === 'starting')) {
      io.to(room.getSlug()).emit('refreshCanvas', roomGame.refreshData())
    }
  })

  lockedRefresh = false
}

return
//TODO: redispatch code

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
      sessionID: cookies['connect.sid']
    })
  }

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
                  true
                )
            } else if (socketData.key == 37) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'left',
                  true
                )
            }

            if (socketData.key == 40) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'top',
                  true
                )
            } else if (socketData.key == 38) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'down',
                  true
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
            if (typeof socketData === 'undefined' || !socketData.key) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .resetTouches(currentPlayer.getPublicID())

              return
            }
            if (socketData.key == 39) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'right',
                  false
                )
            } else if (socketData.key == 37) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'left',
                  false
                )
            }

            if (socketData.key == 40) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'top',
                  false
                )
            } else if (socketData.key == 38) {
              rooms[roomSlug]
                .getGame()
                .getPlayersManager()
                .updatePlayerButtonState(
                  currentPlayer.getPublicID(),
                  'down',
                  false
                )
            }
          }
        }
      })
    }
  })
})
