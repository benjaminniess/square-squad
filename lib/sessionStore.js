class InMemorySessionStore {
  constructor() {
    this.sessions = {}
  }

  findSession(id) {
    return this.sessions[id] ? this.sessions[id] : null
  }

  saveSession(id, session) {
    this.sessions[id] = session
  }

  findAllSessions() {
    return this.sessions
  }

  findSessionFromSocketID(socketID) {
    let socketIDVal = socketID

    let result = null
    _.forEach(this.sessions, (session, sessionID) => {
      if (session.socketID === socketIDVal) {
        result = session
      }
    })

    return result
  }
}

module.exports = {
  InMemorySessionStore,
}
