import Room from '@/components/Room'
import { shallowMount, config } from '@vue/test-utils'

let stepsToCall = {
  'room-join-socket': false
}

let mockRoomSlug = 'the-room-slug'

config.mocks['$store'] = {
  state: {
    socket: {
      id: 'n7BGXs8MCOWDd3hvAAAR',
      on: (action) => {
        if (action === 'room-join-result') {
          return {
            data: {
              roomSlug: mockRoomSlug
            }
          }
        }
      },
      emit: (event, data = {}) => {
        if (event === 'room-join' && data.roomSlug === mockRoomSlug) {
          stepsToCall['room-join-socket'] = true
        }
      }
    }
  }
}

config.mocks['$route'] = {
  params: {
    id: mockRoomSlug
  }
}

describe('Room.vue', () => {
  const wrapper = shallowMount(Room)

  it('should emit a socket when mounted', () => {
    expect(stepsToCall['room-join-socket']).toBe(true)
  })

  it('should set the room on socket confirmation', () => {
    // TODO: complete this test
  })
})
