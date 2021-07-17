const { io } = require('socket.io-client')
const socket = io('http://localhost:8080')
const { expect } = require('chai')

describe('SOCKET - Player Data', function () {
  it('Fails to create a player with no name', function () {
    return new Promise((resolve, reject) => {
      socket.emit('update-player-data', { name: '', color: '#FF0000' })
      socket.on('player-data-updated', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(false)
      expect(result.error).to.equal('Empty name or color')
    })
  })

  it('Creates a player', function () {
    return new Promise((resolve, reject) => {
      socket.emit('update-player-data', { name: 'Tester', color: '#FF0000' })
      socket.on('player-data-updated', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(true)
    })
  })

  it("Updates a player's data", function () {
    return new Promise((resolve, reject) => {
      socket.emit('update-player-data', { name: 'Tester 2', color: '#00FF00' })
      socket.on('player-data-updated', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(true)
    })
  })
})

describe('SOCKET - Rooms', function () {
  it('Refreshs empty rooms list', function () {
    return new Promise((resolve, reject) => {
      socket.emit('rooms-refresh')
      socket.on('rooms-refresh-result', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(true)
      expect(result.data).to.be.a('array')
      expect(result.data).to.be.empty
    })
  })

  it('Creates a room', function () {
    return new Promise((resolve, reject) => {
      socket.emit('rooms-create', 'Room name')
      socket.on('rooms-create-result', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(true)
      expect(result.data.roomSlug).to.equal('room-name')
    })
  })

  it('Fails to create existing room', function () {
    return new Promise((resolve, reject) => {
      socket.emit('rooms-create', 'Room name')
      socket.on('rooms-create-result', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(false)
      expect(result.error).to.equal('This name is already taken')
    })
  })

  it('Joins a room', function () {
    return new Promise((resolve, reject) => {
      socket.emit('room-join', { roomSlug: 'room-name' })
      socket.on('room-join-result', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(true)
      expect(result.data.roomSlug).to.equal('room-name')
    })
  })

  it('Refreshs rooms list', function () {
    return new Promise((resolve, reject) => {
      socket.emit('rooms-refresh')
      socket.on('rooms-refresh-result', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(true)
      expect(result.data).to.be.a('array')
      expect(result.data).not.to.be.empty
    })
  })
})
