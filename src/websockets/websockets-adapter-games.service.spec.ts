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

let roomsService: RoomsService;
let playersService: PlayersService;

const connectionName = 'test-games-service';

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

  return connection;
});

afterEach(async () => {
  await getConnection(connectionName).close();
  playersService.clear();
  roomsService.clear();
});

describe('WebsocketsAdapterGamesService', () => {
  it('should be defined', () => {
    expect(playersService).toBeDefined();
  });
});
