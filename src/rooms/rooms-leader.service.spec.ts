import { Test, TestingModule } from '@nestjs/testing';
import { HelpersModule } from '../helpers/helpers.module';
import { RoomsLeadersService } from './rooms-leaders.service';

describe('RoomsPlayerAssociationService', () => {
  let service: RoomsLeadersService;

  const validRoom = {
    name: 'Room 1',
    slug: 'room-1',
  };

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
      imports: [HelpersModule],
      providers: [RoomsLeadersService],
    }).compile();

    service = module.get<RoomsLeadersService>(RoomsLeadersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns null when a room has no leader yet', () => {
    expect(service.getLeaderForRoom(validRoom.slug)).toBe(null);
  });

  it('adds a leader to a room', () => {
    service.setLeaderForRoom(validPlayer, validRoom.slug);

    expect(service.getLeaderForRoom(validRoom.slug)).toStrictEqual(validPlayer);
  });

  it('removes a leader from a room', () => {
    service.setLeaderForRoom(validPlayer, validRoom.slug);
    service.removeLeaderFromRoom(validRoom.slug);

    expect(service.getLeaderForRoom(validRoom.slug)).toBe(null);
  });

  it('checks if a player is leader of a room', () => {
    service.setLeaderForRoom(validPlayer, validRoom.slug);

    expect(service.isPlayerLeaderOfRoom(validPlayer, validRoom.slug)).toBe(
      true,
    );
    expect(service.isPlayerLeaderOfRoom(validPlayer2, validRoom.slug)).toBe(
      false,
    );
  });
});
