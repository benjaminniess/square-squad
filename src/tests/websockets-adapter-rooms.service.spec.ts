import { bootstrapTests, testingSamples } from './bootstrap';

let boot;

beforeEach(async () => {
  boot = await bootstrapTests();
});

afterEach(async () => {
  await boot.clear();
});

describe('WebsocketsAdapterRoomsService', () => {
  it('should be defined', () => {
    expect(boot.websocketAdapterRoomService).toBeDefined();
    expect(boot.playersService).toBeDefined();
  });
});

describe('Rooms add and update', () => {
  it('should refuse to add a room with a wrong player socket ID', async () => {
    const roomAdd = await boot.websocketAdapterRoomService.createRoom(
      'fakeID123',
      testingSamples.validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'wrong-player-id',
      success: false,
    });
  });

  it('should refuse to add a room with player ID already in a room', async () => {
    const playerId = await boot.playersService.create(
      testingSamples.validPlayer,
    );

    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.addPlayerToRoom(
      playerId,
      testingSamples.validRoom.slug,
    );

    const roomAdd = await boot.websocketAdapterRoomService.createRoom(
      testingSamples.validPlayer.socketId,
      testingSamples.validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'player-already-in-a-room',
      success: false,
    });
  });

  it('should refuse to add a room with an empty name', async () => {
    await boot.playersService.create(testingSamples.validPlayer);

    const roomAdd = await boot.websocketAdapterRoomService.createRoom(
      testingSamples.validPlayer.socketId,
      '',
    );

    expect(roomAdd).toStrictEqual({
      error: 'room-name-empty',
      success: false,
    });
  });

  it('should create a room when a correct room name is provided', async () => {
    await boot.playersService.create(testingSamples.validPlayer);

    const roomAdd = await boot.websocketAdapterRoomService.createRoom(
      testingSamples.validPlayer.socketId,
      testingSamples.validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      success: true,
      data: { roomSlug: testingSamples.validRoom.slug },
    });
  });

  it('should refuse to create a room when a slug already exists', async () => {
    const player1Id = await boot.playersService.create(
      testingSamples.validPlayer,
    );
    await boot.playersService.create(testingSamples.validPlayer2);
    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.addPlayerToRoom(
      player1Id,
      testingSamples.validRoom.slug,
    );

    const roomAdd = await boot.websocketAdapterRoomService.createRoom(
      testingSamples.validPlayer2.socketId,
      testingSamples.validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'room-already-exists',
      success: false,
    });
  });
});

describe('Rooms join', () => {
  it('should refuse to join a room with a wrong player socket ID', async () => {
    const roomJoin = await boot.websocketAdapterRoomService.joinRoom(
      'fakeID123',
      testingSamples.validRoom.name,
    );

    expect(roomJoin).toStrictEqual({
      error: 'wrong-player-id',
      success: false,
    });
  });

  it('should refuse to join a room with player ID already in a room', async () => {
    const playerId = await boot.playersService.create(
      testingSamples.validPlayer,
    );
    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.addPlayerToRoom(
      playerId,
      testingSamples.validRoom.slug,
    );

    const roomAdd = await boot.websocketAdapterRoomService.createRoom(
      testingSamples.validPlayer.socketId,
      testingSamples.validRoom.name,
    );

    expect(roomAdd).toStrictEqual({
      error: 'player-already-in-a-room',
      success: false,
    });
  });

  it('should refuse to join a room with a wrong slug', async () => {
    await boot.playersService.create(testingSamples.validPlayer);

    const roomAdd = await boot.websocketAdapterRoomService.joinRoom(
      testingSamples.validPlayer.socketId,
      'fake-slug',
    );

    expect(roomAdd).toStrictEqual({
      error: 'wrong-room-slug',
      success: false,
    });
  });

  it('should join a room when a correct room name is provided', async () => {
    await boot.playersService.create(testingSamples.validPlayer);
    await boot.roomsService.create(testingSamples.validRoom.name);

    const roomAdd = await boot.websocketAdapterRoomService.joinRoom(
      testingSamples.validPlayer.socketId,
      testingSamples.validRoom.slug,
    );

    expect(roomAdd).toStrictEqual({
      success: true,
      data: {
        roomName: testingSamples.validRoom.name,
        roomSlug: testingSamples.validRoom.slug,
      },
    });
  });
});

describe('Rooms refresh', () => {
  it('should send an empty rooms list while there is no room', async () => {
    const roomsList = await boot.websocketAdapterRoomService.findAllRooms();

    expect(roomsList).toStrictEqual({ success: true, data: [] });
  });

  it('should send an rooms list with a freshly created room', async () => {
    await boot.playersService.create(testingSamples.validPlayer);
    await boot.roomsService.create(testingSamples.validRoom.name);

    const roomsList = await boot.websocketAdapterRoomService.findAllRooms();

    expect(roomsList.success).toBe(true);
    expect(roomsList.data).toHaveLength(1);
    roomsList.data.map((room) => {
      expect(room.slug).toStrictEqual(testingSamples.validRoom.slug);
      expect(room.name).toStrictEqual(testingSamples.validRoom.name);
      expect(room.players).toBeUndefined();
    });
  });
});

describe('Rooms players', () => {
  it('send the room players list', async () => {
    const player1Id = await boot.playersService.create(
      testingSamples.validPlayer,
    );
    const player2Id = await boot.playersService.create(
      testingSamples.validPlayer2,
    );
    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.addPlayerToRoom(
      player1Id,
      testingSamples.validRoom.slug,
    );
    await boot.roomsService.addPlayerToRoom(
      player2Id,
      testingSamples.validRoom.slug,
    );

    const players = await boot.websocketAdapterRoomService.getRoomPlayers(
      testingSamples.validRoom.slug,
    );
    expect(players).toHaveLength(2);
    expect(players[0].nickName).toBe(testingSamples.validPlayer.nickName);
    expect(players[1].nickName).toBe(testingSamples.validPlayer2.nickName);
    expect(players[0].id).toBe(testingSamples.validPlayer.socketId);
    expect(players[1].id).toBe(testingSamples.validPlayer2.socketId);
  });
});

describe('Clean empty rooms', () => {
  it('removes empty rooms', async () => {
    await boot.roomsService.create(testingSamples.validRoom.name);
    expect(await boot.roomsService.findAll()).toHaveLength(1);

    const removeEmptyRooms = await boot.websocketAdapterRoomService.removeEmptyRooms();

    expect(removeEmptyRooms.success).toBe(true);
    expect(removeEmptyRooms.data.deleted).toBe(1);
    expect(await boot.roomsService.findAll()).toHaveLength(0);
  });
});
