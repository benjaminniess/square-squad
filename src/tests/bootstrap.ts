import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from '../rooms/rooms.service';
import { PlayersService } from '../players/players.service';
import { RoomsLeadersService } from '../rooms/rooms-leaders.service';
import { Helpers } from '../helpers/helpers';
import { createConnection } from 'typeorm';
import { Room } from '../rooms/room.entity';
import { Player } from '../players/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesService } from '../games/games.service';
import { GameInstance } from '../games/game-instance.entity';
import { WebsocketsAdapterRoomsService } from '../websockets/websockets-adapter-rooms.service';
import { WebsocketsAdapterPlayersService } from '../websockets/websockets-adapter-players.service';
import { WebsocketsAdapterGameService } from '../websockets/websockets-adapter-games.service';

let roomsService: RoomsService;
let playersService: PlayersService;
let gameService: GamesService;
let websocketsAdapterPlayersService: WebsocketsAdapterPlayersService;
let websocketAdapterRoomService: WebsocketsAdapterRoomsService;
let roomsLeadersService: RoomsLeadersService;
let websocketAdapterGames;

const bootstrapTests = async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forFeature([Player, Room, GameInstance]),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [Player, Room, GameInstance],
        synchronize: true,
        keepConnectionAlive: true,
      }),
    ],
    providers: [
      RoomsService,
      PlayersService,
      WebsocketsAdapterRoomsService,
      WebsocketsAdapterPlayersService,
      WebsocketsAdapterGameService,
      RoomsLeadersService,
      GamesService,
      Helpers,
    ],
  }).compile();

  const connection = await createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [Room, Player, GameInstance],
    synchronize: true,
    logging: false,
    name: 'testing',
  });

  roomsService = module.get<RoomsService>(RoomsService);
  playersService = module.get<PlayersService>(PlayersService);
  gameService = module.get<GamesService>(GamesService);
  websocketAdapterRoomService = module.get<WebsocketsAdapterRoomsService>(
    WebsocketsAdapterRoomsService,
  );
  websocketsAdapterPlayersService = module.get<WebsocketsAdapterPlayersService>(
    WebsocketsAdapterPlayersService,
  );
  websocketAdapterGames = module.get<WebsocketsAdapterGameService>(
    WebsocketsAdapterGameService,
  );
  roomsLeadersService = module.get<RoomsLeadersService>(RoomsLeadersService);

  return {
    connection,
    module,
    roomsService,
    playersService,
    gameService,
    websocketAdapterGames,
    websocketsAdapterPlayersService,
    websocketAdapterRoomService,
    roomsLeadersService,
    clear: async () => {
      await connection.close();
      playersService.clear();
      roomsService.clear();
      gameService.clear();
    },
  };
};

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

const validRoom = {
  name: 'Room 1',
  slug: 'room-1',
};

const validRoom2 = {
  name: 'Room 2',
  slug: 'room-2',
};

const validGameInstanceDto = {
  roomSlug: validRoom.slug,
  gameType: 'panic-attack',
};

const testingSamples = {
  validPlayer,
  validPlayer2,
  validRoom,
  validRoom2,
  validGameInstanceDto,
};

export { bootstrapTests, testingSamples };
