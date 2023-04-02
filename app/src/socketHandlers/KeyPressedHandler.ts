import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {GameStatus} from "../enums/GameStatus";
import {GameInstancesRepository} from "../repositories/GameInstancesRepository";
import {PlayerInputs} from "../games/features/enums/PlayerInputs";

@Service()
export class KeyPressedHandler {
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
    this.playersRepository.findBySocketId(socket.id).then(currentPlayer => {
      socket.rooms.forEach((roomSlug: string) => {
        if (roomSlug === socket.id) {
          return
        }

        const gameInstance = this.gameInstancesRepository.findByRoomSlug(roomSlug)

        try {
          this.roomsRepository.findOrFailBySlug(roomSlug).then(room => {
            if (room.gameStatus === GameStatus.Playing) {
              if (data.key == 39) {
                gameInstance.getInputManager().setPlayerButtonState(socket.id, PlayerInputs.Right, true)
              } else if (data.key == 37) {
                gameInstance.getInputManager().setPlayerButtonState(socket.id, PlayerInputs.Left, true)
              }

              if (data.key == 40) {
                gameInstance.getInputManager().setPlayerButtonState(socket.id, PlayerInputs.Up, true)
              } else if (data.key == 38) {
                gameInstance.getInputManager().setPlayerButtonState(socket.id, PlayerInputs.Down, true)
              }
            }
          })
        } catch (exception: any) {
          return
        }
      })
    }).catch(error => {
      return
    })
  }
}
