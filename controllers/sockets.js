'use_strict'

const validator = require('validator')
const rooms = require('../lib/rooms')
const players = require('../lib/players')
const _ = require('lodash')

module.exports = function (app) {
  const io = app.get('socketIOInstance')

  io.on('connection', (socket) => {
    socket.on('update-player-data', (data) => {
      if (!data.name || !data.color) {
        io.to(socket.id).emit('update-player-data-result', {
          success: false,
          error: 'Empty name or color'
        })

        return
      }
      let existingPlayer = players.getPlayer(socket.id)
      if (!existingPlayer) {
        existingPlayer = players.initPlayer(socket.id, data.name, data.color)
        if (!existingPlayer) {
          io.to(socket.id).emit('update-player-data-result', {
            success: false,
            error: 'Error while initializing player'
          })
        } else {
          io.to(socket.id).emit('update-player-data-result', {
            success: true
          })
        }

        return
      }

      players.updatePlayer(socket.id, {
        nickName: data.name,
        color: data.color
      })

      io.to(socket.id).emit('update-player-data-result', {
        success: true
      })
    })

    socket.on('rooms-refresh', () => {
      rooms.deleteEmptyRooms()
      io.to(socket.id).emit('rooms-refresh-result', {
        success: true,
        data: rooms.getRoomsData()
      })
    })

    // When player ask for joining a room
    socket.on('room-join', (data) => {
      let room = rooms.getRoom(data.roomSlug)
      if (!room) {
        io.to(socket.id).emit('room-join-result', {
          success: false,
          error: 'Room does not exist'
        })
        return
      }

      let currentPlayer = players.getPlayer(socket.id)
      if (!currentPlayer) {
        io.to(socket.id).emit('room-join-result', {
          success: false,
          error: 'Session is over'
        })
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

      io.to(socket.id).emit('room-join-result', {
        success: true,
        data: {
          roomSlug: room.getSlug(),
          roomName: room.getName(),
          gameStatus: gameStatus
        }
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
      let currentPlayer = players.getPlayer(socket.id)
      if (!currentPlayer || !currentPlayer.nickName) {
        io.to(socket.id).emit('rooms-create-result', {
          success: false,
          error: 'Player not logged'
        })
        return
      }

      if (!roomName || roomName.length <= 0) {
        io.to(socket.id).emit('rooms-create-result', {
          success: false,
          error: 'Room name is empty'
        })
        return
      }

      roomName = validator.blacklist(roomName, "<>\\/'")
      let roomSlug = rooms.createRoom(roomName)
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

          let room = rooms.getRoom(roomSlug)
          if (_.size(players.getPlayers()) === 0) {
            rooms.deleteRoom(roomSlug)
          }

          if (room.getAdminPlayer() === socket.id) {
            room.resetAdminPlayer()
          }

          room.refreshPlayers(socket.id)
        }
      })
    })

    socket.on('disconnecting', () => {
      socket.rooms.forEach((roomSlug) => {
        let room = rooms.getRoom(roomSlug)
        if (room) {
          if (room.getAdminPlayer() === socket.id) {
            room.resetAdminPlayer()
          }
          room.refreshPlayers(socket.id)
        }
      })
    })

    socket.on('start-game', (data) => {
      let room = rooms.getRoom(data.roomSlug)
      if (!room) {
        io.to(socket.id).emit('start-game-result', {
          success: false,
          error: 'This room does not exist'
        })
        return
      }

      let game = room.getGame()
      let playersManager = game.getPlayersManager()
      if (room.getAdminPlayer() !== socket.id) {
        io.to(socket.id).emit('start-game-result', {
          success: false,
          error: 'You are not admin of this room'
        })
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

      io.to(data.roomSlug).emit('start-game-result', {
        success: true,
        data: {
          currentRound: game.getRoundNumber(),
          totalRounds: game.getTotalRounds()
        }
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

    socket.on('keyPressed', function (socketData) {
      let currentPlayer = players.getPlayer(socket.id)
      if (
        currentPlayer &&
        currentPlayer.getNickname() &&
        !currentPlayer.isSpectator()
      ) {
        socket.rooms.forEach((roomSlug) => {
          if (roomSlug != socket.id) {
            let room = rooms.getRoom(roomSlug)
            let gameStatus = room.getGame().getStatus()
            if (room && gameStatus === 'playing') {
              if (socketData.key == 39) {
                room
                  .getGame()
                  .getPlayersManager()
                  .updatePlayerButtonState(socket.id, 'right', true)
              } else if (socketData.key == 37) {
                room
                  .getGame()
                  .getPlayersManager()
                  .updatePlayerButtonState(socket.id, 'left', true)
              }

              if (socketData.key == 40) {
                room
                  .getGame()
                  .getPlayersManager()
                  .updatePlayerButtonState(socket.id, 'top', true)
              } else if (socketData.key == 38) {
                room
                  .getGame()
                  .getPlayersManager()
                  .updatePlayerButtonState(socket.id, 'down', true)
              }
            }
          }
        })
      }
    })

    socket.on('keyUp', function (socketData) {
      let currentPlayer = players.getPlayer(socket.id)
      if (
        currentPlayer &&
        currentPlayer.getNickname() &&
        !currentPlayer.isSpectator()
      ) {
        socket.rooms.forEach((roomSlug) => {
          let room = rooms.getRoom(roomSlug)
          if (room && room.getGame().getStatus() === 'playing') {
            if (roomSlug != socket.id) {
              if (typeof socketData === 'undefined' || !socketData.key) {
                room.getGame().getPlayersManager().resetTouches(socket.id)

                return
              }
              if (socketData.key == 39) {
                room
                  .getGame()
                  .getPlayersManager()
                  .updatePlayerButtonState(socket.id, 'right', false)
              } else if (socketData.key == 37) {
                room
                  .getGame()
                  .getPlayersManager()
                  .updatePlayerButtonState(socket.id, 'left', false)
              }

              if (socketData.key == 40) {
                room
                  .getGame()
                  .getPlayersManager()
                  .updatePlayerButtonState(socket.id, 'top', false)
              } else if (socketData.key == 38) {
                room
                  .getGame()
                  .getPlayersManager()
                  .updatePlayerButtonState(socket.id, 'down', false)
              }
            }
          }
        })
      }
    })
  })
}
