const Room = require('../lib/room')
const Player = require('./player')
const crypto = require('crypto')

/**
 * Slugify a string with spaces or accents
 *
 * @param {string} str
 * @returns
 */
function stringToSlug(str) {
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

function getSessionStore() {
  return globalSessionStore
}

function getRooms() {
  return globalRooms
}

function getRoom(roomSlug) {
  if (typeof globalRooms[roomSlug] !== 'undefined') {
    return globalRooms[roomSlug]
  } else {
    return null
  }
}

function getPlayers() {
  return globalPlayers
}

function getPlayer(sessionID) {
  if (!sessionID) {
    return false
  } else {
    if (globalPlayers[sessionID]) {
      return globalPlayers[sessionID]
    } else {
      globalPlayers[sessionID] = new Player(sessionID)
      return globalPlayers[sessionID]
    }
  }
}

function getPlayerFromSessionID(sessionID) {
  return getSessionStore().findSession(sessionID)
}

function getPlayerFromSocketID(socketID) {
  return getSessionStore().findSessionFromSocketID(socketID)
}

function updatePlayer(sessionID, playerData) {
  globalSessionStore.saveSession(sessionID, playerData)
}

function createRoom(roomName) {
  let roomSlug = stringToSlug(roomName)
  if (typeof globalRooms[roomSlug] !== 'undefined' || roomName === '') {
    return null
  }

  globalRooms[roomSlug] = new Room(roomSlug, roomName)

  return roomSlug
}

function getRandomID() {
  return crypto.randomBytes(8).toString('hex')
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

exports.stringToSlug = stringToSlug
exports.getRoom = getRoom
exports.getRooms = getRooms
exports.getPlayers = getPlayers
exports.getPlayer = getPlayer
exports.getPlayerFromSessionID = getPlayerFromSessionID
exports.getPlayerFromSocketID = getPlayerFromSocketID
exports.updatePlayer = updatePlayer
exports.createRoom = createRoom
exports.getRandomID = getRandomID
exports.getRandomInt = getRandomInt
