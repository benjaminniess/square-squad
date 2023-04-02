import "reflect-metadata";
import {AppDataSource} from "../../src/data-source-test";
import {Container} from "typedi";
import {Player} from "../../src/entity/Player";
import {Room} from "../../src/entity/Room";
import {RoomsRepository} from "../../src/repositories/RoomsRepository";
import {PlayersRepository} from "../../src/repositories/PlayersRepository";

let repo: RoomsRepository
let playerRepo: PlayersRepository
beforeAll(async () => {
  await AppDataSource.initialize()

  Container.set('playersRepository', AppDataSource.getRepository(Player))
  Container.set('roomsRepository', AppDataSource.getRepository(Room))
  Container.set('io', {
    sockets: {
      adapter: {
        rooms: []
      }

    }
  })
  repo = Container.get(RoomsRepository)
  playerRepo = Container.get(PlayersRepository)
})
beforeEach(async () => {
  await repo.clear()
  await playerRepo.clear()
});

afterEach(async () => {

});

describe('Rooms repository', () => {
  it('returns an empty rooms object when no rooms created', async () => {
    expect(await repo.findAll()).toEqual([])
  })

  it('creates a new room from a name', async () => {
    expect(await repo.findAll()).toHaveLength(0)

    const creationResult = await repo.create('The Room Name')

    expect(creationResult.name).toEqual('The Room Name')
    expect(creationResult.slug).toEqual('the-room-name')
    expect(await creationResult.leader).toBeNull()
    expect(await repo.findAll()).toHaveLength(1)
  })

  it('refuses to create a room with the same name and throws an error', async () => {
    expect.assertions(3);
    expect(await repo.findAll()).toHaveLength(0)
    await repo.create('The Room Name')
    expect(await repo.findAll()).toHaveLength(1)

    try {
      await repo.create('The Room Name');
    } catch (e) {
      expect(e.message).toMatch('room-already-exists');
    }
  })

  it('returns an alphabetic order array of all rooms and one of them is the one created previously', async () => {
    await repo.create('The Room Name')
    await repo.create('Another room')

    expect(await repo.findAll()).toHaveLength(2)
    expect((await repo.findAll())[0].slug).toEqual('another-room')
    expect((await repo.findAll())[1].slug).toEqual('the-room-name')
    expect((await repo.findAll())[1].name).toEqual('The Room Name')
    expect(await (await repo.findAll())[1].leader).toBeNull()
  })

  it('returns a single room object', async () => {
    expect.assertions(4);
    expect(await repo.findBySlug('the-room-name')).toBeNull()

    try {
      await repo.findOrFailBySlug('the-room-name');
    } catch (e) {
      expect(e.message).toMatch('room-does-not-exist');
    }

    await repo.create('The Room Name')
    expect(await repo.findBySlug('the-room-name')).not.toBeNull()
    expect((await repo.findBySlug('the-room-name')).name).toBe('The Room Name')
  })

  it('adds player to the room', async () => {
    const room = await repo.create('The Room Name')
    let players = await room.players

    expect(players).toHaveLength(0)
    expect(await room.leader).toBeNull()

    const player = await playerRepo.create({
      socketID: 'abc123456',
      color: '#FFF123',
      nickName: 'Player 1'
    })

    const player2 = await playerRepo.create({
      socketID: 'abc78910',
      color: '#000123',
      nickName: 'A Player 2'
    })

    await repo.addPlayerToRoom(player, room)
    await repo.resetLeader(room)

    let refreshedRoom = await repo.findBySlug(room.slug)
    players = await room.players
    expect(players).toHaveLength(1)
    expect(players[0].nickName).toBe('Player 1')
    expect((await refreshedRoom.leader).id).toStrictEqual(player.id)

    await repo.addPlayerToRoom(player2, room)

    refreshedRoom = await repo.findBySlug(room.slug)
    players = await refreshedRoom.players
    expect(players).toHaveLength(2)
    expect(players[0].nickName).toBe('Player 1')
    expect(players[1].nickName).toBe('A Player 2')
    expect((await refreshedRoom.leader).id).toStrictEqual(player.id)
  })

  it('removes player from the room', async () => {
    let room = await repo.create('The Room Name')

    const player = await playerRepo.create({
      socketID: 'abc123456',
      color: '#FFF123',
      nickName: 'Player 1'
    })

    const player2 = await playerRepo.create({
      socketID: 'abc78910',
      color: '#000123',
      nickName: 'A Player 2'
    })

    await repo.addPlayerToRoom(player, room)
    await repo.addPlayerToRoom(player2, room)

    room = await repo.findBySlug(room.slug)
    expect(await room.players).toHaveLength(2)

    await repo.removePlayerFromRoom(player, room)
    room = await repo.findBySlug(room.slug)
    expect(await room.players).toHaveLength(1)
    expect((await room.players)[0].nickName).toBe('A Player 2')
  })
})

