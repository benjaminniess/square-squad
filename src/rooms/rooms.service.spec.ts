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

describe('RoomsService', () => {
  let service: RoomsService;
  let repository: Repository<Room>;
  const connectionName = 'test';

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
        Helpers,
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
      entities: [Room],
      synchronize: true,
      logging: false,
      name: connectionName,
    });

    repository = getRepository(Room, connectionName);
    service = new RoomsService(repository, new Helpers());

    return connection;
  });

  afterEach(async () => {
    await getConnection(connectionName).close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should show an empty rooms list from the findAll method', async () => {
    expect(await service.findAll()).toEqual([]);
  });

  it('should show a rooms list with a size of 1 from the findAll method after creating a new room', async () => {
    await service.create(validRoom.name);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('should retrive a freshliy creater room from the findBySlug method', async () => {
    await service.create(validRoom.name);

    const room = await service.findBySlug(validRoom.slug);
    expect(room.slug).toBe(validRoom.slug);
  });

  it('should show a rooms list with a size of 2 from the findAll method after creating 2 rooms in a row', async () => {
    await service.create(validRoom.name);
    await service.create(validRoom2.name);

    expect(await service.findAll()).toHaveLength(2);
  });

  it('should throw an error while trying to create a room with an existing slug', async () => {
    await service.create(validRoom.name);
    try {
      await service.create(validRoom.name);
    } catch (exception) {
      expect(exception.message).toBe('room-already-exists');
    }
  });

  it('should delete a room from its slug', async () => {
    await service.create(validRoom.name);
    await service.deleteFromSlug(validRoom.slug);
    expect(await service.findAll()).toStrictEqual([]);
  });

  it('should throw an error while trying to delete an inexisting room', async () => {
    expect.assertions(1);
    try {
      await service.deleteFromSlug(validRoom.slug);
    } catch (exception) {
      expect(exception.message).toBe('room-does-not-exist');
    }
  });
});
