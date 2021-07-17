const { io } = require('socket.io-client')
const socket = io('http://localhost:8080')
const socket2 = io('http://localhost:8080')
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
      socket.emit('update-player-data', {
        name: 'Tester updated',
        color: '#00FF00'
      })
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

  it('Refreshs players', function () {
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

describe('SOCKET - Player 2 is joining', function () {
  it('Creates a second player', function () {
    return new Promise((resolve, reject) => {
      socket2.emit('update-player-data', {
        name: 'Tester 2 ',
        color: '#0000FF'
      })
      socket2.on('player-data-updated', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(true)
    })
  })

  it('Joins a room', function () {
    return new Promise((resolve, reject) => {
      socket2.emit('room-join', { roomSlug: 'room-name' })
      let socketData = {}
      socket2.on('room-join-result', (data) => {
        socketData['room-join-result'] = data
      })
      socket2.on('refresh-players', (data) => {
        socketData['refresh-players'] = data
        resolve(socketData)
      })
    }).then((result) => {
      expect(result['room-join-result'].success).to.equal(true)
      expect(result['room-join-result'].data.roomSlug).to.equal('room-name')
      expect(result['refresh-players']).to.be.a('array')
      expect(result['refresh-players']).to.have.lengthOf(2)
    })
  })
})

describe('SOCKET - Start game', function () {
  it('Fails to create a game if not admin', function () {
    return new Promise((resolve, reject) => {
      socket2.emit('start-game', {
        roomSlug: 'room-name',
        roundsNumber: '4',
        obstaclesSpeed: '19',
        bonusFrequency: '2'
      })
      socket2.on('start-game-result', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(false)
      expect(result.error).to.equal('You are not admin of this room')
    })
  })

  it('Fails to create a game if missing data', function () {
    return new Promise((resolve, reject) => {
      socket2.emit('start-game', {})
      socket2.on('start-game-result', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(false)
      expect(result.error).to.equal('This room does not exist')
    })
  })

  it('Creates a game', function () {
    return new Promise((resolve, reject) => {
      socket.emit('start-game', {
        roomSlug: 'room-name',
        roundsNumber: '4',
        obstaclesSpeed: '19',
        bonusFrequency: '2'
      })
      socket.on('start-game-result', (data) => {
        resolve(data)
      })
    }).then((result) => {
      expect(result.success).to.equal(true)
      expect(result.data.currentRound).to.equal(1)
      expect(result.data.totalRounds).to.equal(4)
    })
  })
})
