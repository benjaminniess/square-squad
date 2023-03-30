import {Container, Inject, Service} from "typedi";
import {Server} from "socket.io";
import {Socket} from "socket.io-client";
import {RoomsManager} from "../services/RoomsManager";

@Service()
export class RoomsCreateHandler {
  io: Server
  roomsManager: RoomsManager

  constructor(@Inject() roomsManager: RoomsManager) {
    this.io = Container.get('io')
    this.roomsManager = roomsManager
  }

  public handle(socket: Socket | any, data: any): void {
    if (!data.roomName || data.roomName ! instanceof String || data.roomName.length <= 0) {
      this.io.to(socket.id).emit('create-room-result', {
        success: false,
        error: 'room-name-is-empty'
      })
      return;
    }

    this.roomsManager.createRoom(data.roomName, socket.id)
      .then(data => {
        this.io.to(socket.id).emit('create-room-result', {
          success: true,
          data: data
        })
      })
      .catch(error => {
        this.io.to(socket.id).emit('create-room-result', {
          success: false,
          error: error
        })
      })


  }
}
