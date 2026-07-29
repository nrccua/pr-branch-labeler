// @actions/github wires octokit to the undici package's fetch (for proxy support),
// which bypasses nock's interception of globalThis.fetch. Route it back through
// globalThis.fetch so nock can intercept requests in tests.
const actual = jest.requireActual('undici');

module.exports = {
  ...actual,
  fetch: (url, opts = {}) => {
    const { dispatcher, ...rest } = opts;
    return globalThis.fetch(url, rest);
  },
};
