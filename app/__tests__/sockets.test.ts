import {SocketHelpers} from "./helpers/socketHelpers";
import {Socket} from "socket.io-client";
import {AppDataSourceTest} from "../src/data-source-test";
import {Container} from "typedi";
import {Player} from "../src/entity/Player";
import {Room} from "../src/entity/Room";
import {RoomsRepository} from "../src/repositories/RoomsRepository";
import {PlayersRepository} from "../src/repositories/PlayersRepository";

/**
 * Those tests are checking the socket.io client => server communication from user creation/update to game start
 */
const server = require('../')
const socketHelpers = new SocketHelpers()
const PORT = 7080
const {io} = require('socket.io-client')
let socket1: Socket
let socket2: Socket

let repo: RoomsRepository
let playerRepo: PlayersRepository

beforeAll(async () => {
  await AppDataSourceTest.initialize()

  Container.set('playersRepository', AppDataSourceTest.getRepository(Player))
  Container.set('roomsRepository', AppDataSourceTest.getRepository(Room))
  repo = Container.get(RoomsRepository)
  playerRepo = Container.get(PlayersRepository)
})
beforeEach(async () => {
  await repo.clear()
  await playerRepo.clear()

  server.listen(PORT)
  socket1 = io('http://localhost:' + PORT)
  socket2 = io('http://localhost:' + PORT)
})

afterEach(() => {
  server.close()
})


describe('SOCKET - Player Data', () => {
  it('emits a update-player-data-result socket with a success set to false when missing name', async () => {
    const result: any = await socketHelpers.updatePlayer(socket1, {name: '', color: '#FF0000'})
    expect(result.success).toBe(false)
  })

  it('emits a update-player-data-result socket with a Empty name or color message when missing name', async () => {
    const result: any = await socketHelpers.updatePlayer(socket1, {name: '', color: '#FF0000'})
    expect(result.error).toBe('empty-name-or-color')
  })

  it('creates a player', async () => {
    const result: any = await socketHelpers.updatePlayer(socket1)
    expect(result.success).toBeTruthy()
  })

  it("updates a player's data", async () => {
    const result: any = await socketHelpers.updatePlayer(
      socket1,
      {
        name: 'Tester updated',
        color: '#00FF00'
      })
    expect(result.success).toBeTruthy()
  })
})

describe('SOCKET - Rooms', () => {
  it('fails to refresh rooms is player is not complete', async () => {
    const result: any = await socketHelpers.refreshRooms(socket1)

    expect(result.success).toBeFalsy()
    expect(result.error).toBe('player-not-logged')
  })

  it('refreshes rooms list', async () => {
    await socketHelpers.updatePlayer(socket1)
    const result: any = await socketHelpers.refreshRooms(socket1)

    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual([])
  })

  it('fails to create a room is player is not logged', async () => {
    const result: any = await socketHelpers.createRoom(socket1)
    expect(result.success).toBeFalsy()
    expect(result.error).toBe('player-not-logged')
  })

  it('fails to create a room with no name', async () => {
    await socketHelpers.updatePlayer(socket1)
    const result: any = await socketHelpers.createRoom(socket1, null)

    expect(result.success).toBe(false)
    expect(result.error).toBe('room-name-is-empty')
  })

  it('creates a room when no room exist with this name and returns a success status with room data', async () => {
    await socketHelpers.updatePlayer(socket1)
    expect((await socketHelpers.refreshRooms(socket1)).data).toHaveLength(0)

    const result: any = await socketHelpers.createRoom(socket1)

    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual({roomSlug: 'room-name'})

    expect((await socketHelpers.refreshRooms(socket1)).data).toHaveLength(1)

  })

  it('fails to create existing room and send an error status', async () => {
    await socketHelpers.updatePlayer(socket1)
    await socketHelpers.createRoom(socket1)

    await socketHelpers.updatePlayer(socket2)
    const result: any = await socketHelpers.createRoom(socket2)

    expect(result.success).toBe(false)
    expect(result.error).toBe('name-is-already-taken')
  })

  it('joins an existing room and send a success state and an array of 2 player', async () => {
    await socketHelpers.updatePlayer(socket1)
    await socketHelpers.createRoom(socket1)

    await socketHelpers.updatePlayer(socket2)
    const result: any = await socketHelpers.joinRoom(socket2)

    expect(result['join-room-result'].success).toBeTruthy()
    expect(result['join-room-result'].data).toStrictEqual({
      gameStatus: 'waiting',
      roomName: 'Room name',
      roomSlug: 'room-name'
    })
    expect(result['refresh-players']).toHaveLength(2)
  })
})

