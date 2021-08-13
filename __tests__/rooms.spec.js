require('../')
const Room = require('../src/entities/room')
const Rooms = require('../src/helpers/rooms')

// Quick mock of socket io object
Rooms.injectIo({
  sockets: {
    adapter: {
      rooms: {
        get: (a) => {
          return true
        }
      }
    }
  }
})

describe('Rooms management - scenario 1', () => {
  it('returns an empty rooms object', () => {
    expect(Rooms.getRooms()).toEqual({})
  })

  it('returns true after creating a new room', () => {
    expect(Rooms.createRoom('The Room Name')).toBeTruthy()
  })

  it('refuses to create a room with the same name and return false', () => {
    expect(Rooms.createRoom('The Room Name')).toBeFalsy()
  })

  it('returns an object of all rooms and one of them is the one created previously', () => {
    expect(Rooms.getRooms()).toHaveProperty('the-room-name')
  })

  it('returns an array of all rooms basic data', () => {
    expect(Rooms.getRoomsData().length).toBe(1)
  })

  it('shows the last created room name in the first item of the array', () => {
    expect(Rooms.getRoomsData()[0]['name']).toBe('The Room Name')
  })

  it('returns true after deleting the new room from its slug', () => {
    expect(Rooms.deleteRoom('the-room-name')).toBeTruthy()
  })

  it('returns an empty rooms object', () => {
    expect(Rooms.getRooms()).toEqual({})
  })
})

describe('Rooms management - scenario 2', () => {
  it('returns an empty rooms object', () => {
    expect(Rooms.getRooms()).toEqual({})
  })

  it('returns true after creating a new room', () => {
    expect(Rooms.createRoom('The Room Name')).toBeTruthy()
  })

  it('returns an object of all rooms and one of them is the one created previously', () => {
    expect(Rooms.getRooms()).toHaveProperty('the-room-name')
  })

  it('returns a single room object', () => {
    expect(Rooms.getRoom('the-room-name')).toBeInstanceOf(Room)
  })

  it('returns true after deleting the new room from its slug', () => {
    expect(Rooms.deleteEmptyRooms()).toBeTruthy()
  })

  it('returns an empty rooms object', () => {
    expect(Rooms.getRooms()).toEqual({})
  })
})
