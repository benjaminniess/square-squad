import {Inject, Service} from "typedi";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {SocketDatabaseSynchronizer} from "../services/SocketDatabaseSynchronizer";

@Service()
export class DisconnectingHandler {
  playersRepository: PlayersRepository
  socketDatabaseSynchronizer: SocketDatabaseSynchronizer

  constructor(
    @Inject() socketDatabaseSynchronizer: SocketDatabaseSynchronizer,
    @Inject() playersRepository: PlayersRepository
  ) {
    this.playersRepository = playersRepository
    this.socketDatabaseSynchronizer = socketDatabaseSynchronizer
  }

  public handle(socket: Socket | any): void {
    socket.rooms.forEach((roomSlug: string) => {
      socket.leave(roomSlug)
    })

    this.socketDatabaseSynchronizer.deleteGhostPlayersFromDatabase().then(() => {
      this.socketDatabaseSynchronizer.deleteGhostRoomsFromDatabase()
    })
  }
}
