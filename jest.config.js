export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  reporters: ['default', '<rootDir>/reporters/testsReporter.js'],
  testTimeout: 30000,
  transform: {},
  verbose: true,
};
