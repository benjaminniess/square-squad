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
    return new Promise((resolve, reject ) => {
      for (const [sessionID, session] of Object.entries(this.sessions)) {
        if ( session.socketID === socketIDVal ) {
          resolve(session)
        }
      }
    })
    
  }
}

module.exports = {
  InMemorySessionStore,
}
