import "reflect-metadata";
import {PlayersInputManager} from "../../src/games/features/PlayersInputsManager";
import {PlayerInputs} from "../../src/games/features/enums/PlayerInputs";


let playersInputManager: PlayersInputManager
beforeAll(() => {

})
beforeEach(() => {
  playersInputManager = new PlayersInputManager()
});

afterEach(() => {

});

describe('Players input manager', () => {
  it('inits a player', () => {
    const playersData = playersInputManager.findAllPlayersInputs()

    expect(playersData).toHaveLength(0)

    playersInputManager.initPlayer('ABC123')

    expect(playersData).toHaveLength(1)
    expect(playersData[0].socketID).toEqual('ABC123')
    expect(playersData[0].up).toEqual(false)
    expect(playersData[0].down).toEqual(false)
    expect(playersData[0].left).toEqual(false)
    expect(playersData[0].right).toEqual(false)

    playersInputManager.initPlayer('DEF456')

    expect(playersData).toHaveLength(2)
  })

  it('gets a player button state data', () => {
    playersInputManager.initPlayer('ABC123')
    playersInputManager.initPlayer('DEF456')
    playersInputManager.initPlayer('GHI789')

    expect(playersInputManager.findPlayerInputs('DEF456')).toEqual({
      socketID: 'DEF456',
      up: false,
      down: false,
      right: false,
      left: false,
    })
  })

  it('throws an error if wrong player ID', () => {
    expect(() => playersInputManager.findPlayerInputs('DEF456')).toThrow('player-does-not-exist')
  })

  it('reset a player button state', () => {
    playersInputManager.initPlayer('ABC123')

    playersInputManager.setPlayerButtonState('ABC123', PlayerInputs.Down, true)

    expect(playersInputManager.findPlayerInputs('ABC123')).toEqual({
      socketID: 'ABC123',
      up: false,
      down: true,
      right: false,
      left: false
    })
  })

  it('reset a player button states', () => {
    playersInputManager.initPlayer('ABC123')

    playersInputManager.setPlayerButtonState('ABC123', PlayerInputs.Down, true)

    expect(playersInputManager.findPlayerInputs('ABC123')).toEqual({
      socketID: 'ABC123',
      up: false,
      down: true,
      right: false,
      left: false
    })

    playersInputManager.resetPlayerInputs('ABC123')

    expect(playersInputManager.findPlayerInputs('ABC123')).toEqual({
      socketID: 'ABC123',
      up: false,
      down: false,
      right: false,
      left: false
    })
  })

  it('remove players ', () => {
    playersInputManager.initPlayer('ABC123')
    playersInputManager.initPlayer('DEF456')
    playersInputManager.initPlayer('GHI789')

    expect(() => playersInputManager.findPlayerInputs('DEF456')).not.toThrow('player-does-not-exist')

    playersInputManager.removePlayer('DEF456')

    expect(() => playersInputManager.findPlayerInputs('DEF456')).toThrow('player-does-not-exist')
  })
})

