const app = require('../index')
const helpers = require('../lib/helpers')
const Room = require('../lib/room')
const Player = require('../lib/player')

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

describe('Rooms management - scenario 1', () => {
  it('returns an empty rooms object', () => {
    expect(helpers.getRooms()).toEqual({})
  })

  it('returns true after creating a new room', () => {
    expect(helpers.createRoom('The Room Name')).toBeTruthy()
  })

  it('refuses to create a room with the same name and return false', () => {
    expect(helpers.createRoom('The Room Name')).toBeFalsy()
  })

  it('returns an object of all rooms and one of them is the one created previously', () => {
    expect(helpers.getRooms()).toHaveProperty('the-room-name')
  })

  it('returns an array of all rooms basic data', () => {
    expect(helpers.getRoomsData().length).toBe(1)
  })

  it('shows the last created room name in the first item of the array', () => {
    expect(helpers.getRoomsData()[0]['name']).toBe('The Room Name')
  })

  it('returns true after deleting the new room from its slug', () => {
    expect(helpers.deleteRoom('the-room-name')).toBeTruthy()
  })

  it('returns an empty rooms object', () => {
    expect(helpers.getRooms()).toEqual({})
  })
})

describe('Rooms management - scenario 2', () => {
  it('returns an empty rooms object', () => {
    expect(helpers.getRooms()).toEqual({})
  })

  it('returns true after creating a new room', () => {
    expect(helpers.createRoom('The Room Name')).toBeTruthy()
  })

  it('returns an object of all rooms and one of them is the one created previously', () => {
    expect(helpers.getRooms()).toHaveProperty('the-room-name')
  })

  it('returns a single room object', () => {
    expect(helpers.getRoom('the-room-name')).toBeInstanceOf(Room)
  })

  it('returns true after deleting the new room from its slug', () => {
    expect(helpers.deleteEmptyRooms()).toBeTruthy()
  })

  it('returns an empty rooms object', () => {
    expect(helpers.getRooms()).toEqual({})
  })
})

describe('Players management', () => {
  it('returns an empty players object', () => {
    expect(helpers.getPlayers()).toEqual({})
  })

  it('creates a new player and returns true', () => {
    expect(helpers.initPlayer('abc1234', 'Player 1', '#FF00FF')).toBeTruthy()
  })

  it('returns an empty players object', () => {
    expect(helpers.getPlayers()['abc1234']).toBeInstanceOf(Player)
  })

  it('returns the previously created player', () => {
    expect(helpers.getPlayer('abc1234')).toBeInstanceOf(Player)
  })

  it('returns false when calling a wrong ID', () => {
    expect(helpers.getPlayer('abc12345')).toBeFalsy()
  })

  it('returns false when trying to update a non existing user', () => {
    expect(helpers.updatePlayer('abc12345', { color: '#0000FF' })).toBeFalsy()
  })

  it('updates the previously created user', () => {
    expect(helpers.updatePlayer('abc1234', { color: '#0000FF' })).toBeFalsy()
  })
})
