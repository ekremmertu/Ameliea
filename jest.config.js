const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/tests/e2e/', // Playwright E2E
    // API route testleri Next.js Request ortamı gerektirir; CI'da ayrı kurulacak
    '/tests/__tests__/api/payments-upgrade.test.ts',
    '/tests/__tests__/api/user-profile.test.ts',
    '/tests/__tests__/api/testimonials.test.ts',
    '/tests/__tests__/api/invitations-slug.test.ts',
    '/tests/__tests__/api/rsvp.test.ts',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    // Kritik dosyalar için daha yüksek threshold
    './lib/sanitize.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './lib/constants.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './components/ui/Toast.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/ErrorBoundary.tsx': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

