const Players = require('../src/helpers/players')
const Player = require('../src/entities/player')

describe('Players management', () => {
  it('returns an empty players object', () => {
    expect(Players.getPlayers()).toEqual({})
  })

  it('creates a new player and returns true', () => {
    expect(Players.initPlayer('abc1234', 'Players 1', '#FF00FF')).toBeTruthy()
  })

  it('returns an empty players object', () => {
    expect(Players.getPlayers()['abc1234']).toBeInstanceOf(Player)
  })

  it('returns the previously created player', () => {
    expect(Players.getPlayer('abc1234')).toBeInstanceOf(Player)
  })

  it('returns false when calling a wrong ID', () => {
    expect(Players.getPlayer('abc12345')).toBeFalsy()
  })

  it('returns false when trying to update a non existing user', () => {
    expect(Players.updatePlayer('abc12345', { color: '#0000FF' })).toBeFalsy()
  })

  it('updates the previously created user', () => {
    expect(Players.updatePlayer('abc1234', { color: '#0000FF' })).toBeFalsy()
  })
})
