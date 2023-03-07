import {Server} from 'socket.io'
import {Container, Inject, Service} from "typedi";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {Room} from "../entity/Room";

const validator = require('validator')
const _ = require('lodash')

@Service()
export class SocketController {
  constructor(@Inject() roomsRepository: RoomsRepository, @Inject() playersRepository: PlayersRepository) {
    const io: Server = Container.get('io')

    roomsRepository.deleteWhereEmpty()

    io.on('connection', (socket) => {
      socket.on('update-player-data', (data: any) => {
        if (!data.name || !data.color) {
          io.to(socket.id).emit('update-player-data-result', {
            success: false,
            error: 'Empty name or color'
          })

          return
        }

        playersRepository.createOrUpdate(socket.id, {
          nickName: data.name,
          color: data.color
        }).then(() => {
          io.to(socket.id).emit('update-player-data-result', {
            success: true
          })
        })
      })

      socket.on('rooms-refresh', () => {
        roomsRepository.deleteWhereEmpty().then(() => {
          roomsRepository.findAll().then(rooms => {
            //console.log(rooms)
            io.to(socket.id).emit('rooms-refresh-result', {
              success: true,
              data: rooms
            })
          })
        })

      })

      // When player ask for joining a room
      socket.on('room-join', (data: any) => {
        roomsRepository.findOrFailBySlug(data.roomSlug).then(room => {

          playersRepository.findOrFailBySocketID(socket.id).then(currentPlayer => {
            socket.join(room.slug)

            // TODO spectator mode
            if (room.game?.status === 'playing') {
              //playersRepository.setSpectatorMode(currentPlayer.getSocketID())
            } else {
              //playersRepository.unsetSpectatorMode(currentPlayer.getSocketID())
            }

            if (!room.leader) {
              roomsRepository.setLeader(room, currentPlayer)
            }

            io.to(socket.id).emit('room-join-result', {
              success: true,
              data: {
                roomSlug: room.slug,
                roomName: room.name,
                gameStatus: room.game?.status
              }
            })
            if (room.game?.status === 'playing') {
              io.to(socket.id).emit('countdown-update', {
                timeleft: 0,
                gameData: {
                  squareSize: 30 // TODO
                }
              })
            }
          }).catch(error => {
            io.to(socket.id).emit('room-join-result', {
              success: false,
              error: 'Session is over'
            })
            return
          })
        }).catch(error => {
          console.log(error)
          io.to(socket.id).emit('room-join-result', {
            success: false,
            error: 'Room does not exist'
          })
          return
        })
      })

      socket.on('rooms-create', (roomName: string) => {
        try {
          console.log('find or fail from room create')
          playersRepository.findOrFailBySocketID(socket.id).then(player => {
            if (!roomName || roomName.length <= 0) {
              io.to(socket.id).emit('rooms-create-result', {
                success: false,
                error: 'Room name is empty'
              })
              return
            }

            roomName = validator.blacklist(roomName, "<>\\/'")

            try {
              roomsRepository.create(roomName).then((room: Room) => {
                io.to(socket.id).emit('rooms-create-result', {
                  success: true,
                  data: {roomSlug: room.slug}
                })
              })
            } catch (exception) {
              io.to(socket.id).emit('rooms-create-result', {
                success: false,
                error: 'This name is already taken'
              })
              return
            }
          })
        } catch (exception: any) {
          io.to(socket.id).emit('rooms-create-result', {
            success: false,
            error: 'Player not logged'
          })
          return
        }
      })

      socket.on('room-leave', () => {
        socket.rooms.forEach((roomSlug: string) => {
          if (socket.id !== roomSlug) {
            socket.leave(roomSlug)

            try {
              roomsRepository.findOrFailBySlug(roomSlug).then(room => {
                if (room.leader.socketId === socket.id) {
                  roomsRepository.maybeResetLeader(room)
                } else {
                  playersRepository.findOrFailBySocketID(socket.id).then(player => {
                    roomsRepository.removePlayerFromRoom(player, room)
                  }).catch(error => {
                    return
                  })

                }
              })
            } catch (exception: any) {
              return
            }

          }
        })
      })

      socket.on('disconnecting', () => {
        socket.rooms.forEach((roomSlug: string) => {
          roomsRepository.findBySlug(roomSlug).then(room => {
            if (room) {
              if (room.leader.socketId === socket.id) {
                roomsRepository.maybeResetLeader(room)
              } else {
                roomsRepository.removePlayerFromRoom(socket.id, room)
              }
            }
          })
        })
      })

      socket.on('start-game', (data: any) => {
        try {
          roomsRepository.findOrFailBySlug(data.roomSlug).then(room => {

            // TODO
            // let game = room.game
            // let playersManager = game.getPlayersManager()
            // if (room.getAdminPlayer() !== socket.id) {
            //   io.to(socket.id).emit('start-game-result', {
            //     success: false,
            //     error: 'You are not admin of this room'
            //   })
            //   return
            // }
            //
            // // first round of the game?
            // let gameStatus = game.getStatus()
            // if (gameStatus === 'waiting') {
            //   let roundsNumber =
            //     data.roundsNumber &&
            //     parseInt(data.roundsNumber) > 0 &&
            //     parseInt(data.roundsNumber) <= 100
            //       ? parseInt(data.roundsNumber)
            //       : 3
            //
            //   let obstaclesStartSpeed =
            //     data.obstaclesSpeed &&
            //     parseInt(data.obstaclesSpeed) > 0 &&
            //     parseInt(data.obstaclesSpeed) <= 30
            //       ? parseInt(data.obstaclesSpeed)
            //       : 5
            //
            //   let bonusFrequency =
            //     data.bonusFrequency &&
            //     parseInt(data.bonusFrequency) >= 0 &&
            //     parseInt(data.bonusFrequency) <= 10
            //       ? parseInt(data.bonusFrequency)
            //       : 5
            //   game.setTotalRounds(roundsNumber)
            //   game.getObstaclesManager().setStartLevel(obstaclesStartSpeed)
            //   game.setBonusFrequency(bonusFrequency)
            //   game.initGame()
            // } else {
            //   game.initRound()
            //   game.setStatus('starting')
            // }
            //
            // io.to(data.roomSlug).emit('start-game-result', {
            //   success: true,
            //   data: {
            //     currentRound: game.getRoundNumber(),
            //     totalRounds: game.getTotalRounds()
            //   }
            // })
            //
            // room.refreshPlayers()
            //
            // let timeleft: number = 3
            // if (process.env.COUNTDOWN) {
            //   timeleft = parseInt(process.env.COUNTDOWN)
            // }
            //
            // let countdownTimer = setInterval(function () {
            //   if (timeleft <= 0) {
            //     clearInterval(countdownTimer)
            //     game.setStatus('playing')
            //
            //     if (game.getType() === 'countdown') {
            //       let gameTimeleft = game.getDuration()
            //       let gameTimer = setInterval(function () {
            //         if (gameTimeleft <= 0) {
            //           clearInterval(gameTimer)
            //           game.setStatus('waiting')
            //         }
            //
            //         io.to(data.roomSlug).emit('in-game-countdown-update', {
            //           timeleft: gameTimeleft
            //         })
            //
            //         gameTimeleft -= 1
            //       }, 1000)
            //     } else {
            //       let gameTimer = setInterval(function () {
            //         let countAlive = playersManager.countAlivePlayers()
            //
            //         if (
            //           countAlive === 0 ||
            //           (countAlive === 1 && playersManager.countPlayers() > 1)
            //         ) {
            //           clearInterval(gameTimer)
            //           if (countAlive) {
            //             _.forEach(
            //               playersManager.getPlayersData(),
            //               (playerData: any, playerID: string) => {
            //                 if (playerData.alive) {
            //                   playersManager.addPoints(playerID, 3)
            //                 }
            //               }
            //             )
            //           }
            //
            //           game.syncScores()
            //           game.saveRoundScores()
            //
            //           let lastRoundWinner = game.getLastRoundWinner()
            //           let lastRoundRanking = game.getLastRoundRanking()
            //           game.resetLastRoundRanking()
            //
            //           if (room) {
            //             room.refreshPlayers()
            //           }
            //
            //           game.setStatus('end-round')
            //           game.getPlayersManager().renewPlayers()
            //
            //           if (game.getRoundNumber() >= game.getTotalRounds()) {
            //             game.setStatus('waiting')
            //           }
            //
            //           io.to(data.roomSlug).emit('in-game-countdown-update', {
            //             timeleft: 0,
            //             roundWinner: lastRoundWinner,
            //             roundRanking: lastRoundRanking,
            //             ranking: game.getRanking(),
            //             gameStatus: game.getStatus()
            //           })
            //         }
            //       }, 1000)
            //     }
            //   }
            //
            //   io.to(data.roomSlug).emit('countdown-update', {
            //     timeleft: timeleft,
            //     gameData: game.getBasicData()
            //   })
            //
            //   timeleft -= 1
            // }, 1000)
          })
        } catch (error) {
          io.to(socket.id).emit('start-game-result', {
            success: false,
            error: ' room does not exist'
          })

          return
        }
      })

      socket.on('keyPressed', function (socketData: any) {
        return;
        playersRepository.findBySocketId(socket.id).then(currentPlayer => {
          socket.rooms.forEach((roomSlug: string) => {
            if (roomSlug === socket.id) {
              return
            }

            try {
              roomsRepository.findOrFailBySlug(roomSlug).then(room => {
                let gameStatus = room.game?.status
                if (gameStatus === 'playing') {
                  // TODO
                  // if (socketData.key == 39) {
                  //   room
                  //     .game
                  //     .getPlayersManager()
                  //     .updatePlayerButtonState(socket.id, 'right', true)
                  // } else if (socketData.key == 37) {
                  //   room
                  //     .getGame()
                  //     .getPlayersManager()
                  //     .updatePlayerButtonState(socket.id, 'left', true)
                  // }
                  //
                  // if (socketData.key == 40) {
                  //   room
                  //     .getGame()
                  //     .getPlayersManager()
                  //     .updatePlayerButtonState(socket.id, 'top', true)
                  // } else if (socketData.key == 38) {
                  //   room
                  //     .getGame()
                  //     .getPlayersManager()
                  //     .updatePlayerButtonState(socket.id, 'down', true)
                  // }
                }
              })
            } catch (exception: any) {
              return
            }
          })
        })
      })

      socket.on('keyUp', function (socketData: any) {
        return;
        playersRepository.findOrFailBySocketID(socket.id).then(currentPlayer => {
          socket.rooms.forEach((roomSlug: string) => {
            roomsRepository.findOrFailBySlug(roomSlug).then(room => {
              if (room && room.game.status === 'playing') {
                if (roomSlug === socket.id) {
                  return
                }

                // TODO
                // if (typeof socketData === 'undefined' || !socketData.key) {
                //   room.getGame().getPlayersManager().resetTouches(socket.id)
                //
                //   return
                // }
                // if (socketData.key == 39) {
                //   room
                //     .getGame()
                //     .getPlayersManager()
                //     .updatePlayerButtonState(socket.id, 'right', false)
                // } else if (socketData.key == 37) {
                //   room
                //     .getGame()
                //     .getPlayersManager()
                //     .updatePlayerButtonState(socket.id, 'left', false)
                // }
                //
                // if (socketData.key == 40) {
                //   room
                //     .getGame()
                //     .getPlayersManager()
                //     .updatePlayerButtonState(socket.id, 'top', false)
                // } else if (socketData.key == 38) {
                //   room
                //     .getGame()
                //     .getPlayersManager()
                //     .updatePlayerButtonState(socket.id, 'down', false)
                // }
              }
            })

          })
        })

      })
    })
  }
}
