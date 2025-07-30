"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResizeObserver = void 0;
/* eslint-disable */

/**
 * HACK: Minimal shim to get jsdom to work.
 */
const ResizeObserver = exports.ResizeObserver = typeof globalThis.ResizeObserver !== 'undefined' ? globalThis.ResizeObserver : class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};