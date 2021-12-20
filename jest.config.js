module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/main/**'],
  // collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'node',
  preset: '@shelf/jest-mongodb',
  transform: {
    '.+\\.ts$': 'ts-jest'
  }
}
