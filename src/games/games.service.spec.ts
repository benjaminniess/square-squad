import { bootstrapTests, testingSamples } from '../tests/bootstrap';

let boot, validGameInstance;

beforeEach(async () => {
  boot = await bootstrapTests();

  await boot.roomsService.create(testingSamples.validRoom.name);
  const room = await boot.roomsService.findBySlug(
    testingSamples.validRoom.slug,
  );
  validGameInstance = {
    game: 'panic-attack',
    status: 'waiting',
    room: room,
  };
});

afterEach(async () => {
  await boot.clear();
});

describe('GamesService', () => {
  it('should be defined', () => {
    expect(boot.gameService).toBeDefined();
  });

  it('shows an empty game instances list from the findAll method', async () => {
    expect(await boot.gameService.findAll()).toEqual([]);
  });

  it('shows a game instances list with a size of 1 from the findAll method after creating a new instance', async () => {
    await boot.gameService.create(validGameInstance);
    expect(await boot.gameService.findAll()).toHaveLength(1);
  });

  it('retrives a freshliy creater game instance from the findBySlug method', async () => {
    const instanceId = await boot.gameService.create(validGameInstance);

    const gameInstance = await boot.gameService.findById(instanceId);
    expect(gameInstance.status).toStrictEqual(validGameInstance.status);
    expect(gameInstance.type).toStrictEqual(validGameInstance.game);
  });

  it('should delete a game instance from its id', async () => {
    const gameInstanceId = await boot.gameService.create(validGameInstance);

    await boot.gameService.deleteFromId(gameInstanceId);

    const allInstances = await boot.gameService.findAll();
    expect(allInstances).toHaveLength(0);
  });

  it('should throw an error while trying to delete an inexisting instance', async () => {
    expect.assertions(1);
    try {
      await boot.gameService.deleteFromId(1234);
    } catch (exception) {
      expect(exception.message).toBe('game-instance-does-not-exist');
    }
  });
});
