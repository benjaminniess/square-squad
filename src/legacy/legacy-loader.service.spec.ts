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
  it('should create a new game data bundle from an instance ', () => {
    const gameData = boot.legacyLoaderService.create(3);
    const savedGameData = boot.legacyLoaderService.getDataForInstance(3);

    expect(gameData.instanceId).toBe(3);
    expect(savedGameData.instanceId).toBe(gameData.instanceId);
    expect(savedGameData.obstacleManager).not.toBeNull();
    expect(savedGameData.bonusManager).not.toBeNull();
    expect(savedGameData.playersManager).not.toBeNull();
  });
});
