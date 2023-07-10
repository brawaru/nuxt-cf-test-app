export default cachedEventHandler(() => ({ time: Date.now() }), {
  maxAge: 10,
  name: "timestamp",
});
