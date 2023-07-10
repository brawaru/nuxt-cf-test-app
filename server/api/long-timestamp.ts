export default cachedEventHandler(() => ({ time: Date.now() }), {
  maxAge: 604_800,
  name: "longtimestamp",
});
