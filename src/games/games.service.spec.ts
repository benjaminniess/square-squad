import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';

describe('GamesService', () => {
  let service: GamesService;

  const validGameInstance = {
    game: 'panic-attack',
    status: 'waiting',
    roomSlug: 'room-1',
  };

  const validGameInstance2 = {
    game: 'panic-attack',
    status: 'waiting',
    roomSlug: 'room-2',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamesService],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should show an empty game instances list from the findAll method', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('should show a game instances list with a size of 1 from the findAll method after creating a new instance', () => {
    service.create(validGameInstance);
    expect(service.findAll()).toHaveLength(1);
  });

  it('should retrive a freshliy creater game instance from the findBySlug method', () => {
    service.create(validGameInstance);
    expect(service.findBySlug(validGameInstance.roomSlug)).toStrictEqual(
      validGameInstance,
    );
  });

  it('should throw an error while trying to add 2 game instance in a single room', () => {
    expect.assertions(1);

    service.create(validGameInstance);

    try {
      service.create(validGameInstance);
    } catch (exception) {
      expect(exception.message).toBe('instance-already-exists');
    }
  });

  it('should show a game instances list with a size of 2 from the findAll method after creating 2 instances in a row', () => {
    service.create(validGameInstance);
    service.create(validGameInstance2);

    expect(service.findAll()).toHaveLength(2);
  });

  it('should delete a game instance from its room slug', () => {
    service.create(validGameInstance);
    service.create(validGameInstance2);
    service.deleteFromSlug(validGameInstance.roomSlug);
    expect(service.findAll()).toHaveLength(1);
    expect(service.findAll()[0].roomSlug).toBe(validGameInstance2.roomSlug);
  });

  it('should throw an error while trying to delete an inexisting instance', () => {
    expect.assertions(1);
    try {
      service.deleteFromSlug(validGameInstance.roomSlug);
    } catch (exception) {
      expect(exception.message).toBe('instance-does-not-exist');
    }
  });
});
