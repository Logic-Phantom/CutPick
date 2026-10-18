// Desktop (Node) micro-benchmark of the pure-TS analysis core. NOT a device benchmark.
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/tests/benchmark/**/*.bench.ts'],
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
