import Vue from 'vue'
import Home from '@/components/Home'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Home.vue', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      actionClick: jest.fn(),
      actionInput: jest.fn()
    }
    store = new Vuex.Store({
      actions,
      state: {
        socket: {
          on: () => {}
        }
      }
    })
  })

  it('should render correct contents', () => {
    const wrapper = shallowMount(Home, { store, localVue })

    expect(1).toEqual(1)
  })
})
