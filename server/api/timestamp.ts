export default cachedEventHandler(() => {
  return { time: Date.now() }
}, {
  maxAge: 10,
  name: 'timestamp'
})
