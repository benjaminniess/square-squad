import "reflect-metadata";
import {PlayersManager} from "../../src/games/features/PlayersManager";


let playersManager: PlayersManager
beforeAll(async () => {

})
beforeEach(async () => {
  playersManager = new PlayersManager()
});

afterEach(async () => {

});

describe('Players manager', () => {
  it('inits a player', async () => {
    const playersData = playersManager.getPlayersData()

    expect(playersData).toHaveLength(0)

    playersManager.initPlayer({
      nickName: 'Player 1',
      color: '#FF00FF',
      socketID: 'ABC123'
    })

    expect(playersData).toHaveLength(1)
    expect(playersData[0].socketID).toEqual('ABC123')
    expect(playersData[0].color).toEqual('#FF00FF')
    expect(playersData[0].nickName).toEqual('Player 1')

    playersManager.initPlayer({
      nickName: 'Player 2',
      color: '#FF00FF',
      socketID: 'ABC456'
    })

    expect(playersData).toHaveLength(2)
  })

  it('gets a player data', async () => {
    playersManager.initPlayer({
      nickName: 'Player 1',
      color: '#FF00FF',
      socketID: 'ABC123'
    })

    playersManager.initPlayer({
      nickName: 'Player 2',
      color: '#FF0000',
      socketID: 'DEF456'
    })

    playersManager.initPlayer({
      nickName: 'Player 3',
      color: '#0000FF',
      socketID: 'GHI789'
    })

    expect(playersManager.getPlayerData('DEF456')).toEqual({
      socketID: 'DEF456',
      nickName: 'Player 2',
      alive: true,
      color: '#FF0000',
      custom: {},
      x: null,
      y: null
    })
  })

  it('throws an error if wrong player ID', async () => {
    expect(() => playersManager.getPlayerData('DEF456')).toThrow('player-does-not-exist')
  })

  it('reset a player data', async () => {
    playersManager.initPlayer({
      nickName: 'Player 1',
      color: '#FF00FF',
      socketID: 'ABC123'
    })

    playersManager.setPlayerData({
      nickName: 'Player 1 bis',
      color: '#FF0000',
      socketID: 'ABC123',
      alive: false,
      x: 10,
      y: 20,
      custom: {
        customProps: 'test'
      }
    })

    expect(playersManager.getPlayerData('ABC123')).toEqual({
      nickName: 'Player 1 bis',
      color: '#FF0000',
      socketID: 'ABC123',
      alive: false,
      x: 10,
      y: 20,
      custom: {
        customProps: 'test'
      }
    })
  })

  it('set a player single data', async () => {
    playersManager.initPlayer({
      nickName: 'Player 1',
      color: '#FF00FF',
      socketID: 'ABC123'
    })

    expect(playersManager.getPlayerData('ABC123').color).toBe('#FF00FF')

    playersManager.setPlayerSingleData('ABC123', 'color', '#00FF00')

    expect(playersManager.getPlayerData('ABC123').color).toBe('#00FF00')
  })

  it('kills players and counts alive players', async () => {
    playersManager.initPlayer({
      nickName: 'Player 1',
      color: '#FF00FF',
      socketID: 'ABC123'
    })

    playersManager.initPlayer({
      nickName: 'Player 2',
      color: '#FF00FF',
      socketID: 'DEF456'
    })

    playersManager.initPlayer({
      nickName: 'Player 3',
      color: '#FF00FF',
      socketID: 'GHI789'
    })

    expect(playersManager.countAlivePlayers()).toBe(3)
    expect(playersManager.getPlayerData('ABC123').alive).toBe(true)
    expect(playersManager.getPlayerData('DEF456').alive).toBe(true)
    expect(playersManager.getPlayerData('GHI789').alive).toBe(true)

    playersManager.killPlayer('DEF456')

    expect(playersManager.countAlivePlayers()).toBe(2)
    expect(playersManager.getPlayerData('ABC123').alive).toBe(true)
    expect(playersManager.getPlayerData('DEF456').alive).toBe(false)
    expect(playersManager.getPlayerData('GHI789').alive).toBe(true)
  })

  it('renews life of a dead players', async () => {
    playersManager.initPlayer({
      nickName: 'Player 1',
      color: '#FF00FF',
      socketID: 'ABC123'
    })

    expect(playersManager.getPlayerData('ABC123').alive).toBe(true)
    playersManager.killPlayer('ABC123')
    expect(playersManager.getPlayerData('ABC123').alive).toBe(false)

    playersManager.renewPlayers()

    expect(playersManager.getPlayerData('ABC123').alive).toBe(true)
  })

  it('removes a player from the list', async () => {
    playersManager.initPlayer({
      nickName: 'Player 1',
      color: '#FF00FF',
      socketID: 'ABC123'
    })

    playersManager.initPlayer({
      nickName: 'Player 2',
      color: '#FF00FF',
      socketID: 'DEF456'
    })

    playersManager.initPlayer({
      nickName: 'Player 3',
      color: '#FF00FF',
      socketID: 'GHI789'
    })

    expect(() => playersManager.getPlayerData('DEF456')).not.toThrow('player-does-not-exist')
    playersManager.removePlayer('DEF456')
    expect(() => playersManager.getPlayerData('DEF456')).toThrow('player-does-not-exist')
  })
})

