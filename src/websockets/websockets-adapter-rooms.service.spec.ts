import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from '../rooms/rooms.service';
import { PlayersService } from '../players/players.service';
import { WebsocketsAdapterRoomsService } from './websockets-adapter-rooms.service';
import { RoomsPlayersAssociationService } from '../rooms/rooms-players-association.service';
import { HelpersModule } from '../helpers/helpers.module';
import { WebsocketsAdapterPlayersService } from './websockets-adapter-players.service';
import { RoomsLeadersService } from '../rooms/rooms-leaders.service';

let websocketAdapterRoomService: WebsocketsAdapterRoomsService;
let websocketAdapterPlayersService: WebsocketsAdapterPlayersService;
let playersService: PlayersService;
let roomsService: RoomsService;
let roomsPlayersAssociationService: RoomsPlayersAssociationService;
let roomsLeadersService: RoomsLeadersService;

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
  name: 'Room 1',
  slug: 'room-1',
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [HelpersModule],
    providers: [
      WebsocketsAdapterRoomsService,
      WebsocketsAdapterPlayersService,
      PlayersService,
      RoomsService,
      RoomsPlayersAssociationService,
      RoomsLeadersService,
    ],
  }).compile();

  websocketAdapterRoomService = module.get<WebsocketsAdapterRoomsService>(
    WebsocketsAdapterRoomsService,
  );
  websocketAdapterPlayersService = module.get<WebsocketsAdapterPlayersService>(
    WebsocketsAdapterPlayersService,
  );
  playersService = module.get<PlayersService>(PlayersService);
  roomsService = module.get<RoomsService>(RoomsService);
  roomsPlayersAssociationService = module.get<RoomsPlayersAssociationService>(
    RoomsPlayersAssociationService,
  );
  roomsLeadersService = module.get<RoomsLeadersService>(RoomsLeadersService);
});

describe('WebsocketsAdapterRoomsService', () => {
  it('should be defined', () => {
    expect(websocketAdapterRoomService).toBeDefined();
    expect(playersService).toBeDefined();
  });
});

describe('Rooms add and update', () => {
  it('should refuse to add a room with a wrong player socket ID', () => {
    const roomAdd = websocketAdapterRoomService.createRoom(
      'fakeID123',
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'wrong-player-id',
      success: false,
    });
  });

  it('should refuse to add a room with player ID already in a room', () => {
    websocketAdapterPlayersService.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });
    roomsService.create(validRoom.name);
    roomsPlayersAssociationService.addPlayerToRoom(validPlayer, validRoom.slug);

    const roomAdd = websocketAdapterRoomService.createRoom(
      validPlayer.id,
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'player-already-in-a-room',
      success: false,
    });
  });

  it('should refuse to add a room with an empty name', () => {
    websocketAdapterPlayersService.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    const roomAdd = websocketAdapterRoomService.createRoom(validPlayer.id, '');

    expect(roomAdd).toStrictEqual({
      error: 'room-name-empty',
      success: false,
    });
  });

  it('should create a room when a correct room name is provided', () => {
    websocketAdapterPlayersService.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    const roomAdd = websocketAdapterRoomService.createRoom(
      validPlayer.id,
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      success: true,
      data: { roomSlug: validRoom.slug },
    });
  });

  it('should refuse to create a room when a slug already exists', () => {
    websocketAdapterPlayersService.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });
    websocketAdapterRoomService.createRoom(validPlayer.id, validRoom.name);

    websocketAdapterPlayersService.updatePlayer(validPlayer2.id, {
      name: validPlayer2.nickName,
      color: validPlayer2.color,
    });
    const roomAdd = websocketAdapterRoomService.createRoom(
      validPlayer2.id,
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'room-already-exists',
      success: false,
    });
  });
});

describe('Rooms join', () => {
  it('should refuse to join a room with a wrong player socket ID', () => {
    const roomJoin = websocketAdapterRoomService.joinRoom(
      'fakeID123',
      validRoom.name,
    );

    expect(roomJoin).toStrictEqual({
      error: 'wrong-player-id',
      success: false,
    });
  });

  it('should refuse to join a room with player ID already in a room', () => {
    websocketAdapterPlayersService.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });
    roomsService.create(validRoom.name);
    roomsPlayersAssociationService.addPlayerToRoom(validPlayer, validRoom.slug);

    const roomAdd = websocketAdapterRoomService.createRoom(
      validPlayer.id,
      validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'player-already-in-a-room',
      success: false,
    });
  });

  it('should refuse to join a room with a wrong slug', () => {
    websocketAdapterPlayersService.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    const roomAdd = websocketAdapterRoomService.joinRoom(
      validPlayer.id,
      'fake-slug',
    );

    expect(roomAdd).toStrictEqual({
      error: 'wrong-room-slug',
      success: false,
    });
  });

  it('should join a room when a correct room name is provided', () => {
    websocketAdapterPlayersService.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });
    websocketAdapterRoomService.createRoom(validPlayer.id, validRoom.name);

    const roomAdd = websocketAdapterRoomService.joinRoom(
      validPlayer.id,
      validRoom.slug,
    );

    expect(roomAdd).toStrictEqual({
      success: true,
      data: {
        roomName: 'Room 1',
        roomSlug: 'room-1',
      },
    });
  });

  it('automatically set the new player as leader when no leader is defined', () => {
    playersService.create(validPlayer);
    roomsService.create(validRoom.slug);
    roomsPlayersAssociationService.addPlayerToRoom(validPlayer, validRoom.slug);

    websocketAdapterRoomService.maybeResetLeader(validRoom.slug);

    expect(roomsLeadersService.getLeaderForRoom(validRoom.slug)).toStrictEqual(
      validPlayer,
    );
  });
});

describe('Rooms refresh', () => {
  it('should send an empty rooms list while there is no room', () => {
    const roomsList = websocketAdapterRoomService.findAllRooms();

    expect(roomsList).toStrictEqual({ success: true, data: [] });
  });

  it('should send an rooms list with a freshly created room', () => {
    websocketAdapterPlayersService.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });
    websocketAdapterRoomService.createRoom(validPlayer.id, validRoom.name);
    const roomsList = websocketAdapterRoomService.findAllRooms();

    expect(roomsList).toStrictEqual({ success: true, data: [validRoom] });
  });
});

describe('Rooms players', () => {
  it('send the room players list', () => {
    playersService.create(validPlayer);
    playersService.create(validPlayer2);

    roomsService.create(validRoom.slug);

    roomsPlayersAssociationService.addPlayerToRoom(validPlayer, validRoom.slug);
    roomsPlayersAssociationService.addPlayerToRoom(
      validPlayer2,
      validRoom.slug,
    );

    roomsLeadersService.setLeaderForRoom(validPlayer, validRoom.slug);

    expect(
      websocketAdapterRoomService.getRoomPlayers(validRoom.slug),
    ).toStrictEqual([validPlayer, validPlayer2]);
  });
});
