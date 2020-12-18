import { mount } from '@vue/test-utils'
import CreateTodo from '../../src/components/CreateTodo'

describe('CreateTodo', () => {
    // Now mount the component and you have the wrapper
    const wrapper = mount(CreateTodo)

    it('renders the correct markup', () => {
        expect(wrapper.html()).toContain('<form')
    })

    // it's also easy to check for the existence of elements
    it('has a button', () => {
        expect(wrapper.find('input').exists()).toBe(true)
    })
})