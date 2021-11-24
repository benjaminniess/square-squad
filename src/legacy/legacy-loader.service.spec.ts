import { bootstrapTests, testingSamples } from '../tests/bootstrap';

let boot;

beforeEach(async () => {
  boot = await bootstrapTests();
});

afterEach(async () => {
  await boot.clear();
});

describe('LegacyLoaderService', () => {
  it('should be defined', () => {
    expect(boot.legacyLoaderService).toBeDefined();
  });
});

describe('Game initialisation', () => {
  it('should create a new game data bundle from an instance ', async () => {
    const player1Id = await boot.playersService.create(
      testingSamples.validPlayer,
    );
    await boot.playersService.create(testingSamples.validPlayer2);
    await boot.roomsService.create(testingSamples.validRoom.name);
    await boot.roomsService.addPlayerToRoom(
      player1Id,
      testingSamples.validRoom.slug,
    );

    const room = await boot.roomsService.findBySlug(
      testingSamples.validRoom.slug,
    );

    const gameData = boot.legacyLoaderService.create(3, room);
    const savedGameData = boot.legacyLoaderService.getDataForInstance(3);

    expect(gameData.instanceId).toBe(3);
    expect(savedGameData.instanceId).toBe(gameData.instanceId);
    expect(savedGameData.obstacleManager).not.toBeNull();
    expect(savedGameData.bonusManager).not.toBeNull();
    expect(savedGameData.playersManager).not.toBeNull();
  });
});
