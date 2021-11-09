import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from '../rooms/rooms.service';
import { PlayersService } from '../players/players.service';
import { WebsocketsAdapterRoomsService } from './websockets-adapter-rooms.service';
import { WebsocketsAdapterPlayersService } from './websockets-adapter-players.service';
import { RoomsLeadersService } from '../rooms/rooms-leaders.service';
import { Helpers } from '../helpers/helpers';
import { createConnection, getConnection } from 'typeorm';
import { Room } from '../rooms/room.entity';
import { Player } from '../players/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

let websocketAdapterRoomService: WebsocketsAdapterRoomsService;
let roomsService: RoomsService;
let playersService: PlayersService;

const connectionName = 'test-rooms-service';

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

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forFeature([Player, Room]),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [Player, Room],
        synchronize: true,
        keepConnectionAlive: true,
      }),
    ],
    providers: [
      RoomsService,
      PlayersService,
      WebsocketsAdapterRoomsService,
      WebsocketsAdapterPlayersService,
      RoomsLeadersService,
      Helpers,
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

  roomsService = module.get<RoomsService>(RoomsService);
  playersService = module.get<PlayersService>(PlayersService);

  websocketAdapterRoomService = module.get<WebsocketsAdapterRoomsService>(
    WebsocketsAdapterRoomsService,
  );

  return connection;
});

afterEach(async () => {
  await getConnection(connectionName).close();
  playersService.clear();
  roomsService.clear();
});

describe('WebsocketsAdapterRoomsService', () => {
  it('should be defined', () => {
    expect(websocketAdapterRoomService).toBeDefined();
    expect(playersService).toBeDefined();
  });
});

describe('Rooms add and update', () => {
  it('should refuse to add a room with a wrong player socket ID', async () => {
    const roomAdd = await websocketAdapterRoomService.createRoom(
      'fakeID123',
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'wrong-player-id',
      success: false,
    });
  });

  it('should refuse to add a room with player ID already in a room', async () => {
    const playerId = await playersService.create(validPlayer);

    await roomsService.create(validRoom.name);
    await roomsService.addPlayerToRoom(playerId, validRoom.slug);

    const roomAdd = await websocketAdapterRoomService.createRoom(
      validPlayer.socketId,
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'player-already-in-a-room',
      success: false,
    });
  });

  it('should refuse to add a room with an empty name', async () => {
    await playersService.create(validPlayer);

    const roomAdd = await websocketAdapterRoomService.createRoom(
      validPlayer.socketId,
      '',
    );

    expect(roomAdd).toStrictEqual({
      error: 'room-name-empty',
      success: false,
    });
  });

  it('should create a room when a correct room name is provided', async () => {
    await playersService.create(validPlayer);

    const roomAdd = await websocketAdapterRoomService.createRoom(
      validPlayer.socketId,
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      success: true,
      data: { roomSlug: validRoom.slug },
    });
  });

  it('should refuse to create a room when a slug already exists', async () => {
    const player1Id = await playersService.create(validPlayer);
    await playersService.create(validPlayer2);
    await roomsService.create(validRoom.name);
    await roomsService.addPlayerToRoom(player1Id, validRoom.slug);

    const roomAdd = await websocketAdapterRoomService.createRoom(
      validPlayer2.socketId,
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'room-already-exists',
      success: false,
    });
  });
});

describe('Rooms join', () => {
  it('should refuse to join a room with a wrong player socket ID', async () => {
    const roomJoin = await websocketAdapterRoomService.joinRoom(
      'fakeID123',
      validRoom.name,
    );

    expect(roomJoin).toStrictEqual({
      error: 'wrong-player-id',
      success: false,
    });
  });

  it('should refuse to join a room with player ID already in a room', async () => {
    const playerId = await playersService.create(validPlayer);
    await roomsService.create(validRoom.name);
    await roomsService.addPlayerToRoom(playerId, validRoom.slug);

    const roomAdd = await websocketAdapterRoomService.createRoom(
      validPlayer.socketId,
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'player-already-in-a-room',
      success: false,
    });
  });

  it('should refuse to join a room with a wrong slug', async () => {
    await playersService.create(validPlayer);

    const roomAdd = await websocketAdapterRoomService.joinRoom(
      validPlayer.socketId,
      'fake-slug',
    );

    expect(roomAdd).toStrictEqual({
      error: 'wrong-room-slug',
      success: false,
    });
  });

  it('should join a room when a correct room name is provided', async () => {
    await playersService.create(validPlayer);
    await roomsService.create(validRoom.name);

    const roomAdd = await websocketAdapterRoomService.joinRoom(
      validPlayer.socketId,
      validRoom.slug,
    );

    expect(roomAdd).toStrictEqual({
      success: true,
      data: {
        roomName: validRoom.name,
        roomSlug: validRoom.slug,
      },
    });
  });
});

describe('Rooms refresh', () => {
  it('should send an empty rooms list while there is no room', async () => {
    const roomsList = await websocketAdapterRoomService.findAllRooms();

    expect(roomsList).toStrictEqual({ success: true, data: [] });
  });

  it('should send an rooms list with a freshly created room', async () => {
    await playersService.create(validPlayer);
    await roomsService.create(validRoom.name);

    const roomsList = await websocketAdapterRoomService.findAllRooms();

    expect(roomsList.success).toBe(true);
    expect(roomsList.data).toHaveLength(1);
    roomsList.data.map((room) => {
      expect(room.players).toBeDefined();
      expect(room.players).toHaveLength(0);
    });
  });
});

describe('Rooms players', () => {
  it('send the room players list', async () => {
    const player1Id = await playersService.create(validPlayer);
    const player2Id = await playersService.create(validPlayer2);
    await roomsService.create(validRoom.name);
    await roomsService.addPlayerToRoom(player1Id, validRoom.slug);
    await roomsService.addPlayerToRoom(player2Id, validRoom.slug);

    const players = await websocketAdapterRoomService.getRoomPlayers(
      validRoom.slug,
    );
    expect(players).toHaveLength(2);
    expect(players[0].nickName).toBe(validPlayer.nickName);
    expect(players[1].nickName).toBe(validPlayer2.nickName);
    expect(players[0].socketId).toBe(validPlayer.socketId);
    expect(players[1].socketId).toBe(validPlayer2.socketId);
  });
});

describe('Clean empty rooms', () => {
  it('removes empty rooms', async () => {
    await roomsService.create(validRoom.name);
    expect(await roomsService.findAll()).toHaveLength(1);

    const removeEmptyRooms = await websocketAdapterRoomService.removeEmptyRooms();

    expect(removeEmptyRooms.success).toBe(true);
    expect(removeEmptyRooms.data.deleted).toBe(1);
    expect(await roomsService.findAll()).toHaveLength(0);
  });
});
