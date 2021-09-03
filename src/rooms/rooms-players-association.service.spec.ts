import { Test, TestingModule } from '@nestjs/testing';
import { RoomsPlayersAssociationService } from './rooms-players-association.service';

describe('RoomsPlayerAssociationService', () => {
  let service: RoomsPlayersAssociationService;

  const validRoom = {
    id: '123abc',
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
      providers: [RoomsPlayersAssociationService],
    }).compile();

    service = module.get<RoomsPlayersAssociationService>(
      RoomsPlayersAssociationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should returns an empty players list from an existing empty room', () => {
    expect(service.findAllPlayersInRoom(validRoom.id)).toStrictEqual([]);
  });

  it('should returns the freshly added player', () => {
    service.addPlayerToRoom(validPlayer, validRoom.id);
    expect(service.findAllPlayersInRoom(validRoom.id)).toStrictEqual([
      validPlayer,
    ]);
  });

  it('should have a count of 2 players in the same room after adding 2 players', () => {
    service.addPlayerToRoom(validPlayer, validRoom.id);
    service.addPlayerToRoom(validPlayer2, validRoom.id);
    expect(service.findAllPlayersInRoom(validRoom.id)).toHaveLength(2);
  });

  it('should throw an error when trying to add a player who is already in the room', () => {
    expect.assertions(1);
    service.addPlayerToRoom(validPlayer, validRoom.id);
    try {
      service.addPlayerToRoom(validPlayer, validRoom.id);
    } catch (exception) {
      expect(exception.message).toBe('player-already-in-room');
    }
  });

  it('should returns an empty players list after adding and removing a player from a room', () => {
    service.addPlayerToRoom(validPlayer, validRoom.id);
    service.removePlayerFromRoom(validPlayer.id, validRoom.id);
    expect(service.findAllPlayersInRoom(validRoom.id)).toStrictEqual([]);
  });

  it('should remove both players from room', () => {
    service.addPlayerToRoom(validPlayer, validRoom.id);
    service.addPlayerToRoom(validPlayer2, validRoom.id);
    service.removeAllPlayersInRoom(validRoom.id);
    expect(service.findAllPlayersInRoom(validRoom.id)).toStrictEqual([]);
  });

  it('should say that the player is already in a room', () => {
    service.addPlayerToRoom(validPlayer, validRoom.id);
    expect(service.isPlayerInARoom(validPlayer.id)).toBe(true);
  });

  it('should say that the player is not in a room yet', () => {
    expect(service.isPlayerInARoom(validPlayer.id)).toBe(false);
  });
});
