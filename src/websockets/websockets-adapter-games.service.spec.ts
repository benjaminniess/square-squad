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
import { GamesService } from '../games/games.service';
import { WebsocketsAdapterGameService } from './websockets-adapter-games.service';
import { GameInstance } from '../games/game-instance.entity';

let roomsService: RoomsService;
let playersService: PlayersService;
let gameService: GamesService;
let websocketAdapterGames;

const connectionName = 'test-games-service';

const validPlayer2 = {
  socketId: '78910def',
  nickName: 'tester 2',
  color: '#FF0000',
};

const validRoom = {
  name: 'Room 1',
  slug: 'room-1',
};

const validGameInstanceDto = {
  roomSlug: validRoom.slug,
  gameType: 'panic-attack',
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forFeature([Player, Room, GameInstance]),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [Player, Room, GameInstance],
        synchronize: true,
        keepConnectionAlive: true,
      }),
    ],
    providers: [
      RoomsService,
      PlayersService,
      WebsocketsAdapterRoomsService,
      WebsocketsAdapterPlayersService,
      WebsocketsAdapterGameService,
      RoomsLeadersService,
      GamesService,
      Helpers,
    ],
  }).compile();

  const connection = await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [Room, Player, GameInstance],
    synchronize: true,
    logging: false,
    name: connectionName,
  });

  roomsService = module.get<RoomsService>(RoomsService);
  playersService = module.get<PlayersService>(PlayersService);
  gameService = module.get<GamesService>(GamesService);
  websocketAdapterGames = module.get<WebsocketsAdapterGameService>(
    WebsocketsAdapterGameService,
  );

  return connection;
});

afterEach(async () => {
  await getConnection(connectionName).close();
  playersService.clear();
  roomsService.clear();
  gameService.clear();
});

describe('WebsocketsAdapterGamesService', () => {
  it('should be defined', () => {
    expect(playersService).toBeDefined();
  });
});

describe('Game creation', () => {
  it('should refuse to create a game without roomSlug param', async () => {
    const gameInstance = await websocketAdapterGames.startGame();

    expect(gameInstance.success).toBe(false);
    expect(gameInstance.error).toBe('missing-room-slug');
  });

  it('should refuse to create a game without roomType param', async () => {
    const gameInstance = await websocketAdapterGames.startGame({
      roomSlug: validRoom.slug,
    });

    expect(gameInstance.success).toBe(false);
    expect(gameInstance.error).toBe('missing-game-type');
  });

  it('should refuse to create a new game instance with a non existing room slug', async () => {
    const gameInstanceCreation = await websocketAdapterGames.startGame(
      validGameInstanceDto,
    );

    expect(gameInstanceCreation.success).toBe(false);
    expect(gameInstanceCreation.error).toBe('wrong-room-slug');
  });

  it('should create a new game instance and save it', async () => {
    await roomsService.create(validRoom.name);

    const gameInstanceCreation = await websocketAdapterGames.startGame(
      validGameInstanceDto,
    );

    expect(gameInstanceCreation.success).toBe(true);

    const gameInstances = await gameService.findAll();
    expect(gameInstances).toHaveLength(1);
    expect(gameInstances[0].id).toBe(gameInstanceCreation.data.gameInstanceId);
  });
});
