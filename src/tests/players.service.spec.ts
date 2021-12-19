import { bootstrapTests, testingSamples } from './bootstrap';
import { Player} from "../entities/player.entity";

let boot;

beforeEach(async () => {
  boot = await bootstrapTests();
});

afterEach(async () => {
  await boot.clear();
});

describe('PlayersService', () => {
  it('should show an empty players list from the findAll method', async () => {
    expect(await boot.playersService.findAll()).toEqual([]);
  });

  it('should show a players list with a size of 1 from the findAll method after creating a new player', async () => {
    await boot.playersService.create(testingSamples.validPlayer);
    expect(await boot.playersService.findAll()).toHaveLength(1);
  });

  it('should retrive a freshliy creater player from the findBySocketId method', async () => {
    await boot.playersService.create(testingSamples.validPlayer);

    const player = await boot.playersService.findBySocketId(
      testingSamples.validPlayer.socketId,
    );

    expect(player).toBeInstanceOf(Player);
    expect(player.socketId).toBe(testingSamples.validPlayer.socketId);
  });

  it('should show a players list with a size of 2 from the findAll method after creating 2 players in a row', async () => {
    await boot.playersService.create(testingSamples.validPlayer);
    await boot.playersService.create(testingSamples.validPlayer2);

    expect(await boot.playersService.findAll()).toHaveLength(2);
  });

  it('should throw an error while trying to create a player with an existing ID', async () => {
    expect.assertions(1);
    await boot.playersService.create(testingSamples.validPlayer);
    try {
      await boot.playersService.create(testingSamples.validPlayer);
    } catch (exception) {
      expect(exception.message).toBe('player-already-exists');
    }
  });

  it('should update an existing player name', async () => {
    await boot.playersService.create(testingSamples.validPlayer);
    await boot.playersService.update(testingSamples.validPlayer.socketId, {
      ...testingSamples.validPlayer,
      nickName: 'Updated nickname',
    });

    const player = await boot.playersService.findBySocketId(
      testingSamples.validPlayer.socketId,
    );

    expect(player.nickName).toBe('Updated nickname');
  });

  it('should throw an error while trying to update a player that is not registered', async () => {
    expect.assertions(1);

    try {
      await boot.playersService.update(
        testingSamples.validPlayer.socketId,
        testingSamples.validPlayer,
      );
    } catch (exception) {
      expect(exception.message).toBe('player-does-not-exist');
    }
  });

  it('should delete a players from its ID', async () => {
    await boot.playersService.create(testingSamples.validPlayer);
    await boot.playersService.create(testingSamples.validPlayer2);
    await boot.playersService.deleteFromId(testingSamples.validPlayer.socketId);

    const allPlayers = await boot.playersService.findAll();
    expect(allPlayers).toHaveLength(1);
    expect(allPlayers[0].socketId).toBe(testingSamples.validPlayer2.socketId);
  });

  it('should throw an error while trying to delete an inexisting player', async () => {
    expect.assertions(1);
    try {
      await boot.playersService.deleteFromId(
        testingSamples.validPlayer.socketId,
      );
    } catch (exception) {
      expect(exception.message).toBe('player-does-not-exist');
    }
  });
});
