import "reflect-metadata";
import {GlobalGameScoreManager} from "../../src/games/features/GlobalGameScoreManager";


let scoreManager: GlobalGameScoreManager
beforeAll(() => {

})
beforeEach(() => {
  scoreManager = new GlobalGameScoreManager()
});

afterEach(() => {

});

describe('Global game score manager', () => {
  it('get and increase score', () => {
    expect(scoreManager.getScore()).toEqual(0)

    scoreManager.increaseScore()

    expect(scoreManager.getScore()).toEqual(1)

    scoreManager.increaseScore()

    expect(scoreManager.getScore()).toEqual(2)
  })

  it('set score to a given number', () => {
    expect(scoreManager.getScore()).toEqual(0)

    scoreManager.setScore(10)

    expect(scoreManager.getScore()).toEqual(10)
  })

  it('reset score to 0', () => {
    scoreManager.setScore(10)
    expect(scoreManager.getScore()).toEqual(10)

    scoreManager.resetScore()

    expect(scoreManager.getScore()).toEqual(0)
  })
})

