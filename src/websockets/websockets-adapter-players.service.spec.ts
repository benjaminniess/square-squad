import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from '../rooms/rooms.service';
import { PlayersService } from '../players/players.service';
import { WebsocketsAdapterPlayersService } from './websockets-adapter-players.service';
import { Helpers } from '../helpers/helpers';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { Room } from '../rooms/room.entity';
import { Player } from '../players/player.entity';

let service: WebsocketsAdapterPlayersService;
let roomsService: RoomsService;
let playersService: PlayersService;
let repository: Repository<Room>;
let playersRepo: Repository<Player>;

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

const connectionName = 'test';

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      RoomsService,
      PlayersService,
      WebsocketsAdapterPlayersService,
      Helpers,
      {
        provide: getRepositoryToken(Room),
        useClass: Repository,
      },
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
    entities: [Room, Player],
    synchronize: true,
    logging: false,
    name: connectionName,
  });

  repository = getRepository(Room, connectionName);
  playersRepo = getRepository(Player, connectionName);
  roomsService = new RoomsService(
    repository,
    new PlayersService(playersRepo),
    new Helpers(),
  );
  playersService = new PlayersService(playersRepo);

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

// describe('Socket login/loggout', () => {
//   it('remove the user when socket connection is lost', async () => {
//     await service.updatePlayer(validPlayer.socketId, {
//       name: validPlayer.nickName,
//       color: validPlayer.color,
//     });

//     // await service.deletePlayer(validPlayer.socketId);

//     // expect(playersService.findAll()).toHaveLength(0);
//   });
// });

// describe('Player add and update', () => {
//   it('should refuse to add a player with not name', () => {
//     const playerAdd = service.updatePlayer(validPlayer.id, {
//       name: '',
//       color: validPlayer.color,
//     });

//     expect(playerAdd).toStrictEqual({
//       error: 'empty-name-or-color',
//       success: false,
//     });
//     expect(playersService.findAll()).toHaveLength(0);
//   });

//   it('should refuse to add a player with no color', () => {
//     const playerAdd = service.updatePlayer(validPlayer.id, {
//       name: validPlayer.nickName,
//       color: '',
//     });

//     expect(playerAdd).toStrictEqual({
//       error: 'empty-name-or-color',
//       success: false,
//     });
//     expect(playersService.findAll()).toHaveLength(0);
//   });

//   it('should add a player in the players list', () => {
//     const playerAdd = service.updatePlayer(validPlayer.id, {
//       name: validPlayer.nickName,
//       color: validPlayer.color,
//     });

//     expect(playerAdd).toStrictEqual({ success: true });
//     expect(playersService.findAll()).toHaveLength(1);
//   });

//   it('should update an existing player', () => {
//     service.updatePlayer(validPlayer.id, {
//       name: validPlayer.nickName,
//       color: validPlayer.color,
//     });

//     const playerUpdate = service.updatePlayer(validPlayer.id, {
//       name: 'New name',
//       color: '#000000',
//     });

//     expect(playerUpdate).toStrictEqual({ success: true });
//     expect(playersService.findAll()[0].nickName).toBe('New name');
//     expect(playersService.findAll()[0].color).toBe('#000000');
//   });
//});
