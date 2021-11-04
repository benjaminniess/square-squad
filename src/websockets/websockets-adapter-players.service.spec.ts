import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from '../rooms/rooms.service';
import { PlayersService } from '../players/players.service';
import { WebsocketsAdapterPlayersService } from './websockets-adapter-players.service';
import { Helpers } from '../helpers/helpers';
import { createConnection, getConnection } from 'typeorm';
import { Room } from '../rooms/room.entity';
import { Player } from '../players/player.entity';
import { WebsocketsAdapterRoomsService } from './websockets-adapter-rooms.service';
import { RoomsLeadersService } from '../rooms/rooms-leaders.service';
import { TypeOrmModule } from '@nestjs/typeorm';

let service: WebsocketsAdapterPlayersService;
let playersService: PlayersService;

const validPlayer = {
  socketId: '123456abc',
  nickName: 'tester 1',
  color: '#00FF00',
};

const connectionName = 'test';

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forFeature([Player, Room]),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [Player, Room],
        synchronize: true,
        keepConnectionAlive: true,
      }),
    ],
    providers: [
      RoomsService,
      PlayersService,
      WebsocketsAdapterRoomsService,
      WebsocketsAdapterPlayersService,
      RoomsLeadersService,
      Helpers,
    ],
  }).compile();

  const connection = await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [Room, Player],
    synchronize: true,
    logging: false,
    name: connectionName,
  });

  playersService = module.get<PlayersService>(PlayersService);

  service = module.get<WebsocketsAdapterPlayersService>(
    WebsocketsAdapterPlayersService,
  );

  return connection;
});

afterEach(async () => {
  await getConnection(connectionName).close();
});

describe('WebsocketsAdapterService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(playersService).toBeDefined();
  });
});

describe('Socket login/loggout', () => {
  it('remove the user when socket connection is lost', async () => {
    await service.updatePlayer(validPlayer.socketId, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    await service.deletePlayer(validPlayer.socketId);

    expect(await playersService.findAll()).toHaveLength(0);
  });
});

describe('Player add and update', () => {
  it('should refuse to add a player with not name', async () => {
    const playerAdd = await service.updatePlayer(validPlayer.socketId, {
      name: '',
      color: validPlayer.color,
    });

    expect(playerAdd).toStrictEqual({
      error: 'empty-name-or-color',
      success: false,
    });
    expect(await playersService.findAll()).toHaveLength(0);
  });

  it('should refuse to add a player with no color', async () => {
    const playerAdd = await service.updatePlayer(validPlayer.socketId, {
      name: validPlayer.nickName,
      color: '',
    });

    expect(playerAdd).toStrictEqual({
      error: 'empty-name-or-color',
      success: false,
    });
    expect(await playersService.findAll()).toHaveLength(0);
  });

  it('should add a player in the players list', async () => {
    const playerAdd = await service.updatePlayer(validPlayer.socketId, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    expect(playerAdd).toStrictEqual({ success: true });
    expect(await playersService.findAll()).toHaveLength(1);
  });

  it('should update an existing player', async () => {
    await service.updatePlayer(validPlayer.socketId, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    const playerUpdate = await service.updatePlayer(validPlayer.socketId, {
      name: 'New name',
      color: '#000000',
    });

    expect(playerUpdate).toStrictEqual({ success: true });
    const players = await playersService.findAll();
    players.map((player) => {
      expect(player.nickName).toBe('New name');
      expect(player.color).toBe('#000000');
    });
  });
});
