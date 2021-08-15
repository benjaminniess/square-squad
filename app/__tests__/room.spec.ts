import { Room } from '../src/entities/room'

// Quick mock of socket io object
const mockedSocket = {
  sockets: {
    adapter: {
      rooms: {
        get: (a: any) => {
          return true
        }
      }
    }
  }
}

describe('Room entity management', () => {
  const room: Room = new Room('room-name', 'Room name', mockedSocket)

  it('returns the room name', () => {
    expect(room.getName()).toBe('Room name')
  })

  it('returns the room slug', () => {
    expect(room.getSlug()).toBe('room-name')
  })
})
