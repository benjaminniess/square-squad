const Room = require('../lib/room')
const Player = require('./player')
const crypto = require('crypto')

class Helpers {
  /**
   * Slugify a string with spaces or accents
   *
   * @param {string} str
   * @returns
   */
  static stringToSlug(str) {
    str = str.replace(/^\s+|\s+$/g, '') // trim
    str = str.toLowerCase()

    // remove accents, swap ñ for n, etc
    var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
    var to = 'aaaaeeeeiiiioooouuuunc------'
    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
    }

    str = str
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-') // collapse dashes

    return str
  }

  static getRooms() {
    return globalRooms
  }

  static getRoomsData() {
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

  static getRoom(roomSlug) {
    if (typeof globalRooms[roomSlug] !== 'undefined') {
      return globalRooms[roomSlug]
    } else {
      return null
    }
  }

  static deleteRoom(roomSlug) {
    if (typeof globalRooms[roomSlug] !== 'undefined') {
      delete globalRooms[roomSlug]
    }
  }

  static deleteEmptyRooms() {
    let rooms = this.getRooms()
    if (!rooms) {
      return []
    }

    _.forEach(rooms, (room) => {
      if (room.getPlayers().length <= 0) {
        this.deleteRoom(room.getSlug())
      }
    })
  }

  static getPlayers() {
    return globalPlayers
  }

  static getPlayer(socketID) {
    if (!socketID) {
      return false
    }

    if (!globalPlayers[socketID]) {
      return false
    }

    return globalPlayers[socketID]
  }

  static initPlayer(socketID, playerName, playerColor) {
    let newPlayer = new Player(socketID)
    newPlayer.resetData({
      nickName: playerName,
      color: playerColor
    })

    globalPlayers[socketID] = newPlayer

    return newPlayer
  }

  static updatePlayer(socketID, playerData) {
    globalPlayers[socketID].resetData(playerData)
  }

  static createRoom(roomName) {
    let roomSlug = this.stringToSlug(roomName)
    if (typeof globalRooms[roomSlug] !== 'undefined' || roomName === '') {
      return null
    }

    globalRooms[roomSlug] = new Room(roomSlug, roomName)

    return roomSlug
  }

  static getRandomID() {
    return crypto.randomBytes(8).toString('hex')
  }

  static getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
  }
}

module.exports = Helpers
