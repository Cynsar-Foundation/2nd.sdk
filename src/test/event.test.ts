import  { Events }  from '../events/events'

test('returns the event from new function', () => {
    const event = {
        pubkey: 'somepkey',
        created_at: 'today',
        kind: '1',
        tags: 'none',
        content: 'hello something'
    }

    const ev = new Events()
    const f = ev.getEventHash(event)
    expect(f).toBe('823723704f158edfad07db9e340fbc87e96156c6aeb138695f8b2f0cd4a365e2')
})