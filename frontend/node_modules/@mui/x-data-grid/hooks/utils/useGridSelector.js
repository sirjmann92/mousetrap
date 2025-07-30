"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.objectShallowCompare = exports.argsEqual = void 0;
exports.useGridSelector = useGridSelector;
var React = _interopRequireWildcard(require("react"));
var _fastObjectShallowCompare = require("@mui/x-internals/fastObjectShallowCompare");
var _warning = require("@mui/x-internals/warning");
var _shim = require("use-sync-external-store/shim");
var _useLazyRef = require("./useLazyRef");
const defaultCompare = Object.is;
const objectShallowCompare = exports.objectShallowCompare = _fastObjectShallowCompare.fastObjectShallowCompare;
const arrayShallowCompare = (a, b) => {
  if (a === b) {
    return true;
  }
  return a.length === b.length && a.every((v, i) => v === b[i]);
};
const argsEqual = (prev, curr) => {
  let fn = Object.is;
  if (curr instanceof Array) {
    fn = arrayShallowCompare;
  } else if (curr instanceof Object) {
    fn = objectShallowCompare;
  }
  return fn(prev, curr);
};
exports.argsEqual = argsEqual;
const createRefs = () => ({
  state: null,
  equals: null,
  selector: null,
  args: undefined
});
const EMPTY = [];
const emptyGetSnapshot = () => null;
function useGridSelector(apiRef, selector, args = undefined, equals = defaultCompare) {
  if (process.env.NODE_ENV !== 'production') {
    if (!apiRef.current.state) {
      (0, _warning.warnOnce)(['MUI X: `useGridSelector` has been called before the initialization of the state.', 'This hook can only be used inside the context of the grid.']);
    }
  }
  const refs = (0, _useLazyRef.useLazyRef)(createRefs);
  const didInit = refs.current.selector !== null;
  const [state, setState] = React.useState(
  // We don't use an initialization function to avoid allocations
  didInit ? null : selector(apiRef, args));
  refs.current.state = state;
  refs.current.equals = equals;
  refs.current.selector = selector;
  const prevArgs = refs.current.args;
  refs.current.args = args;
  if (didInit && !argsEqual(prevArgs, args)) {
    const newState = refs.current.selector(apiRef, refs.current.args);
    if (!refs.current.equals(refs.current.state, newState)) {
      refs.current.state = newState;
      setState(newState);
    }
  }
  const subscribe = React.useCallback(() => {
    if (refs.current.subscription) {
      return null;
    }
    refs.current.subscription = apiRef.current.store.subscribe(() => {
      const newState = refs.current.selector(apiRef, refs.current.args);
      if (!refs.current.equals(refs.current.state, newState)) {
        refs.current.state = newState;
        setState(newState);
      }
    });
    return null;
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  EMPTY);
  const unsubscribe = React.useCallback(() => {
    // Fixes issue in React Strict Mode, where getSnapshot is not called
    if (!refs.current.subscription) {
      subscribe();
    }
    return () => {
      if (refs.current.subscription) {
        refs.current.subscription();
        refs.current.subscription = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, EMPTY);
  (0, _shim.useSyncExternalStore)(unsubscribe, subscribe, emptyGetSnapshot);
  return state;
}