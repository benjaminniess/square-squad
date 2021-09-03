import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from '../rooms/rooms.service';
import { PlayersService } from '../players/players.service';
import { WebsocketsAdapterService } from './websockets-adapter.service';
import { RoomsPlayersAssociationService } from '../rooms/rooms-players-association.service';
import { HelpersModule } from '../helpers/helpers.module';

let service: WebsocketsAdapterService;
let playersService: PlayersService;
let roomsService: RoomsService;
let roomsPlayersAssociationService: RoomsPlayersAssociationService;

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

const validRoom = {
  id: 'room1234',
  name: 'Room 1',
  slug: 'room-1',
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [HelpersModule],
    providers: [
      WebsocketsAdapterService,
      PlayersService,
      RoomsService,
      RoomsPlayersAssociationService,
    ],
  }).compile();

  service = module.get<WebsocketsAdapterService>(WebsocketsAdapterService);
  playersService = module.get<PlayersService>(PlayersService);
  roomsService = module.get<RoomsService>(RoomsService);
  roomsPlayersAssociationService = module.get<RoomsPlayersAssociationService>(
    RoomsPlayersAssociationService,
  );
});

describe('WebsocketsAdapterService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(playersService).toBeDefined();
  });
});

describe('Socket login/loggout', () => {
  it('should remove the user when socket connection is lost', () => {
    service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });
    service.deletePlayer(validPlayer.id);

    expect(playersService.findAll()).toHaveLength(0);
  });
});

describe('Player add and update', () => {
  it('should refuse to add a player with not name', () => {
    const playerAdd = service.updatePlayer(validPlayer.id, {
      name: '',
      color: validPlayer.color,
    });

    expect(playerAdd).toStrictEqual({
      error: 'Empty name or color',
      success: false,
    });
    expect(playersService.findAll()).toHaveLength(0);
  });

  it('should refuse to add a player with no color', () => {
    const playerAdd = service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: '',
    });

    expect(playerAdd).toStrictEqual({
      error: 'Empty name or color',
      success: false,
    });
    expect(playersService.findAll()).toHaveLength(0);
  });

  it('should add a player in the players list', () => {
    const playerAdd = service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    expect(playerAdd).toStrictEqual({ success: true });
    expect(playersService.findAll()).toHaveLength(1);
  });

  it('should update an existing player', () => {
    service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    const playerUpdate = service.updatePlayer(validPlayer.id, {
      name: 'New name',
      color: '#000000',
    });

    expect(playerUpdate).toStrictEqual({ success: true });
    expect(playersService.findAll()[0].nickName).toBe('New name');
    expect(playersService.findAll()[0].color).toBe('#000000');
  });
});

describe('Rooms add and update', () => {
  it('should refuse to add a room with a wrong player socket ID', () => {
    const roomAdd = service.createRoom('fakeID123', validRoom.name);

    expect(roomAdd).toStrictEqual({
      error: 'Wrong player ID',
      success: false,
    });
  });

  it('should refuse to add a room with player ID already in a room', () => {
    service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });
    roomsService.create(validRoom.name);
    roomsPlayersAssociationService.addPlayerToRoom(validPlayer, validRoom.id);

    const roomAdd = service.createRoom(validPlayer.id, validRoom.name);

    expect(roomAdd).toStrictEqual({
      error: 'Player already in a room',
      success: false,
    });
  });

  it('should refuse to add a room with an empty name', () => {
    service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    const roomAdd = service.createRoom(validPlayer.id, '');

    expect(roomAdd).toStrictEqual({
      error: 'room-name-empty',
      success: false,
    });
  });

  it('should create a room when a correct room name is provided', () => {
    service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    const roomAdd = service.createRoom(validPlayer.id, validRoom.name);

    expect(roomAdd).toStrictEqual({
      success: true,
      data: { roomSlug: validRoom.slug },
    });
  });

  it('should refuse to create a room when a slug already exists', () => {
    service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });
    service.createRoom(validPlayer.id, validRoom.name);

    service.updatePlayer(validPlayer2.id, {
      name: validPlayer2.nickName,
      color: validPlayer2.color,
    });
    const roomAdd = service.createRoom(validPlayer2.id, validRoom.name);

    expect(roomAdd).toStrictEqual({
      error: 'room-already-exists',
      success: false,
    });
  });
});
