import { Test } from '@nestjs/testing';
import { Room } from './room.entity';
import { RoomsService } from './rooms.service';
import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Helpers } from '../helpers/helpers';
import { Player } from '../players/player.entity';
import { PlayersService } from '../players/players.service';

let service: RoomsService;
let playersService: PlayersService;
let repository: Repository<Room>;
let playersRepository: Repository<Player>;

const connectionName = 'test';

const validPlayer = {
  socketId: '123456abc',
  nickName: 'tester 1',
  color: '#00FF00',
};

const validPlayer2 = {
  socketId: '78910def',
  nickName: 'tester 2',
  color: '#FF0000',
};

const validRoom = {
  name: 'Room 1',
  slug: 'room-1',
};

const validRoom2 = {
  name: 'Room 2',
  slug: 'room-2',
};

beforeEach(async () => {
  await Test.createTestingModule({
    providers: [
      RoomsService,
      PlayersService,
      Helpers,
      {
        provide: getRepositoryToken(Room),
        useClass: Repository,
      },
      {
        provide: getRepositoryToken(Player),
        useClass: Repository,
      },
    ],
  }).compile();

  const connection = await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [Room, Player],
    synchronize: true,
    logging: false,
    name: connectionName,
  });

  repository = getRepository(Room, connectionName);
  playersRepository = getRepository(Player, connectionName);
  service = new RoomsService(
    repository,
    new PlayersService(playersRepository),
    new Helpers(),
  );
  playersService = new PlayersService(playersRepository);

  return connection;
});

afterEach(async () => {
  await getConnection(connectionName).close();
});

describe('Rooms crud', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('shows an empty rooms list from the findAll method', async () => {
    expect(await service.findAll()).toEqual([]);
  });

  it('shows a rooms list with a size of 1 from the findAll method after creating a new room', async () => {
    await service.create(validRoom.name);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('retrives a freshliy creater room from the findBySlug method', async () => {
    await service.create(validRoom.name);

    const room = await service.findBySlug(validRoom.slug);
    expect(room.slug).toBe(validRoom.slug);
  });

  it('shows a rooms list with a size of 2 from the findAll method after creating 2 rooms in a row', async () => {
    await service.create(validRoom.name);
    await service.create(validRoom2.name);

    expect(await service.findAll()).toHaveLength(2);
  });

  it('throws an error while trying to create a room with an existing slug', async () => {
    await service.create(validRoom.name);
    try {
      await service.create(validRoom.name);
    } catch (exception) {
      expect(exception.message).toBe('room-already-exists');
    }
  });

  it('deletes a room from its slug', async () => {
    await service.create(validRoom.name);

    await service.deleteFromSlug(validRoom.slug);

    expect(await service.findAll()).toStrictEqual([]);
  });

  it('throws an error while trying to delete an inexisting room', async () => {
    expect.assertions(1);
    try {
      await service.deleteFromSlug(validRoom.slug);
    } catch (exception) {
      expect(exception.message).toBe('room-does-not-exist');
    }
  });
});

const createPlayerAndRoomAndAssociation = async () => {
  const roomSlug = await service.create(validRoom.name);
  const playerId = await playersService.create(validPlayer);

  await service.addPlayerToRoom(playerId, roomSlug);
  return { roomSlug, playerId };
};

describe('Rooms players relation', () => {
  it('returns the freshly added player', async () => {
    const roomSlug = await service.create(validRoom.name);
    const playerId = await playersService.create(validPlayer);

    await service.addPlayerToRoom(playerId, roomSlug);

    const players = await service.findAllPlayersInRoom(validRoom.slug);
    expect(players).toHaveLength(1);
    expect(players[0].socketId).toBe(validPlayer.socketId);
  });

  it('has a count of 2 players in the same room after adding 2 players', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();
    const playerId2 = await playersService.create(validPlayer2);

    await service.addPlayerToRoom(playerId2, playerAndRoom.roomSlug);

    expect(await service.findAllPlayersInRoom(validRoom.slug)).toHaveLength(2);
  });

  it('avoids content duplication when trying to add a player who is already in the room', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();

    await service.addPlayerToRoom(
      playerAndRoom.playerId,
      playerAndRoom.roomSlug,
    );

    expect(await service.findAllPlayersInRoom(validRoom.slug)).toHaveLength(1);
  });

  it('returns an empty players list after adding and removing a player from a room', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();

    await service.removePlayerFromRoom(playerAndRoom.playerId, validRoom.slug);

    expect(await service.findAllPlayersInRoom(validRoom.slug)).toStrictEqual(
      [],
    );
  });

  it('returns an empty players list after adding and removing a player globally from all rooms', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();

    await service.removePlayerFromRooms(playerAndRoom.playerId);

    expect(await service.findAllPlayersInRoom(validRoom.slug)).toStrictEqual(
      [],
    );
  });

  it('removes both players from room', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();
    const playerId2 = await playersService.create(validPlayer2);
    await service.addPlayerToRoom(playerId2, playerAndRoom.roomSlug);

    await service.removeAllPlayersInRoom(validRoom.slug);

    expect(await service.findAllPlayersInRoom(validRoom.slug)).toStrictEqual(
      [],
    );
  });

  it('says that the player is already in a room', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();

    expect(await service.isPlayerInARoom(playerAndRoom.playerId)).toBe(true);
  });

  it('says that the player is not in a room yet', async () => {
    const playerId = await playersService.create(validPlayer);

    expect(await service.isPlayerInARoom(playerId)).toBe(false);
  });
});
