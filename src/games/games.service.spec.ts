import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from '../rooms/room.entity';
import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { GameInstance } from './game-instance.entity';
import { GamesService } from './games.service';
import { Player } from '../players/player.entity';

let service: GamesService;
let repository: Repository<GameInstance>;
const connectionName = 'test';

const validGameInstance = {
  game: 'panic-attack',
  status: 'waiting',
  roomSlug: 'room-1',
};

const validGameInstance2 = {
  game: 'panic-attack',
  status: 'waiting',
  room: 
};

beforeEach(async () => {
  await Test.createTestingModule({
    providers: [
      GamesService,
      {
        provide: getRepositoryToken(GameInstance),
        useClass: Repository,
      },
      {
        provide: getRepositoryToken(Room),
        useClass: Repository,
      },
    ],
  }).compile();

  const connection = await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [GameInstance, Room, Player],
    synchronize: true,
    logging: false,
    name: connectionName,
  });

  repository = getRepository(GameInstance, connectionName);
  service = new GamesService(repository);

  return connection;
});

afterEach(async () => {
  await getConnection(connectionName).close();
});

describe('GamesService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should show an empty game instances list from the findAll method', async () => {
    expect(await service.findAll()).toEqual([]);
  });

  it('should show a game instances list with a size of 1 from the findAll method after creating a new instance', async () => {
    // TODO: Mock room entity creation
    await service.create(validGameInstance);
    expect(await service.findAll()).toHaveLength(1);
  });

  // it('should retrive a freshliy creater game instance from the findBySlug method', async () => {
  //   await service.create(validGameInstance);
  //   expect(await service.findBySlug(validGameInstance.roomSlug)).toStrictEqual(
  //     validGameInstance,
  //   );
  // });

  // it('should throw an error while trying to add 2 game instance in a single room', async () => {
  //   expect.assertions(1);

  //   await service.create(validGameInstance);

  //   try {
  //     await service.create(validGameInstance);
  //   } catch (exception) {
  //     expect(exception.message).toBe('instance-already-exists');
  //   }
  // });

  // it('should show a game instances list with a size of 2 from the findAll method after creating 2 instances in a row', async () => {
  //   await service.create(validGameInstance);
  //   await service.create(validGameInstance2);

  //   expect(await service.findAll()).toHaveLength(2);
  // });

  // it('should delete a game instance from its room slug', async () => {
  //   await service.create(validGameInstance);
  //   await service.create(validGameInstance2);
  //   await service.deleteFromSlug(validGameInstance.roomSlug);
  //   expect(await service.findAll()).toHaveLength(1);
  //   expect(await service.findAll()[0].roomSlug).toBe(validGameInstance2.roomSlug);
  // });

  // it('should throw an error while trying to delete an inexisting instance', async () => {
  //   expect.assertions(1);
  //   try {
  //     await service.deleteFromSlug(validGameInstance.roomSlug);
  //   } catch (exception) {
  //     expect(exception.message).toBe('instance-does-not-exist');
  //   }
  // });
});
