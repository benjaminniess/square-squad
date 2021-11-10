import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Helpers } from '../helpers/helpers';
import { Player } from '../players/player.entity';
import { WebsocketsAdapterPlayersService } from '../websockets/websockets-adapter-players.service';
import { WebsocketsAdapterRoomsService } from '../websockets/websockets-adapter-rooms.service';
import { createConnection, getConnection } from 'typeorm';
import { PlayersService } from '../players/players.service';
import { Room } from './room.entity';
import { RoomsLeadersService } from './rooms-leaders.service';
import { RoomsService } from './rooms.service';

let roomsLeadersService: RoomsLeadersService;
let roomsService: RoomsService;
let playersService: PlayersService;
let websocketAdapterRoomService: WebsocketsAdapterRoomsService;

const connectionName = 'test-leaders';

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

  await connection.query('PRAGMA foreign_keys=OFF');
  await connection.synchronize();
  await connection.query('PRAGMA foreign_keys=ON');

  roomsService = module.get<RoomsService>(RoomsService);
  playersService = module.get<PlayersService>(PlayersService);

  roomsLeadersService = module.get<RoomsLeadersService>(RoomsLeadersService);

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

describe('RoomsPlayerAssociationService', () => {
  it('should be defined', () => {
    expect(roomsLeadersService).toBeDefined();
  });

  it('returns null when a room does not exist', async () => {
    expect(
      await roomsLeadersService.getLeaderForRoom(validRoom.slug),
    ).toBeUndefined();
  });

  it('returns null when a room has no leader yet', async () => {
    await roomsService.create(validRoom.slug);

    expect(
      await roomsLeadersService.getLeaderForRoom(validRoom.slug),
    ).toBeUndefined();
  });

  it('adds a leader to a room', async () => {
    const playerId = await playersService.create(validPlayer);
    await roomsService.create(validRoom.slug);
    await roomsService.addPlayerToRoom(playerId, validRoom.slug);

    expect(
      await roomsLeadersService.getLeaderForRoom(validRoom.slug),
    ).toBeUndefined();

    await roomsLeadersService.setLeaderForRoom(playerId, validRoom.slug);

    const leader = await roomsLeadersService.getLeaderForRoom(validRoom.slug);

    expect(leader.socketId).toBe(validPlayer.socketId);
    expect(leader.nickName).toBe(validPlayer.nickName);
  });

  it('automatically set the new player as leader when no leader is defined', async () => {
    const playerId = await playersService.create(validPlayer);
    await roomsService.create(validRoom.name);
    await roomsService.addPlayerToRoom(playerId, validRoom.slug);

    await websocketAdapterRoomService.maybeResetLeader(validRoom.slug);

    const leader = await roomsLeadersService.getLeaderForRoom(validRoom.slug);

    expect(leader.socketId).toBe(validPlayer.socketId);
    expect(leader.nickName).toBe(validPlayer.nickName);
  });

  it('automatically set another player as leader when the leader leaves the room', async () => {
    const playerId = await playersService.create(validPlayer);
    const playerId2 = await playersService.create(validPlayer2);
    await roomsService.create(validRoom.name);
    await roomsService.addPlayerToRoom(playerId, validRoom.slug);
    await roomsLeadersService.setLeaderForRoom(playerId, validRoom.slug);
    await roomsService.addPlayerToRoom(playerId2, validRoom.slug);
    await roomsService.removePlayerFromRoom(playerId, validRoom.slug);

    await websocketAdapterRoomService.maybeResetLeader(validRoom.slug);

    const leader = await roomsLeadersService.getLeaderForRoom(validRoom.slug);

    expect(leader.socketId).toBe(validPlayer2.socketId);
    expect(leader.nickName).toBe(validPlayer2.nickName);
  });

  it('removes a leader from a room', async () => {
    const playerId = await playersService.create(validPlayer);
    await roomsService.create(validRoom.name);
    await roomsService.addPlayerToRoom(playerId, validRoom.slug);
    await roomsLeadersService.setLeaderForRoom(playerId, validRoom.slug);

    await roomsLeadersService.removeLeaderFromRoom(validRoom.slug);

    expect(await roomsLeadersService.getLeaderForRoom(validRoom.slug)).toBe(
      undefined,
    );
  });

  it('checks if a player is leader of a room', async () => {
    const playerId = await playersService.create(validPlayer);
    await roomsService.create(validRoom.name);
    await roomsService.addPlayerToRoom(playerId, validRoom.slug);
    await roomsLeadersService.setLeaderForRoom(playerId, validRoom.slug);
    await playersService.create(validPlayer2);

    expect(
      await roomsLeadersService.isPlayerLeaderOfRoom(
        validPlayer,
        validRoom.slug,
      ),
    ).toBe(true);
    expect(
      await roomsLeadersService.isPlayerLeaderOfRoom(
        validPlayer2,
        validRoom.slug,
      ),
    ).toBe(false);
  });
});
