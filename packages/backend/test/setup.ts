// Jest test setup
import { Test, TestingModule } from '@nestjs/testing';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set default timeout for async tests
jest.setTimeout(10000);