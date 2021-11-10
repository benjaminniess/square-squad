import RankSection from '@/components/RankSection'
import { shallowMount, config } from '@vue/test-utils'

describe('RankSection.vue', () => {
  const wrapper = shallowMount(RankSection, {
    propsData: {
      room: {
        gameStatus: 'waiting',
        roomName: 'Test room',
        roomSlug: 'test-room'
      },
      ranking: {
        gameStatus: 'end-round',
        ranking: [
          { playerID: 'KslmArFZKGWLAlsjAAAH', score: 12 },
          { playerID: 'h7Ud54bbL-z6qx1oAAAF', score: 5 }
        ],
        roundRanking: [
          { playerID: 'h7Ud54bbL-z6qx1oAAAF', score: 3 },
          { playerID: 'KslmArFZKGWLAlsjAAAH', score: 0 }
        ],
        roundWinner: {
          playerID: 'h7Ud54bbL-z6qx1oAAAF',
          score: 3
        }
      },
      players: [
        {
          id: 'h7Ud54bbL-z6qx1oAAAF',
          nickName: 'Player 2',
          color: '#aa00bb',
          score: 5,
          alive: false,
          isAdmin: false
        },
        {
          id: 'KslmArFZKGWLAlsjAAAH',
          nickName: 'Player 1',
          color: '#22964a',
          score: 12,
          alive: false,
          isAdmin: true
        }
      ],
      gameIsOver: false
    }
  })

  it('should render the room name', () => {
    expect(wrapper.find('h3.rooms-list__title').text()).toContain('Test room')
  })

  it("should show the winner's name in the annoucement table", () => {
    expect(wrapper.find('#winner-announcement .user-name').text()).toBe(
      'Player 2'
    )
  })

  it("should display the winner's color", () => {
    expect(
      wrapper.find('#winner-announcement .user-name').attributes().style
    ).toContain('color: rgb(170, 0, 187)')
  })

  it("should display the winner's current round points", () => {
    expect(wrapper.find('#winner-announcement .user-score').text()).toContain(
      '3 pts'
    )
  })

  it('should render the current round results for player 2', () => {
    expect(wrapper.findAll('#round-rank-list li').at(0).text()).toBe(
      'Player 2 (3 points)'
    )
  })

  it('should render the current round results for player 1', () => {
    expect(wrapper.findAll('#round-rank-list li').at(1).text()).toBe(
      'Player 1 (0 points)'
    )
  })

  it('should render the total for player 1', () => {
    expect(wrapper.findAll('#rank-list li').at(0).text()).toBe(
      'Player 1 (12 points)'
    )
  })

  it('should render the current round results', () => {
    expect(wrapper.findAll('#rank-list li').at(1).text()).toBe(
      'Player 2 (5 points)'
    )
  })

  it('should not show the back button after last round', () => {
    expect(wrapper.find('#back-button').exists()).toBe(false)
  })

  it('should show the back button if game is over', async () => {
    await wrapper.setProps({
      gameIsOver: true
    })

    expect(wrapper.find('#back-button').exists()).toBe(true)
  })
})
