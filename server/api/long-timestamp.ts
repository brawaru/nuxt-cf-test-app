export default cachedEventHandler(() => ({ time: Date.now() }), {
  maxAge: 100_000,
  name: "long-timestamp",
});
