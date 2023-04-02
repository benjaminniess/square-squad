import "reflect-metadata";
import {GlobalGameRoundsManager} from "../../src/games/features/GlobalGameRoundsManager";


let roundsManager: GlobalGameRoundsManager
beforeAll(() => {

})
beforeEach(() => {
  roundsManager = new GlobalGameRoundsManager(5)
});

afterEach(() => {

});

describe('Global game round manager', () => {
  it('get current round and rounds number', () => {
    expect(roundsManager.getCurrentRound()).toEqual(1)
    expect(roundsManager.getTotalRounds()).toEqual(5)
  })

  it('increase round number', () => {
    expect(roundsManager.getCurrentRound()).toEqual(1)

    roundsManager.increaseRoundNumber()

    expect(roundsManager.getCurrentRound()).toEqual(2)
  })

  it('throws and error when increasing more than limit', () => {
    roundsManager = new GlobalGameRoundsManager(2)
    expect(roundsManager.getTotalRounds()).toEqual(2)

    roundsManager.increaseRoundNumber()

    expect(roundsManager.getCurrentRound()).toEqual(2)
    expect(() => roundsManager.increaseRoundNumber()).toThrow()
  })
})

