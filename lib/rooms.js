const helpers = require('../lib/helpers')
const Room = require('./room')
const _ = require('lodash')

class Rooms {
  constructor() {
    if (!Rooms.instance) {
      Rooms.instance = this
      this.rooms = {}
    }
  }

  getInstance() {
    return Rooms.instance
  }

  getRooms() {
    return this.rooms
  }

  deleteRoom(roomSlug) {
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
    _.forEach(rooms, (room) => {
      if (room.getPlayers().length <= 0) {
        this.deleteRoom(room.getSlug())
        hasDeletedRooms = true
      }
    })

    return hasDeletedRooms
  }

  getRoomsData() {
    let roomsData = []
    let rooms = this.getRooms()
    if (!rooms) {
      return []
    }

    _.forEach(rooms, (room) => {
      roomsData.push(room.getBasicData())
    })

    return roomsData
  }

  createRoom(roomName) {
    let roomSlug = helpers.stringToSlug(roomName)
    if (typeof this.rooms[roomSlug] !== 'undefined' || roomName === '') {
      return null
    }

    this.rooms[roomSlug] = new Room(roomSlug, roomName)

    return roomSlug
  }

  getRoom(roomSlug) {
    if (typeof this.rooms[roomSlug] !== 'undefined') {
      return this.rooms[roomSlug]
    } else {
      return null
    }
  }
}

module.exports = new Rooms().getInstance()
