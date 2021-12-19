import { bootstrapTests, testingSamples } from './bootstrap';

let boot;

beforeEach(async () => {
  boot = await bootstrapTests();
});

afterEach(async () => {
  await boot.clear();
});

describe('WebsocketsAdapterGamesService', () => {
  it('should be defined', () => {
    expect(boot.playersService).toBeDefined();
  });
});

describe('Game creation', () => {
  it('should refuse to create a game without roomSlug param', async () => {
    const gameInstance = await boot.websocketAdapterGames.startGame();

    expect(gameInstance.success).toBe(false);
    expect(gameInstance.error).toBe('missing-room-slug');
  });

  it('should refuse to create a game without roomType param', async () => {
    const gameInstance = await boot.websocketAdapterGames.startGame({
      roomSlug: testingSamples.validRoom.slug,
    });

    expect(gameInstance.success).toBe(false);
    expect(gameInstance.error).toBe('missing-game-type');
  });

  it('should refuse to create a new game instance with a non existing room slug', async () => {
    const gameInstanceCreation = await boot.websocketAdapterGames.startGame(
      testingSamples.validGameInstanceDto,
    );

    expect(gameInstanceCreation.success).toBe(false);
    expect(gameInstanceCreation.error).toBe('wrong-room-slug');
  });

  it('should create a new game instance and save it', async () => {
    await boot.roomsService.create(testingSamples.validRoom.name);

    const gameInstanceCreation = await boot.websocketAdapterGames.startGame(
      testingSamples.validGameInstanceDto,
    );

    expect(gameInstanceCreation.success).toBe(true);

    const gameInstances = await boot.gameService.findAll();
    expect(gameInstances).toHaveLength(1);
    expect(gameInstances[0].id).toBe(gameInstanceCreation.data.gameInstanceId);
  });

  it('should update a game instance status', async () => {
    await boot.roomsService.create(testingSamples.validRoom.name);
    const gameInstanceId = await boot.gameService.create({
      game: testingSamples.validGameInstanceDto.gameType,
      status: 'waiting',
      room: testingSamples.validRoom.slug,
    });

    await boot.websocketAdapterGames.setStatus(gameInstanceId, 'playing');

    const game = await boot.gameService.findById(gameInstanceId);
    expect(game.status).toBe('playing');
  });
});
