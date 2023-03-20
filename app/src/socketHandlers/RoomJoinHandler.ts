import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {RoomsRepository} from "../repositories/RoomsRepository";

@Service()
export class RoomJoinHandler {
  io: Server
  playersRepository: PlayersRepository
  roomsRepository: RoomsRepository

  constructor(@Inject() roomsRepository: RoomsRepository, @Inject() playersRepository: PlayersRepository) {
    this.io = Container.get('io')
    this.playersRepository = playersRepository
    this.roomsRepository = roomsRepository
  }

  public handle(socket: Socket | any, data: any): void {
    if (!data.roomSlug || data.roomSlug ! instanceof String || data.roomSlug.length <= 0) {
      this.io.to(socket.id).emit('join-room-result', {
        success: false,
        error: 'room-slug-is-empty'
      })
      return;
    }

    this.roomsRepository.findOrFailBySlug(data.roomSlug).then(room => {

      this.playersRepository.findOrFailBySocketID(socket.id).then(currentPlayer => {
        socket.join(room.slug)

        // TODO spectator mode
        if (room.game?.status === 'playing') {
          //playersRepository.setSpectatorMode(currentPlayer.getSocketID())
        } else {
          //playersRepository.unsetSpectatorMode(currentPlayer.getSocketID())
        }

        this.roomsRepository.addPlayerToRoom(currentPlayer, room)

        if (!room.leader) {
          this.roomsRepository.setLeader(room, currentPlayer)
        }

        this.io.to(socket.id).emit('join-room-result', {
          success: true,
          data: {
            roomSlug: room.slug,
            roomName: room.name,
            //gameStatus: room.game?.status
            gameStatus: 'waiting'
          }
        })

        room.players.then(players => {
          this.io.in(data.roomSlug).emit('refresh-players', players)
        })

        if (room.game?.status === 'playing') {
          this.io.to(socket.id).emit('countdown-update', {
            timeleft: 0,
            gameData: {
              squareSize: 30 // TODO
            }
          })
        }
      }).catch(error => {
        this.io.to(socket.id).emit('join-room-result', {
          success: false,
          error: 'player-not-logged'
        })
        return
      })
    }).catch(error => {
      this.io.to(socket.id).emit('join-room-result', {
        success: false,
        error: 'room-does-not-exist'
      })
      return
    })
  }
}
