const randomContentGenerator = require('../src/services/RandomContentGenerator')

describe('stringToSlug function', () => {
  it('returns a slug from a string', () => {
    expect(randomContentGenerator.stringToSlug('The string vAlue')).toBe('the-string-value')
  })

  it('returns a slug from a string with numbers', () => {
    expect(randomContentGenerator.stringToSlug('The string vAlue 123456')).toBe(
      'the-string-value-123456'
    )
  })

  it('returns a slug from a string with numbers and special characters', () => {
    expect(randomContentGenerator.stringToSlug('Thé string"@vAlue+123456')).toBe(
      'the-stringvalue123456'
    )
  })
})

describe('getRandomInt function', () => {
  for (let i = 0; i < 10; i++) {
    it('returns a random int from 1 to 10', () => {
      const response = randomContentGenerator.getRandomInt(1, 10)
      expect(response).toBeGreaterThan(0)
      expect(response).toBeLessThan(11)
    })
  }
})

describe('getRandomID function', () => {
  for (let i = 0; i < 10; i++) {
    it('returns a random 8 characters ID', () => {
      expect(randomContentGenerator.getRandomID().length).toBe(16)
    })
  }
})
