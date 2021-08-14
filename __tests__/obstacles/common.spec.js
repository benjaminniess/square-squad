/**
 * A generic tests group for all obstacles (extending from Obstacle class)
 */
const Press = require('../../app/src/entities/obstacles/press')
const Ball = require('../../app/src/entities/obstacles/ball')
const SimpleHole = require('../../app/src/entities/obstacles/simple-hole')
const SpaceInvaders = require('../../app/src/entities/obstacles/space-invaders')

const obstaclesTypes = [
  {
    name: 'Press',
    obj: Press,
    slug: 'press'
  },
  {
    name: 'Ball',
    obj: Ball,
    slug: 'ball'
  },
  {
    name: 'Simple hole',
    obj: SimpleHole,
    slug: 'simple-hole'
  },
  {
    name: 'Space invaders',
    obj: SpaceInvaders,
    slug: 'space-invader'
  }
]

obstaclesTypes.forEach((obstacleType) => {
  describe(obstacleType.name + ' obstacle tests', () => {
    it('instanciate a new ' + obstacleType.name + ' object', () => {
      expect(new obstacleType.obj()).toBeInstanceOf(obstacleType.obj)
    })

    it('renders the obstacle slug', () => {
      expect(new obstacleType.obj().getSlug()).toBe(obstacleType.slug)
    })

    it('has default params', () => {
      expect(new obstacleType.obj().getParams().slug).toBe(obstacleType.slug)
    })

    it('allows to pass the level default params', () => {
      expect(new obstacleType.obj({ level: 4 }).getParams().level).toBe(4)
    })

    it('is not possible to manually change the slug', () => {
      expect(
        new obstacleType.obj({ slug: 'overriden-slug' }).getParams().slug
      ).toBe(obstacleType.slug)
    })

    it('returns the level which is 1 by default', () => {
      expect(new obstacleType.obj().getLevel()).toBe(1)
    })

    it('returns the level even when manually set', () => {
      expect(new obstacleType.obj({ level: 4 }).getLevel()).toBe(4)
    })

    it('returns the speed multiplicator which is 1 by default', () => {
      expect(new obstacleType.obj({ level: 4 }).getSpeedMultiplicator()).toBe(1)
    })
  })
})
