export { Rooms }
import { Socket } from 'socket.io'
import { RoomBasicData } from '../entities/room'
import { Room } from '../entities/room'
const helpers = require('../helpers/helpers')

const _ = require('lodash')

class Rooms {
  private static instance: any
  private rooms: any
  private io: Socket | null = null

  constructor() {
    if (!Rooms.instance) {
      Rooms.instance = this
      this.rooms = {}
    }
  }

  getInstance() {
    return Rooms.instance
  }

  /**
   * Allows to inject IO dependency after construct call
   * Used in controllers after express app exists
   *
   * @param {} io: the socket io server object
   */
  injectIo(io: Socket) {
    this.io = io
  }

  getRooms() {
    return this.rooms
  }

  deleteRoom(roomSlug: string) {
    if (typeof this.rooms[roomSlug] !== 'undefined') {
      delete this.rooms[roomSlug]
      return true
    }

    return false
  }

  deleteEmptyRooms() {
    let rooms = this.getRooms()
    if (!rooms) {
      return false
    }

    let hasDeletedRooms = false
    _.forEach(rooms, (room: any) => {
      if (room.getPlayers().length <= 0) {
        this.deleteRoom(room.getSlug())
        hasDeletedRooms = true
      }
    })

    return hasDeletedRooms
  }

  getRoomsData(): RoomBasicData[] {
    let roomsData: any[] = []
    let rooms = this.getRooms()
    if (!rooms) {
      return []
    }

    _.forEach(rooms, (room: any) => {
      roomsData.push(room.getBasicData())
    })

    return roomsData
  }

  createRoom(roomName: string) {
    let roomSlug = helpers.stringToSlug(roomName)
    if (typeof this.rooms[roomSlug] !== 'undefined' || roomName === '') {
      return null
    }

    this.rooms[roomSlug] = new Room(roomSlug, roomName, this.io)

    return roomSlug
  }

  getRoom(roomSlug: string) {
    if (typeof this.rooms[roomSlug] !== 'undefined') {
      return this.rooms[roomSlug]
    } else {
      return null
    }
  }
}
