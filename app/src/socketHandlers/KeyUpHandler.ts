import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {GameStatus} from "../enums/GameStatus";
import {GameInstancesRepository} from "../repositories/GameInstancesRepository";
import {PlayerInputs} from "../games/features/enums/PlayerInputs";

@Service()
export class KeyUpHandler {
  io: Server
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository
  gameInstancesRepository: GameInstancesRepository

  constructor(
    @Inject() roomsRepository: RoomsRepository,
    @Inject() playersRepository: PlayersRepository,
    @Inject() gameInstancesRepository: GameInstancesRepository
  ) {
    this.io = Container.get('io')
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
    this.gameInstancesRepository = gameInstancesRepository
  }

  public handle(socket: Socket | any, data: any): void {
    this.playersRepository.findOrFailBySocketID(socket.id).then(currentPlayer => {
      socket.rooms.forEach((roomSlug: string) => {
        if (roomSlug === socket.id) {
          return
        }

        this.roomsRepository.findOrFailBySlug(roomSlug).then(room => {
          if (room && room.gameStatus === GameStatus.Playing) {


            const gameInstance = this.gameInstancesRepository.findByRoomSlug(roomSlug)

            if (typeof data === 'undefined' || !data.key) {
              gameInstance.getInputManager().resetPlayerInputs(socket.id)

              return
            }

            if (data.key == 39) {
              gameInstance.getInputManager().setPlayerButtonState(socket.id, PlayerInputs.Right, false)
            } else if (data.key == 37) {
              gameInstance.getInputManager().setPlayerButtonState(socket.id, PlayerInputs.Left, false)
            }

            if (data.key == 40) {
              gameInstance.getInputManager().setPlayerButtonState(socket.id, PlayerInputs.Up, false)
            } else if (data.key == 38) {
              gameInstance.getInputManager().setPlayerButtonState(socket.id, PlayerInputs.Down, false)
            }
          }
        })
      })
    }).catch(error => {
      return
    })
  }
}
