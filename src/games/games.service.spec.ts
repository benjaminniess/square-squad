import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { GameInstance } from './game-instance.entity';
import { GamesService } from './games.service';

let service: GamesService;
let repository: Repository<GameInstance>;
const connectionName = 'test';

const validGameInstance = {
  game: 'panic-attack',
  status: 'waiting',
};

const validGameInstance2 = {
  game: 'panic-attack',
  status: 'waiting',
};

beforeEach(async () => {
  await Test.createTestingModule({
    providers: [
      GamesService,

      {
        provide: getRepositoryToken(GameInstance),
        useClass: Repository,
      },
    ],
  }).compile();

  const connection = await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [GameInstance],
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

  it('shows an empty game instances list from the findAll method', async () => {
    expect(await service.findAll()).toEqual([]);
  });

  it('shows a game instances list with a size of 1 from the findAll method after creating a new instance', async () => {
    await service.create(validGameInstance);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('retrives a freshliy creater game instance from the findBySlug method', async () => {
    const instanceId = await service.create(validGameInstance);

    const gameInstance = await service.findById(instanceId);
    expect(gameInstance.status).toStrictEqual(validGameInstance.status);
    expect(gameInstance.type).toStrictEqual(validGameInstance.game);
  });

  it('shows a game instances list with a size of 2 from the findAll method after creating 2 instances in a row', async () => {
    await service.create(validGameInstance);
    await service.create(validGameInstance2);

    expect(await service.findAll()).toHaveLength(2);
  });

  it('should delete a game instance from its id', async () => {
    const gameInstanceId = await service.create(validGameInstance);

    await service.deleteFromId(gameInstanceId);

    const allInstances = await service.findAll();
    expect(allInstances).toHaveLength(0);
  });

  it('should throw an error while trying to delete an inexisting instance', async () => {
    expect.assertions(1);
    try {
      await service.deleteFromId(1234);
    } catch (exception) {
      expect(exception.message).toBe('game-instance-does-not-exist');
    }
  });
});
