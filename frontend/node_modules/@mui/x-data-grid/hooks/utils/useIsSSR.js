"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIsSSR = void 0;
var _shim = require("use-sync-external-store/shim");
const emptySubscribe = () => () => {};
const clientSnapshot = () => false;
const serverSnapshot = () => true;
const useIsSSR = () => (0, _shim.useSyncExternalStore)(emptySubscribe, clientSnapshot, serverSnapshot);
exports.useIsSSR = useIsSSR;