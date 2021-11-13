import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../rooms/room.entity';
import { createConnection, getConnection, Repository } from 'typeorm';
import { GameInstance } from './game-instance.entity';
import { GamesService } from './games.service';
import { Player } from '../players/player.entity';
import { RoomsService } from '../rooms/rooms.service';
import { GameInstanceDto } from './game-instance.dto.interface';
import { PlayersService } from '../players/players.service';
import { Helpers } from '../helpers/helpers';

let gameService: GamesService;
let roomsService: RoomsService;
const connectionName = 'test-game-service';

let validGameInstance: GameInstanceDto;

const validRoom = {
  name: 'Room 1',
  slug: 'room-1',
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
    providers: [RoomsService, PlayersService, GamesService, Helpers],
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
  gameService = module.get<GamesService>(GamesService);

  await roomsService.create(validRoom.name);
  const room = await roomsService.findBySlug(validRoom.slug);
  validGameInstance = {
    game: 'panic-attack',
    status: 'waiting',
    room: room,
  };

  return connection;
});

afterEach(async () => {
  await getConnection(connectionName).close();
  roomsService.clear();
  gameService.clear();
});

describe('GamesService', () => {
  it('should be defined', () => {
    expect(gameService).toBeDefined();
  });

  it('shows an empty game instances list from the findAll method', async () => {
    expect(await gameService.findAll()).toEqual([]);
  });

  it('shows a game instances list with a size of 1 from the findAll method after creating a new instance', async () => {
    await gameService.create(validGameInstance);
    expect(await gameService.findAll()).toHaveLength(1);
  });

  it('retrives a freshliy creater game instance from the findBySlug method', async () => {
    const instanceId = await gameService.create(validGameInstance);

    const gameInstance = await gameService.findById(instanceId);
    expect(gameInstance.status).toStrictEqual(validGameInstance.status);
    expect(gameInstance.type).toStrictEqual(validGameInstance.game);
  });

  it('should delete a game instance from its id', async () => {
    const gameInstanceId = await gameService.create(validGameInstance);

    await gameService.deleteFromId(gameInstanceId);

    const allInstances = await gameService.findAll();
    expect(allInstances).toHaveLength(0);
  });

  it('should throw an error while trying to delete an inexisting instance', async () => {
    expect.assertions(1);
    try {
      await gameService.deleteFromId(1234);
    } catch (exception) {
      expect(exception.message).toBe('game-instance-does-not-exist');
    }
  });
});
