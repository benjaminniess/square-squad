import AdminForm from '@/components/games/panic-attack/AdminForm'
import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

const localVue = createLocalVue()

localVue.use(Vuex)

let store
let mutations = {
  updateGameOption: jest.fn()
}

beforeEach(() => {
  store = new Vuex.Store({
    state: {
      gameOptions: {
        roundsNumber: 3,
        obstaclesSpeed: 10,
        bonusFrequency: 5
      }
    },
    mutations
  })
})

describe('Panic attack - AdminForm.vue', () => {
  it('should commit the vuex updateGameOption after roundsNumber update', () => {
    const wrapper = shallowMount(AdminForm, { store, localVue })

    const input = wrapper.find('#roundsNumber')
    input.setValue(5)
    input.trigger('input')

    expect(mutations.updateGameOption).toBeCalledWith(
      {
        "gameOptions": 
          {"bonusFrequency": 5, "obstaclesSpeed": 10, "roundsNumber": 3 }
      },
      {
          key: 'roundsNumber',
          value: '5'
      })
  })

  
  it('should commit the vuex updateGameOption after obstaclesSpeed update', () => {
    const wrapper = shallowMount(AdminForm, { store, localVue })

    const input = wrapper.find('#obstaclesSpeed')
    input.setValue(20)
    input.trigger('input')

    expect(mutations.updateGameOption).toBeCalledWith(
      {
        "gameOptions": 
          {"bonusFrequency": 5, "obstaclesSpeed": 10, "roundsNumber": 3 }
      },
      {
        "key": "obstaclesSpeed", 
        "value": "20"
      })
  })

  it('should commit the vuex updateGameOption after bonusFrequency update', () => {
    const wrapper = shallowMount(AdminForm, { store, localVue })

    const input = wrapper.find('#bonusFrequency')
    input.setValue(7)
    input.trigger('input')

    expect(mutations.updateGameOption).toBeCalledWith(
      {
        "gameOptions": 
          {"bonusFrequency": 5, "obstaclesSpeed": 10, "roundsNumber": 3 }
      },
      {
        "key": "bonusFrequency", 
        "value": "7"
      })
  })
  
})
