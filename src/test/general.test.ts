import { Application } from '../general'



test('returns the application instance', () => {
    const app = new Application()
    expect(app.name).toBe('Second Exchange SDK')
})

test('returns the application relay pool instance', () => {
    const app = new Application()
    expect(app.relayPool).toBe('function')
})


