module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  setupFilesAfterEnv: [
    "jest-extended"
  ],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  testRunner: "jest-circus/runner",
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  verbose: true,
};
