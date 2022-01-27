module.exports = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/vendor/**'],
  coverageReporters: ['json', 'lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
};
