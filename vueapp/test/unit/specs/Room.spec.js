import Room from '@/components/Room'
import { mount, config } from '@vue/test-utils'

let stepsToCall = {
  'room-join-socket': false
}

let mockRoomSlug = 'the-room-slug'

config.mocks = {
  $globalEnv: {
    version: '1.0.0'
  },
  $route: {
    params: {
      id: mockRoomSlug
    }
  },
  $store: {
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
      },
      gameStatus: 'waiting'
    }
  }
}

describe('Room.vue', () => {
  const wrapper = mount(Room)

  it('should emit a socket when mounted', () => {
    expect(stepsToCall['room-join-socket']).toBe(true)
  })

  it('should show the LobbySection component', () => {
    expect(wrapper.findComponent({ name: 'LobbySection' }).isVisible()).toBe(
      true
    )
  })

  it('should hide the GameSection component', () => {
    expect(wrapper.findComponent({ name: 'GameSection' }).isVisible()).toBe(
      false
    )
  })

  it('should hide the RankSection component', () => {
    expect(wrapper.findComponent({ name: 'RankSection' }).isVisible()).toBe(
      false
    )
  })
})
