// Polyfill for fetch used by Firebase JS SDK
const fetch = require('node-fetch');

global.fetch = fetch;
global.Request = fetch.Request;
global.Response = fetch.Response;
global.Headers = fetch.Headers;

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mocking window.matchMedia for Jest environment (JSDOM)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
