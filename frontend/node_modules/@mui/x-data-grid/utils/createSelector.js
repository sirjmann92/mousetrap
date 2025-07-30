"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSelectorMemoized = exports.createSelector = exports.createRootSelector = void 0;
var _store = require("@mui/x-internals/store");
const createSelector = (...args) => {
  const baseSelector = (0, _store.createSelector)(...args);
  const selector = (apiRef, a1, a2, a3) => baseSelector(unwrapIfNeeded(apiRef), a1, a2, a3);
  return selector;
};
exports.createSelector = createSelector;
const createSelectorMemoized = (...args) => {
  const baseSelector = (0, _store.createSelectorMemoized)(...args);
  const selector = (apiRef, a1, a2, a3) => baseSelector(unwrapIfNeeded(apiRef), a1, a2, a3);
  return selector;
};

/**
 * Used to create the root selector for a feature. It assumes that the state is already initialized
 * and strips from the types the possibility of `apiRef` being `null`.
 * Users are warned about this in our documentation https://mui.com/x/react-data-grid/state/#direct-selector-access
 */
exports.createSelectorMemoized = createSelectorMemoized;
const createRootSelector = fn => (apiRef, args) => fn(unwrapIfNeeded(apiRef), args);
exports.createRootSelector = createRootSelector;
function unwrapIfNeeded(refOrState) {
  if ('current' in refOrState) {
    return refOrState.current.state;
  }
  return refOrState;
}