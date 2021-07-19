import Page404 from '@/components/Page404'
import { shallowMount } from '@vue/test-utils'

describe('Page404.vue', () => {
  const wrapper = shallowMount(Page404)

  it('should render a title', () => {
    expect(wrapper.text()).toContain("There's nothing here")
  })

  it('should have a logo and a footer', () => {
    expect(wrapper.findComponent({ name: 'Footer' }).isVisible()).toBe(true)
    expect(wrapper.findComponent({ name: 'Logo' }).isVisible()).toBe(true)
  })
})
