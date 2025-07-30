"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridRegisterPipeProcessor = void 0;
var React = _interopRequireWildcard(require("react"));
var _useFirstRender = require("../../utils/useFirstRender");
const useGridRegisterPipeProcessor = (apiRef, group, callback, enabled = true) => {
  const cleanup = React.useRef(null);
  const id = React.useRef(`mui-${Math.round(Math.random() * 1e9)}`);
  const registerPreProcessor = React.useCallback(() => {
    cleanup.current = apiRef.current.registerPipeProcessor(group, id.current, callback);
  }, [apiRef, callback, group]);
  (0, _useFirstRender.useFirstRender)(() => {
    if (enabled) {
      registerPreProcessor();
    }
  });
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (enabled) {
      registerPreProcessor();
    }
    return () => {
      if (cleanup.current) {
        cleanup.current();
        cleanup.current = null;
      }
    };
  }, [registerPreProcessor, enabled]);
};
exports.useGridRegisterPipeProcessor = useGridRegisterPipeProcessor;