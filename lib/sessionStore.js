class InMemorySessionStore {
  constructor() {
    this.sessions = {}
  }

  findSession(socketID) {
    return this.sessions[socketID] ? this.sessions[socketID] : null
  }

  saveSession(socketID, session) {
    this.sessions[socketID] = session
  }

  removeSession(socketID) {
    delete this.sessions[socketID]
  }

  findAllSessions() {
    return this.sessions
  }
}

module.exports = {
  InMemorySessionStore
}
