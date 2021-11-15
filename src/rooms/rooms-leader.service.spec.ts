import { bootstrapTests, testingSamples } from '../tests/bootstrap';

let boot;

beforeEach(async () => {
  boot = await bootstrapTests();
});

afterEach(async () => {
  await boot.clear();
});

describe('RoomsPlayerAssociationService', () => {
  it('should be defined', () => {
    expect(boot.roomsLeadersService).toBeDefined();
  });

  it('returns null when a room does not exist', async () => {
    expect(
      await boot.roomsLeadersService.getLeaderForRoom(
        testingSamples.validRoom.slug,
      ),
    ).toBeUndefined();
  });

  it('returns null when a room has no leader yet', async () => {
    await boot.roomsService.create(testingSamples.validRoom.slug);

    expect(
      await boot.roomsLeadersService.getLeaderForRoom(
        testingSamples.validRoom.slug,
      ),
    ).toBeUndefined();
  });

  it('adds a leader to a room', async () => {
    const playerId = await boot.playersService.create(
      testingSamples.validPlayer,
    );
    await boot.roomsService.create(testingSamples.validRoom.slug);
    await boot.roomsService.addPlayerToRoom(
      playerId,
      testingSamples.validRoom.slug,
    );

    expect(
      await boot.roomsLeadersService.getLeaderForRoom(
        testingSamples.validRoom.slug,
      ),
    ).toBeUndefined();

    await boot.roomsLeadersService.setLeaderForRoom(
      playerId,
      testingSamples.validRoom.slug,
    );

    const leader = await boot.roomsLeadersService.getLeaderForRoom(
      testingSamples.validRoom.slug,
    );

    expect(leader.socketId).toBe(testingSamples.validPlayer.socketId);
    expect(leader.nickName).toBe(testingSamples.validPlayer.nickName);
  });

  it('automatically set the new player as leader when no leader is defined', async () => {
    const playerId = await boot.playersService.create(
      testingSamples.validPlayer,
    );
    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.addPlayerToRoom(
      playerId,
      testingSamples.validRoom.slug,
    );

    await boot.websocketAdapterRoomService.maybeResetLeader(
      testingSamples.validRoom.slug,
    );

    const leader = await boot.roomsLeadersService.getLeaderForRoom(
      testingSamples.validRoom.slug,
    );

    expect(leader.socketId).toBe(testingSamples.validPlayer.socketId);
    expect(leader.nickName).toBe(testingSamples.validPlayer.nickName);
  });

  it('automatically set another player as leader when the leader leaves the room', async () => {
    const playerId = await boot.playersService.create(
      testingSamples.validPlayer,
    );
    const playerId2 = await boot.playersService.create(
      testingSamples.validPlayer2,
    );
    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.addPlayerToRoom(
      playerId,
      testingSamples.validRoom.slug,
    );
    await boot.roomsLeadersService.setLeaderForRoom(
      playerId,
      testingSamples.validRoom.slug,
    );
    await boot.roomsService.addPlayerToRoom(
      playerId2,
      testingSamples.validRoom.slug,
    );
    await boot.roomsService.removePlayerFromRoom(
      playerId,
      testingSamples.validRoom.slug,
    );

    await boot.websocketAdapterRoomService.maybeResetLeader(
      testingSamples.validRoom.slug,
    );

    const leader = await boot.roomsLeadersService.getLeaderForRoom(
      testingSamples.validRoom.slug,
    );

    expect(leader.socketId).toBe(testingSamples.validPlayer2.socketId);
    expect(leader.nickName).toBe(testingSamples.validPlayer2.nickName);
  });

  it('removes a leader from a room', async () => {
    const playerId = await boot.playersService.create(
      testingSamples.validPlayer,
    );
    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.addPlayerToRoom(
      playerId,
      testingSamples.validRoom.slug,
    );
    await boot.roomsLeadersService.setLeaderForRoom(
      playerId,
      testingSamples.validRoom.slug,
    );

    await boot.roomsLeadersService.removeLeaderFromRoom(
      testingSamples.validRoom.slug,
    );

    expect(
      await boot.roomsLeadersService.getLeaderForRoom(
        testingSamples.validRoom.slug,
      ),
    ).toBe(undefined);
  });

  it('checks if a player is leader of a room', async () => {
    const playerId = await boot.playersService.create(
      testingSamples.validPlayer,
    );
    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.addPlayerToRoom(
      playerId,
      testingSamples.validRoom.slug,
    );
    await boot.roomsLeadersService.setLeaderForRoom(
      playerId,
      testingSamples.validRoom.slug,
    );
    await boot.playersService.create(testingSamples.validPlayer2);

    expect(
      await boot.roomsLeadersService.isPlayerLeaderOfRoom(
        testingSamples.validPlayer,
        testingSamples.validRoom.slug,
      ),
    ).toBe(true);
    expect(
      await boot.roomsLeadersService.isPlayerLeaderOfRoom(
        testingSamples.validPlayer2,
        testingSamples.validRoom.slug,
      ),
    ).toBe(false);
  });
});
