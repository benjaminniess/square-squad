const helpers = require('../app/src/helpers/helpers')

describe('stringToSlug function', () => {
  it('returns a slug from a string', () => {
    expect(helpers.stringToSlug('The string vAlue')).toBe('the-string-value')
  })

  it('returns a slug from a string with numbers', () => {
    expect(helpers.stringToSlug('The string vAlue 123456')).toBe(
      'the-string-value-123456'
    )
  })

  it('returns a slug from a string with numbers and special characters', () => {
    expect(helpers.stringToSlug('Thé string"@vAlue+123456')).toBe(
      'the-stringvalue123456'
    )
  })
})

describe('getRandomInt function', () => {
  for (i = 0; i < 10; i++) {
    it('returns a random int from 1 to 10', () => {
      const response = helpers.getRandomInt(1, 10)
      expect(response).toBeGreaterThan(0)
      expect(response).toBeLessThan(11)
    })
  }
})

describe('getRandomID function', () => {
  for (i = 0; i < 10; i++) {
    it('returns a random 8 characters ID', () => {
      expect(helpers.getRandomID().length).toBe(16)
    })
  }
})
