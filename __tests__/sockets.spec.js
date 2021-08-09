const server = require('../')

const PORT = 7080

beforeEach(() => {
  server.listen(PORT)
})

afterEach(() => {
  server.close()
})

const { io } = require('socket.io-client')
const socket1 = io('http://localhost:' + PORT)
const socket2 = io('http://localhost:' + PORT)

const validUser = {
  name: 'Tester',
  color: '#00FF00'
}

const validGameData = {
  roomSlug: 'room-name',
  roundsNumber: '4',
  obstaclesSpeed: '19',
  bonusFrequency: '2'
}

const updatePlayer = (user = validUser, socket = socket1) => {
  return new Promise((resolve, reject) => {
    socket.emit('update-player-data', user)
    socket.on('update-player-data-result', (result) => {
      resolve(result)
    })
  })
}

const refreshRooms = (socket = socket1) => {
  return new Promise((resolve, reject) => {
    socket.emit('rooms-refresh')
    socket.on('rooms-refresh-result', (result) => {
      resolve(result)
    })
  })
}

const createRoom = (roomName = 'Room name', socket = socket1) => {
  return new Promise((resolve, reject) => {
    socket.emit('rooms-create', roomName)
    socket.on('rooms-create-result', (result) => {
      resolve(result)
    })
  })
}

const joinRoom = (room = { roomSlug: 'room-name' }, socket = socket1) => {
  return new Promise((resolve, reject) => {
    let socketData = {}
    socket.emit('room-join', room)
    socket.on('room-join-result', (result) => {
      socketData['room-join-result'] = result
    })

    socket.on('refresh-players', (result) => {
      socketData['refresh-players'] = result
      resolve(socketData)
    })
  })
}

const startGame = (gameData = validGameData, socket = socket1) => {
  return new Promise((resolve, reject) => {
    socket.emit('start-game', gameData)
    socket.on('start-game-result', (result) => {
      resolve(result)
    })
  })
}

describe('SOCKET - Player Data', function () {
  it('emits a update-player-data-result socket with a success set to false when missing name', async function () {
    const result = await updatePlayer({ name: '', color: '#FF0000' })
    expect(result.success).toBe(false)
  })

  it('emits a update-player-data-result socket with a Empty name or color message when missing name', async function () {
    const result = await updatePlayer({ name: '', color: '#FF0000' })
    expect(result.error).toBe('Empty name or color')
  })

  it('creates a player', async function () {
    const result = await updatePlayer()
    expect(result.success).toBeTruthy()
  })

  it("updates a player's data", async function () {
    const result = await updatePlayer({
      name: 'Tester updated',
      color: '#00FF00'
    })
    expect(result.success).toBeTruthy()
  })
})

describe('SOCKET - Rooms', function () {
  it('refreshs rooms list and sends a success result', async function () {
    const result = await refreshRooms()
    expect(result.success).toBeTruthy()
  })

  it('refreshs rooms list and sends an empty rooms list', async function () {
    const result = await refreshRooms()
    expect(result.data).toStrictEqual([])
  })

  it('creates a room when no room exist with this name and returns a success staus with room data', async function () {
    const result = await createRoom()
    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual({ roomSlug: 'room-name' })
  })

  it('fails to create existing room and send an error status', async function () {
    const result = await createRoom()
    expect(result.success).toBe(false)
  })

  it('fails to create existing room and send an error message', async function () {
    const result = await createRoom()
    expect(result.error).toBe('This name is already taken')
  })

  it('joins an existing room and send a success state and an array of 1 player', async function () {
    const result = await joinRoom()
    expect(result['room-join-result'].success).toBeTruthy()
    expect(result['room-join-result'].data).toStrictEqual({
      gameStatus: 'waiting',
      roomName: 'Room name',
      roomSlug: 'room-name'
    })
    expect(result['refresh-players']).toHaveLength(1)
  })
})

describe('SOCKET - Player 2 is joining', function () {
  it('creates a second player with a new socket and returns a success status', async function () {
    const result = await updatePlayer(
      {
        name: 'Tester 2 ',
        color: '#0000FF'
      },
      socket2
    )
    expect(result.success).toBeTruthy()
  })

  it('joins a room with the second socket and returns a success state and an array of 2 players', async function () {
    const result = await joinRoom({ roomSlug: 'room-name' }, socket2)

    expect(result['room-join-result'].success).toEqual(true)
    expect(result['room-join-result'].data).toStrictEqual({
      gameStatus: 'waiting',
      roomName: 'Room name',
      roomSlug: 'room-name'
    })
    expect(result['refresh-players']).toHaveLength(2)
  })
})

describe('SOCKET - Start game', function () {
  it('Fails to create a game if not admin', async function () {
    const result = await startGame(validGameData, socket2)
    expect(result.success).toBe(false)
    expect(result.error).toBe('You are not admin of this room')
  })

  it('Fails to create a game if missing data', async function () {
    const result = await startGame({}, socket2)
    expect(result.success).toBe(false)
    expect(result.error).toBe('This room does not exist')
  })

  it('Creates a game', async function () {
    const result = await startGame()
    expect(result.success).toBeTruthy()
    expect(result.data.currentRound).toBe(1)
    expect(result.data.totalRounds).toBe(4)
  })

  for (let i = 3; i >= 0; i--) {
    it('Wait for the game to start in ' + i, function () {
      return new Promise((resolve, reject) => {
        socket1.on('countdown-update', (data) => {
          resolve(data)
        })
      }).then((result) => {
        expect(result.timeleft).toBe(i)
      })
    })
  }
})
