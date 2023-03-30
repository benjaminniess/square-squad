import {Container, Service} from "typedi";
import {Server, Socket} from "socket.io";

@Service()
export class SocketsRepository {
  private io: Server

  constructor() {
    this.io = Container.get('io')
  }

  findAllPlayers(): string[] {
    const socketIds = []
    this.io.sockets.sockets.forEach(socket => {
      socketIds.push(socket.id);
    })

    return socketIds
  }

  findAllRooms(): SocketRoomDto[] {
    const rooms: SocketRoomDto[] = []

    this.io.sockets.adapter.rooms.forEach((roomPlayersSocketIds, roomSlug) => {
      roomPlayersSocketIds.forEach(socketID => {
        if (socketID === roomSlug) {
          return;
        }

        rooms.push({
          slug: roomSlug,
          playersSocketId: Array.from(roomPlayersSocketIds)
        })
      })
    })

    return rooms
  }

  findRoomsSlugs(): string[] {
    const roomsSlugs = []

    this.io.sockets.adapter.rooms.forEach((roomPlayersSocketIds, roomSlug) => {
      roomPlayersSocketIds.forEach(socketID => {
        if (socketID === roomSlug) {
          return;
        }

        roomsSlugs.push(roomSlug)
      })
    })

    return roomsSlugs
  }

  isSocketInRoom(socket: Socket, roomSlug: string): boolean {
    let roomExists = false
    socket.rooms.forEach((room) => {
      if (room === roomSlug) {
        roomExists = true
      }
    })

    return roomExists
  }
}
