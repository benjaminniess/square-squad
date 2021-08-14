/**
 * A generic tests group for all bonus (extending from Bonus class)
 */
const Invincible = require('../../app/src/entities/bonus/invincible')
const ScoreChanger = require('../../app/src/entities/bonus/score-changer')
const Speed = require('../../app/src/entities/bonus/speed')
const { EventEmitter } = require('events')

const bonusTypes = [
  {
    name: 'Invincible',
    obj: Invincible,
    slug: 'invincible'
  },
  {
    name: 'ScoreChanger',
    obj: ScoreChanger,
    slug: 'scoreChanger'
  },
  {
    name: 'Speed',
    obj: Speed,
    slug: 'Speed'
  }
]

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

bonusTypes.forEach((bonusType) => {
  describe(bonusType.name + ' bonus tests', () => {
    it('refuses to crease a bonus with no params', () => {
      expect(() => {
        new bonusType.obj()
      }).toThrow('Missing params')
    })

    it('instanciate a new ' + bonusType.name + ' bonus object', () => {
      expect(new bonusType.obj(mockedParams)).toBeInstanceOf(bonusType.obj)
    })

    it('renders the bonus duration', () => {
      expect(new bonusType.obj(mockedParams).getDuration()).toBe(3000)
    })

    it('init the bonus with dynamic values', () => {
      const bonusObj = new bonusType.obj(mockedParams)
      expect(bonusObj.getData().width).toBe(30)
      expect(bonusObj.getData().height).toBe(30)
    })

    it('has an event emmiter', () => {
      expect(new bonusType.obj(mockedParams).getEventEmmitter()).toBeInstanceOf(
        EventEmitter
      )
    })

    it('is not triggerer by default', () => {
      expect(new bonusType.obj(mockedParams).isTriggered()).toBeFalsy()
    })

    it('is is triggable and its status change after trigger', () => {
      const bonusObj = new bonusType.obj(mockedParams)

      const mockOnTrigger = jest
        .spyOn(bonusObj, 'onTrigger')
        .mockReturnValue(true)
      expect(bonusObj.trigger('abc1234')).toBeTruthy()
      expect(bonusObj.isTriggered()).toBeTruthy()
      mockOnTrigger.mockRestore()
    })
  })
})
