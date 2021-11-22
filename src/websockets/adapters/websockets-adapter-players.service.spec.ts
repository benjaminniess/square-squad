import { bootstrapTests, testingSamples } from '../../tests/bootstrap';

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

describe('WebsocketsAdapterService', () => {
  it('should be defined', () => {
    expect(boot.websocketsAdapterPlayersService).toBeDefined();
    expect(boot.playersService).toBeDefined();
  });
});

describe('Socket login/loggout', () => {
  it('remove the user when socket connection is lost', async () => {
    await boot.websocketsAdapterPlayersService.updatePlayer(
      testingSamples.validPlayer.socketId,
      {
        name: testingSamples.validPlayer.nickName,
        color: testingSamples.validPlayer.color,
      },
    );

    await boot.websocketsAdapterPlayersService.deletePlayer(
      testingSamples.validPlayer.socketId,
    );

    expect(await boot.playersService.findAll()).toHaveLength(0);
  });
});

describe('Player add and update', () => {
  it('should refuse to add a player with not name', async () => {
    const playerAdd = await boot.websocketsAdapterPlayersService.updatePlayer(
      testingSamples.validPlayer.socketId,
      {
        name: '',
        color: testingSamples.validPlayer.color,
      },
    );

    expect(playerAdd).toStrictEqual({
      error: 'empty-name-or-color',
      success: false,
    });
    expect(await boot.playersService.findAll()).toHaveLength(0);
  });

  it('should refuse to add a player with no color', async () => {
    const playerAdd = await boot.websocketsAdapterPlayersService.updatePlayer(
      testingSamples.validPlayer.socketId,
      {
        name: testingSamples.validPlayer.nickName,
        color: '',
      },
    );

    expect(playerAdd).toStrictEqual({
      error: 'empty-name-or-color',
      success: false,
    });
    expect(await boot.playersService.findAll()).toHaveLength(0);
  });

  it('should add a player in the players list', async () => {
    const playerAdd = await boot.websocketsAdapterPlayersService.updatePlayer(
      testingSamples.validPlayer.socketId,
      {
        name: testingSamples.validPlayer.nickName,
        color: testingSamples.validPlayer.color,
      },
    );

    expect(playerAdd).toStrictEqual({ success: true });
    expect(await boot.playersService.findAll()).toHaveLength(1);
  });

  it('should update an existing player', async () => {
    await boot.websocketsAdapterPlayersService.updatePlayer(
      testingSamples.validPlayer.socketId,
      {
        name: testingSamples.validPlayer.nickName,
        color: testingSamples.validPlayer.color,
      },
    );

    const playerUpdate = await boot.websocketsAdapterPlayersService.updatePlayer(
      testingSamples.validPlayer.socketId,
      {
        name: 'New name',
        color: '#000000',
      },
    );

    expect(playerUpdate).toStrictEqual({ success: true });
    const players = await boot.playersService.findAll();
    players.map((player) => {
      expect(player.nickName).toBe('New name');
      expect(player.color).toBe('#000000');
    });
  });
});
