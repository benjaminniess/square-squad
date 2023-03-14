import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";

@Service()
export class KeyPressedHandler {
  io: Server
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository

  constructor(@Inject() roomsRepository: RoomsRepository, @Inject() playersRepository: PlayersRepository) {
    this.io = Container.get('io')
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
  }

  public handle(socket: Socket | any, data: any): void {
    return;
    this.playersRepository.findBySocketId(socket.id).then(currentPlayer => {
      socket.rooms.forEach((roomSlug: string) => {
        if (roomSlug === socket.id) {
          return
        }

        try {
          this.roomsRepository.findOrFailBySlug(roomSlug).then(room => {
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
  }
}
