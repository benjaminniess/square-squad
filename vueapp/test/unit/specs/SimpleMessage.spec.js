import SimpleMessage from '@/components/SimpleMessage'
import { shallowMount } from '@vue/test-utils'

describe('SimpleMessage.vue', () => {
  const wrapper = shallowMount(SimpleMessage)

  it('should render the message content passed using prop', async () => {
    await wrapper.setProps({ messageContent: 'This is a simple message' })
    expect(wrapper.text()).toContain('This is a simple message')
  })

  it('should have a logo and a footer', () => {
    expect(wrapper.findComponent({ name: 'Logo' }).isVisible()).toBe(true)
  })
})
