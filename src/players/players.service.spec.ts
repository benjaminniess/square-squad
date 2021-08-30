import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';

describe('PlayersService', () => {
  let service: PlayersService;
  const validPlayer = {
    id: '123456abc',
    nickName: 'tester 1',
    color: '#00FF00',
  };

  const validPlayer2 = {
    id: '78910def',
    nickName: 'tester 2',
    color: '#FF0000',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayersService],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should show an empty players list from the findAll method', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('should show a players list with a size of 1 from the findAll method after creating a new player', () => {
    service.create(validPlayer);
    expect(service.findAll()).toHaveLength(1);
  });

  it('should retrive a freshliy creater player from the findById method', () => {
    service.create(validPlayer);
    expect(service.findById('123456abc')).not.toBeNull();
  });

  it('should show a players list with a size of 2 from the findAll method after creating 2 players in a row', () => {
    service.create(validPlayer);
    service.create(validPlayer2);

    expect(service.findAll()).toHaveLength(2);
  });

  it('should throw an error while trying to create a player with an existing ID', () => {
    service.create(validPlayer);
    try {
      service.create(validPlayer);
    } catch (exception) {
      expect(exception.message).toBe('player-already-exists');
    }
  });

  it('should delete a players from its ID', () => {
    service.create(validPlayer);
    service.create(validPlayer2);
    service.deleteFromId(validPlayer.id);
    expect(service.findAll()).toHaveLength(1);
    expect(service.findAll()[0].id).toBe(validPlayer2.id);
  });

  it('should throw an error while trying to delete an inexisting player', () => {
    try {
      service.deleteFromId(validPlayer.id);
    } catch (exception) {
      expect(exception.message).toBe('player-does-not-exist');
    }
  });
});
