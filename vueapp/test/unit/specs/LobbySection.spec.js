import LobbySection from '@/components/LobbySection'
import { shallowMount, config } from '@vue/test-utils'

config.mocks['$store'] = {
  state: {
    socket: {
      id: 'n7BGXs8MCOWDd3hvAAAR',
      on: () => {}
    }
  }
}

describe('LobbySection.vue', () => {
  const wrapper = shallowMount(LobbySection, {
    propsData: {
      players: [
        {
          color: '#FF0000',
          id: 'n7BGXs8MCOWDd3hvAAAR',
          isAdmin: true,
          nickName: 'Tester Admin',
          score: 0
        },
        {
          color: '#00FF00',
          id: '"a6fJks8MCOWDd5ucBBBV"',
          isAdmin: false,
          nickName: 'Tester client',
          score: 0
        }
      ],
      room: {
        roomSlug: 'room-slug',
        roomName: 'The Room name',
        gameStatus: 'waiting'
      }
    }
  })

  it('should render the room name', () => {
    expect(wrapper.find('h3.rooms-list__title').text()).toContain(
      'The Room name'
    )
  })

  it('should have 2 players', () => {
    expect(wrapper.findAll('ul.players-list li').at(0).text()).toContain(
      'Tester Admin'
    )
    expect(wrapper.findAll('ul.players-list li').at(1).text()).toContain(
      'Tester client'
    )
  })

  it('should show that current player is admin', () => {
    expect(wrapper.findAll('ul.players-list li').at(0).text()).toContain(
      '[Admin]'
    )
  })

  it('should show that current player is flagged as current player', () => {
    expect(wrapper.findAll('ul.players-list li').at(0).text()).toContain(
      '[You]'
    )
  })

  it('should show admin form to the admin player', () => {
    expect(wrapper.findComponent({ name: 'AdminForm' }).exists()).toBe(true)
  })

  it('should show that current player is not admin anymore', async () => {
    await wrapper.setProps({
      players: [
        {
          color: '#FF0000',
          id: 'n7BGXs8MCOWDd3hvAAAR',
          isAdmin: false, // Not admin anymore
          nickname: 'Tester Admin',
          score: 0
        },
        {
          color: '#00FF00',
          id: '"a6fJks8MCOWDd5ucBBBV"',
          isAdmin: false, // is now admin
          nickname: 'Tester client',
          score: 0
        }
      ],
      room: {
        roomSlug: 'room-slug',
        roomName: 'The Room name',
        gameStatus: 'waiting'
      }
    })
    expect(wrapper.findAll('ul.players-list li').at(0).text()).not.toContain(
      '[Admin]'
    )
  })

  it('should show still that current player is flagged as current player', () => {
    expect(wrapper.findAll('ul.players-list li').at(0).text()).toContain(
      '[You]'
    )
  })

  it('should not show admin form to the admin player', () => {
    expect(wrapper.findComponent({ name: 'AdminForm' }).exists()).toBe(false)
  })
})
