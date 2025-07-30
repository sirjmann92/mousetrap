"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridRegisterStrategyProcessor = void 0;
var React = _interopRequireWildcard(require("react"));
var _useFirstRender = require("../../utils/useFirstRender");
const useGridRegisterStrategyProcessor = (apiRef, strategyName, group, processor) => {
  const registerPreProcessor = React.useCallback(() => {
    apiRef.current.registerStrategyProcessor(strategyName, group, processor);
  }, [apiRef, processor, group, strategyName]);
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
  }, [registerPreProcessor]);
};
exports.useGridRegisterStrategyProcessor = useGridRegisterStrategyProcessor;