export default cachedEventHandler(() => {
  return { time: Date.now() }
}, {
  maxAge: 60,
  name: 'timestamp'
})
