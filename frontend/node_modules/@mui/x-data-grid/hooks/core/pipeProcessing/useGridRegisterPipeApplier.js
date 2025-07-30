"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridRegisterPipeApplier = void 0;
var React = _interopRequireWildcard(require("react"));
var _useFirstRender = require("../../utils/useFirstRender");
const useGridRegisterPipeApplier = (apiRef, group, callback) => {
  const cleanup = React.useRef(null);
  const id = React.useRef(`mui-${Math.round(Math.random() * 1e9)}`);
  const registerPreProcessor = React.useCallback(() => {
    cleanup.current = apiRef.current.registerPipeApplier(group, id.current, callback);
  }, [apiRef, callback, group]);
  (0, _useFirstRender.useFirstRender)(() => {
    registerPreProcessor();
  });
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      registerPreProcessor();
    }
    return () => {
      if (cleanup.current) {
        cleanup.current();
        cleanup.current = null;
      }
    };
  }, [registerPreProcessor]);
};
exports.useGridRegisterPipeApplier = useGridRegisterPipeApplier;