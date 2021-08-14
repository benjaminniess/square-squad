/**
 * Specific tests for score changer bonus
 */

const ScoreChanger = require('../../build/src/entities/bonus/score-changer')

const mockedParams = {
  game: {
    getPlayersManager: () => {
      return {
        uptadePlayerSingleData: (param1, param2, param3) => {
          return
        }
      }
    }
  }
}

describe('Score changer bonus tests', () => {
  it('returns a changer type of p3 from 1 to 10', () => {
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(1)).toBe('p3')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(5)).toBe('p3')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(10)).toBe('p3')
  })

  it('returns a changer type of m3 from 11 to 20', () => {
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(11)).toBe('m3')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(15)).toBe('m3')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(20)).toBe('m3')
  })

  it('returns a changer type of p5 from 21 to 30', () => {
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(21)).toBe('p5')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(25)).toBe('p5')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(30)).toBe('p5')
  })

  it('returns a changer type of m5 from 31 to 40', () => {
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(31)).toBe('m5')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(35)).toBe('m5')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(40)).toBe('m5')
  })

  it('returns a changer type of p10 from 41 to 45', () => {
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(41)).toBe('p10')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(45)).toBe('p10')
  })

  it('returns a changer type of m10 from 46 to 50', () => {
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(46)).toBe('m10')
    expect(new ScoreChanger(mockedParams).getTypeFromNumber(50)).toBe('m10')
  })

  const combinaisons = [
    {
      number: 4,
      imgX: 300,
      imgY: 100,
      scoreChange: 3
    },
    {
      number: 11,
      imgX: 200,
      imgY: 100,
      scoreChange: -3
    },
    {
      number: 21,
      imgX: 100,
      imgY: 100,
      scoreChange: 5
    },
    {
      number: 35,
      imgX: 0,
      imgY: 300,
      scoreChange: -5
    },
    {
      number: 42,
      imgX: 200,
      imgY: 300,
      scoreChange: 10
    },
    {
      number: 47,
      imgX: 0,
      imgY: 200,
      scoreChange: -10
    }
  ]

  combinaisons.forEach((combinaison) => {
    it(
      'returns the correct combinaison from the random generated number of ' +
        combinaison.number,
      () => {
        const bonusObj = new ScoreChanger(mockedParams)

        const mockScoreChanger = jest
          .spyOn(bonusObj, 'getRandomInt')
          .mockReturnValue(combinaison.number)
        bonusObj.initChangerType()

        expect(bonusObj.getData().imgX).toBe(combinaison.imgX)
        expect(bonusObj.getData().imgY).toBe(combinaison.imgY)
        expect(bonusObj.getData().scoreChange).toBe(combinaison.scoreChange)

        mockScoreChanger.mockRestore()
      }
    )
  })
})
