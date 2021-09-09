import { Test, TestingModule } from '@nestjs/testing';
import { Helpers } from '../helpers/helpers';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;

  const validRoom = {
    name: 'Room 1',
    slug: 'room-1',
  };

  const validRoom2 = {
    name: 'Room 2',
    slug: 'room-2',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsService, Helpers],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should show an empty rooms list from the findAll method', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('should show a rooms list with a size of 1 from the findAll method after creating a new room', () => {
    service.create(validRoom.name);
    expect(service.findAll()).toHaveLength(1);
  });

  it('should retrive a freshliy creater room from the findBySlug method', () => {
    service.create(validRoom.name);
    expect(service.findBySlug(validRoom.slug)).not.toBeNull();
  });

  it('should show a rooms list with a size of 2 from the findAll method after creating 2 rooms in a row', () => {
    service.create(validRoom.name);
    service.create(validRoom2.name);

    expect(service.findAll()).toHaveLength(2);
  });

  it('should throw an error while trying to create a room with an existing slug', () => {
    service.create(validRoom.name);
    try {
      service.create(validRoom.name);
    } catch (exception) {
      expect(exception.message).toBe('room-already-exists');
    }
  });

  it('should delete a room from its slug', () => {
    service.create(validRoom.name);
    service.create(validRoom2.name);
    service.deleteFromSlug(validRoom.slug);
    expect(service.findAll()).toHaveLength(1);
    expect(service.findAll()[0].slug).toBe(validRoom2.slug);
  });

  it('should throw an error while trying to delete an inexisting room', () => {
    expect.assertions(1);
    try {
      service.deleteFromSlug(validRoom.slug);
    } catch (exception) {
      expect(exception.message).toBe('room-does-not-exist');
    }
  });
});
