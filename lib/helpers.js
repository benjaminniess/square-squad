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

function getPlayers() {
  return globalPlayers
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

exports.stringToSlug = stringToSlug
exports.getRooms = getRooms
exports.getPlayers = getPlayers
exports.getPlayerFromSessionID = getPlayerFromSessionID
exports.getPlayerFromSocketID = getPlayerFromSocketID
exports.updatePlayer = updatePlayer
