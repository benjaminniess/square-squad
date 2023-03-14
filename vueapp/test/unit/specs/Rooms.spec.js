import Rooms from '@/components/Rooms'
import {config, shallowMount} from '@vue/test-utils'

let refreshEventHasBeenCalled = false
let roomCreateHasBeenCalled = false
let newRoomName = null

config.mocks['$store'] = {
  state: {
    socket: {
      id: 'n7BGXs8MCOWDd3hvAAAR',
      on: () => {
      },
      emit: (event, data = {}) => {
        if (event === 'refresh-rooms') {
          refreshEventHasBeenCalled = true
        } else if (event === 'create-room') {
          roomCreateHasBeenCalled = true
          newRoomName = data
        }
      }
    }
  }
}

describe('Rooms.vue', () => {
  const wrapper = shallowMount(Rooms, {
    data() {
      return {
        rooms: [
          {
            name: 'First Room Name',
            slug: 'first-room-name',
            url: '/rooms/first-room-name'
          },
          {
            name: 'Second Room Name',
            slug: 'second-room-name',
            url: '/rooms/second-room-name'
          }
        ]
      }
    }
  })

  it('should render the first rooms name', () => {
    expect(wrapper.find('.rooms-list__list li').text()).toBe('First Room Name')
  })

  it('should render the second room name', () => {
    expect(wrapper.findAll('.rooms-list__list li').at(1).text()).toBe(
      'Second Room Name'
    )
  })

  it('should render empty rooms list', async () => {
    await wrapper.setData({rooms: []})
    expect(wrapper.find('.rooms-list__list li').exists()).toBe(false)
  })

  it('should show a placeholder message when no room', () => {
    expect(wrapper.find('.rooms-list__no-rooms').text()).toBe('No rooms yet :(')
  })

  it('should refresh rooms list on click', async () => {
    await wrapper.find('#refresh-rooms').trigger('click')

    expect(refreshEventHasBeenCalled).toBe(true)
  })

  it('should emit a socket event on room create form submit', async () => {
    await wrapper.find('#newRoom').setValue('New Room Name')
    await wrapper.find('form').trigger('submit.prevent')

    expect(roomCreateHasBeenCalled).toBe(true)
  })

  it('should pass the room name to the event', () => {
    expect(newRoomName).toBe('New Room Name')
  })
})
