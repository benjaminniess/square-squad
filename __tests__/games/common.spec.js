/**
 * A generic tests group for all games (extending from MasterGame)
 */
const PanicAttack = require('../../games/panic-attack')
const WolfAndSheeps = require('../../games/wolf-and-sheeps')

const gameTypes = [
  {
    name: 'Panick Attack',
    obj: PanicAttack,
    slug: 'panic-attack'
  },
  {
    name: 'Wolf and Sheeps',
    obj: WolfAndSheeps,
    slug: 'wolf-and-sheeps'
  }
]

// Mock the Room class
class Room {
  __construct() {
    this.name = 'The Room Name'
    this.slug = 'the-room-name'
    this.adminPlayer = null
    this.gameStatus = 'waiting'
  }
}

gameTypes.forEach((gameType) => {
  describe(gameType.name + ' game tests', () => {
    it('refuses to crease a game with no room', () => {
      expect(() => {
        new gameType.obj()
      }).toThrow('Missing room')
    })

    it('instanciate a new ' + gameType.name + ' object', () => {
      expect(new gameType.obj(new Room())).toBeInstanceOf(gameType.obj)
    })

    it('renders the game slug', () => {
      expect(new gameType.obj(new Room()).getSlug()).toBe(gameType.slug)
    })

    it('renders the default game status which is "waiting"', () => {
      expect(new gameType.obj(new Room()).getRoom()).toBeInstanceOf(Room)
    })

    it('has 3 rounds by default', () => {
      expect(new gameType.obj(new Room()).getTotalRounds()).toBe(3)
    })

    it('changes the totals rounds with a set function', () => {
      const game = new gameType.obj(new Room())
      game.setTotalRounds(8)
      expect(game.getTotalRounds()).toBe(8)
    })

    it('has a bonus frequency of 5 by default', () => {
      expect(new gameType.obj(new Room()).getBonusFrequency()).toBe(5)
    })

    it('changes the bonus frequency with a set function', () => {
      const game = new gameType.obj(new Room())
      game.setBonusFrequency(6)
      expect(game.getBonusFrequency()).toBe(6)
    })

    it('has a default score of 0', () => {
      expect(new gameType.obj(new Room()).getScore()).toBe(0)
    })

    it('increase the score with a set function', () => {
      const game = new gameType.obj(new Room())
      game.increaseScore()
      expect(game.getScore()).toBe(1)
    })

    it('renders the default game status which is "waiting"', () => {
      expect(new gameType.obj(new Room()).getStatus()).toBe('waiting')
    })

    it('updates the game status with a set function', () => {
      const game = new gameType.obj(new Room())
      game.setStatus('playing')
      expect(game.getStatus()).toBe('playing')
    })

    it('has no ranking by default', () => {
      expect(new gameType.obj(new Room()).getRanking()).toStrictEqual([])
    })

    it('has no last round by default', () => {
      expect(new gameType.obj(new Room()).getLastRoundRanking()).toStrictEqual(
        []
      )
    })

    it('has a highest score of 0 by default', () => {
      expect(new gameType.obj(new Room()).getHighestScore()).toBe(0)
    })
  })
})
