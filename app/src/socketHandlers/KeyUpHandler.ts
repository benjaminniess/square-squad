import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";

@Service()
export class KeyUpHandler {
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
    this.playersRepository.findOrFailBySocketID(socket.id).then(currentPlayer => {
      socket.rooms.forEach((roomSlug: string) => {
        this.roomsRepository.findOrFailBySlug(roomSlug).then(room => {
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
  }
}
