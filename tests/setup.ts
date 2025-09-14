import { vi } from 'vitest';

// Mock chrome API for extension testing
global.chrome = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    sendMessage: vi.fn(),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
  },
} as any;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com',
  },
  writable: true,
});