describe('SOCKET - Player 2 is joining', () => {
  it('creates a second player with a new socket and returns a success status', async () => {
    await socketHelpers.updatePlayer(socket1)
    const result: any = await socketHelpers.updatePlayer(
      socket2,
      {
        name: 'Tester 2 ',
        color: '#0000FF'
      },
    )
    expect(result.success).toBeTruthy()
  })

  it('fails to join a room if not logged', async () => {
    await socketHelpers.updatePlayer(socket1)
    await socketHelpers.createRoom(socket1)

    const result: any = await socketHelpers.joinRoom(socket2)

    expect(result['join-room-result'].success).toBe(false)
    expect(result['join-room-result'].error).toBe('player-not-logged')
  })

  it('fails to join a room with empty name', async () => {
    const result: any = await socketHelpers.joinRoom(socket2, {roomSlug: null})

    expect(result['join-room-result'].success).toBe(false)
    expect(result['join-room-result'].error).toBe('room-slug-is-empty')
  })

  it('fails to join a room with not existing name', async () => {
    const result: any = await socketHelpers.joinRoom(socket2, {roomSlug: 'random-slug'})

    expect(result['join-room-result'].success).toBe(false)
    expect(result['join-room-result'].error).toBe('room-does-not-exist')
  })

  it('joins a room with the second socket and returns a success state and an array of 2 players', async () => {
    await socketHelpers.updatePlayer(socket1)
    await socketHelpers.createRoom(socket1)

    await socketHelpers.updatePlayer(socket2)
    const result: any = await socketHelpers.joinRoom(socket2, {roomSlug: 'room-name'})

    expect(result['join-room-result'].success).toBeTruthy()
    expect(result['join-room-result'].data).toStrictEqual({
      gameStatus: 'waiting',
      roomName: 'Room name',
      roomSlug: 'room-name'
    })
    expect(result['refresh-players']).toHaveLength(2)
  })
})

describe('SOCKET - Start game', () => {
  it('Fails to create a game if not admin', async () => {
    await socketHelpers.updatePlayer(socket1)
    await socketHelpers.createRoom(socket1)

    await socketHelpers.updatePlayer(socket2)
    await socketHelpers.joinRoom(socket2, {roomSlug: 'room-name'})

    const result: any = await socketHelpers.startGame(socket2, socketHelpers.validGameData,)
    console.log(result)
    expect(result.success).toBe(false)
    expect(result.error).toBe('You are not admin of this room')
  })

  it('Fails to create a game if missing data', async () => {
    const result: any = await socketHelpers.startGame(socket2, {},)
    expect(result.success).toBe(false)
    expect(result.error).toBe('room-does-not-exist')
  })

  it('Creates a game', async () => {
    const result: any = await socketHelpers.startGame(socket1)
    expect(result.success).toBeTruthy()
    expect(result.data.currentRound).toBe(1)
    expect(result.data.totalRounds).toBe(4)
  })

  for (let i = 3; i >= 0; i--) {
    it('Wait for the game to start in ' + i, () => {
      return new Promise((resolve, reject) => {
        socket1.on('countdown-update', (data: any) => {
          resolve(data)
        })
      }).then((result: any) => {
        expect(result.timeleft).toBe(i)
      })
    })
  }
})
