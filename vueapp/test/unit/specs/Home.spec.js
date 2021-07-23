import Home from '@/components/Home'
import { mount, config } from '@vue/test-utils'

config.mocks['$store'] = {
  state: {
    socket: {
      on: () => {},
      emit: () => {}
    }
  },
  commit: () => {}
}

config.mocks['$globalEnv'] = {
  version: '1.0.0',
  homeUrl: 'locahost:8080'
}

describe('Home.vue', () => {
  it('emit a socket when submitting the the login form', async () => {
    const wrapper = mount(Home)

    await wrapper.find('#playerName').setValue('Benjamin')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.html()).toContain('Connecting to server...')
  })
})
