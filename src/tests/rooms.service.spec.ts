import { bootstrapTests, testingSamples } from './bootstrap';

let boot;

beforeEach(async () => {
  boot = await bootstrapTests();
});

afterEach(async () => {
  await boot.clear();
});

describe('Rooms crud', () => {
  it('should be defined', () => {
    expect(boot.roomsService).toBeDefined();
  });

  it('shows an empty rooms list from the findAll method', async () => {
    expect(await boot.roomsService.findAll()).toEqual([]);
  });

  it('shows a rooms list with a size of 1 from the findAll method after creating a new room', async () => {
    await boot.roomsService.create(testingSamples.validRoom.name);
    expect(await boot.roomsService.findAll()).toHaveLength(1);
  });

  it('retrives a freshliy creater room from the findBySlug method', async () => {
    await boot.roomsService.create(testingSamples.validRoom.name);

    const room = await boot.roomsService.findBySlug(
      testingSamples.validRoom.slug,
    );
    expect(room.slug).toBe(testingSamples.validRoom.slug);
  });

  it('shows a rooms list with a size of 2 from the findAll method after creating 2 rooms in a row', async () => {
    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.create(testingSamples.validRoom2.name);

    expect(await boot.roomsService.findAll()).toHaveLength(2);
  });

  it('throws an error while trying to create a room with an existing slug', async () => {
    await boot.roomsService.create(testingSamples.validRoom.name);
    try {
      await boot.roomsService.create(testingSamples.validRoom.name);
    } catch (exception) {
      expect(exception.message).toBe('room-already-exists');
    }
  });

  it('deletes a room from its slug', async () => {
    await boot.roomsService.create(testingSamples.validRoom.name);

    await boot.roomsService.deleteFromSlug(testingSamples.validRoom.slug);

    expect(await boot.roomsService.findAll()).toStrictEqual([]);
  });

  it('throws an error while trying to delete an inexisting room', async () => {
    expect.assertions(1);
    try {
      await boot.roomsService.deleteFromSlug(testingSamples.validRoom.slug);
    } catch (exception) {
      expect(exception.message).toBe('room-does-not-exist');
    }
  });
});

const createPlayerAndRoomAndAssociation = async () => {
  const roomSlug = await boot.roomsService.create(
    testingSamples.validRoom.name,
  );
  const playerId = await boot.playersService.create(testingSamples.validPlayer);

  await boot.roomsService.addPlayerToRoom(playerId, roomSlug);
  return { roomSlug, playerId };
};

describe('Rooms players relation', () => {
  it('returns the freshly added player', async () => {
    const roomSlug = await boot.roomsService.create(
      testingSamples.validRoom.name,
    );
    const playerId = await boot.playersService.create(
      testingSamples.validPlayer,
    );

    await boot.roomsService.addPlayerToRoom(playerId, roomSlug);

    const players = await boot.roomsService.findAllPlayersInRoom(
      testingSamples.validRoom.slug,
    );
    expect(players).toHaveLength(1);
    expect(players[0].socketId).toBe(testingSamples.validPlayer.socketId);
  });

  it('has a count of 2 players in the same room after adding 2 players', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();
    const playerId2 = await boot.playersService.create(
      testingSamples.validPlayer2,
    );

    await boot.roomsService.addPlayerToRoom(playerId2, playerAndRoom.roomSlug);

    expect(
      await boot.roomsService.findAllPlayersInRoom(
        testingSamples.validRoom.slug,
      ),
    ).toHaveLength(2);
  });

  it('avoids content duplication when trying to add a player who is already in the room', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();

    await boot.roomsService.addPlayerToRoom(
      playerAndRoom.playerId,
      playerAndRoom.roomSlug,
    );

    expect(
      await boot.roomsService.findAllPlayersInRoom(
        testingSamples.validRoom.slug,
      ),
    ).toHaveLength(1);
  });

  it('returns an empty players list after adding and removing a player from a room', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();

    await boot.roomsService.removePlayerFromRoom(
      playerAndRoom.playerId,
      testingSamples.validRoom.slug,
    );

    expect(
      await boot.roomsService.findAllPlayersInRoom(
        testingSamples.validRoom.slug,
      ),
    ).toStrictEqual([]);
  });

  it('returns an empty players list after adding and removing a player globally from all rooms', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();

    await boot.roomsService.removePlayerFromRooms(playerAndRoom.playerId);

    expect(
      await boot.roomsService.findAllPlayersInRoom(
        testingSamples.validRoom.slug,
      ),
    ).toStrictEqual([]);
  });

  it('removes both players from room', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();
    const playerId2 = await boot.playersService.create(
      testingSamples.validPlayer2,
    );
    await boot.roomsService.addPlayerToRoom(playerId2, playerAndRoom.roomSlug);

    await boot.roomsService.removeAllPlayersInRoom(
      testingSamples.validRoom.slug,
    );

    expect(
      await boot.roomsService.findAllPlayersInRoom(
        testingSamples.validRoom.slug,
      ),
    ).toStrictEqual([]);
  });

  it('says that the player is already in a room', async () => {
    const playerAndRoom = await createPlayerAndRoomAndAssociation();

    expect(
      await boot.roomsService.isPlayerInARoom(playerAndRoom.playerId),
    ).toBe(true);
  });

  it('says that the player is not in a room yet', async () => {
    const playerId = await boot.playersService.create(
      testingSamples.validPlayer,
    );

    expect(await boot.roomsService.isPlayerInARoom(playerId)).toBe(false);
  });
});
