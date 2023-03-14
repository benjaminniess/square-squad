import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";

@Service()
export class UpdatePlayerDataHandler {
  io: Server
  playersRepository: PlayersRepository

  constructor(@Inject() playersRepository: PlayersRepository) {
    this.io = Container.get('io')
    this.playersRepository = playersRepository
  }

  public handle(socket: Socket | any, data: any): void {
    if (!data.name || !data.color) {
      this.io.to(socket.id).emit('update-player-data-result', {
        success: false,
        error: 'empty-name-or-color'
      })

      return
    }

    this.playersRepository.createOrUpdate(socket.id, {
      nickName: data.name,
      color: data.color
    }).then(() => {
      this.io.to(socket.id).emit('update-player-data-result', {
        success: true
      })
    })
  }
}
