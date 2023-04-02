import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {SocketsRepository} from "../repositories/SocketsRepository";
import {GameStatus} from "../enums/GameStatus";

@Service()
export class StartGameHandler {
  io: Server
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository
  socketsRepository: SocketsRepository

  constructor(
    @Inject() roomsRepository: RoomsRepository,
    @Inject() playersRepository: PlayersRepository,
    @Inject() socketsRepository: SocketsRepository,
  ) {
    this.io = Container.get('io')
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
    this.socketsRepository = socketsRepository
  }

  public handle(socket: Socket | any, data: any): void {
    if (!data || !data.roomSlug || !this.socketsRepository.isSocketInRoom(socket, data.roomSlug)) {
      this.io.to(socket.id).emit('start-game-result', {
        success: false,
        error: 'action-is-forbidden'
      })
      return
    }

    this.roomsRepository.findOrFailBySlug(data.roomSlug).then(room => {
      room.leader.then(leader => {
        if (leader.socketID !== socket.id) {
          this.io.to(socket.id).emit('start-game-result', {
            success: false,
            error: 'action-is-forbidden'
          })
          return
        }

        if (!data.parameters || !data.gameType) {
          this.io.to(socket.id).emit('start-game-result', {
            success: false,
            error: 'wrong-formatted-data'
          })
          return
        }

        this.roomsRepository.initializeGameInstance(room, data.gameType, data.parameters).then(() => {
            this.io.to(socket.id).emit('start-game-result', {
              success: true,
              data: {}
            })

            this.io.to(room.slug).emit('update-game-status', {
              status: GameStatus.Ready_to_Start,
            })
          }
        )
      })
      // TODO
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
      // this.io.to(data.roomSlug).emit('start-game-result', {
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
      //         this.io.to(data.roomSlug).emit('in-game-countdown-update', {
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
      //           this.io.to(data.roomSlug).emit('in-game-countdown-update', {
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
      //   this.io.to(data.roomSlug).emit('countdown-update', {
      //     timeleft: timeleft,
      //     gameData: game.getBasicData()
      //   })
      //
      //   timeleft -= 1
      // }, 1000)
    }).catch(error => {
      this.io.to(socket.id).emit('start-game-result', {
        success: false,
        error: 'room-does-not-exist'
      })

      return
    })

  }
}
