import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { find } from 'rxjs';
import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { Player } from './player.entity';
import { PlayersService } from './players.service';

describe('PlayersService', () => {
  let service: PlayersService;
  let repository: Repository<Player>;
  const connectionName = 'test';

  const validPlayer = {
    socketId: '123456abc',
    nickName: 'tester 1',
    color: '#00FF00',
  };

  const validPlayer2 = {
    socketId: '78910def',
    nickName: 'tester 2',
    color: '#FF0000',
  };

  beforeEach(async () => {
    await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getRepositoryToken(Player),
          useClass: Repository,
        },
      ],
    }).compile();

    const connection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Player],
      synchronize: true,
      logging: false,
      name: connectionName,
    });

    repository = getRepository(Player, connectionName);
    service = new PlayersService(repository);

    return connection;
  });

  afterEach(async () => {
    await getConnection(connectionName).close();
  });

  it('should show an empty players list from the findAll method', async () => {
    expect(await service.findAll()).toEqual([]);
  });

  it('should show a players list with a size of 1 from the findAll method after creating a new player', async () => {
    await service.create(validPlayer);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('should retrive a freshliy creater player from the findBySocketId method', async () => {
    await service.create(validPlayer);

    const player = await service.findBySocketId(validPlayer.socketId);

    expect(player).toBeInstanceOf(Player);
    expect(player.socketId).toBe(validPlayer.socketId);
  });

  it('should show a players list with a size of 2 from the findAll method after creating 2 players in a row', async () => {
    await service.create(validPlayer);
    await service.create(validPlayer2);

    expect(await service.findAll()).toHaveLength(2);
  });

  it('should throw an error while trying to create a player with an existing ID', async () => {
    expect.assertions(1);
    await service.create(validPlayer);
    try {
      await service.create(validPlayer);
    } catch (exception) {
      expect(exception.message).toBe('player-already-exists');
    }
  });

  it('should update an existing player name', async () => {
    await service.create(validPlayer);
    await service.update(validPlayer.socketId, {
      ...validPlayer,
      nickName: 'Updated nickname',
    });

    const player = await service.findBySocketId(validPlayer.socketId);

    expect(player.nickName).toBe('Updated nickname');
  });

  it('should throw an error while trying to update a player that is not registered', async () => {
    expect.assertions(1);

    try {
      await service.update(validPlayer.socketId, validPlayer);
    } catch (exception) {
      expect(exception.message).toBe('player-does-not-exist');
    }
  });

  it('should delete a players from its ID', async () => {
    await service.create(validPlayer);
    await service.create(validPlayer2);
    await service.deleteFromId(validPlayer.socketId);

    const allPlayers = await service.findAll();
    expect(allPlayers).toHaveLength(1);
    expect(allPlayers[0].socketId).toBe(validPlayer2.socketId);
  });

  it('should throw an error while trying to delete an inexisting player', async () => {
    expect.assertions(1);
    try {
      await service.deleteFromId(validPlayer.socketId);
    } catch (exception) {
      expect(exception.message).toBe('player-does-not-exist');
    }
  });
});
