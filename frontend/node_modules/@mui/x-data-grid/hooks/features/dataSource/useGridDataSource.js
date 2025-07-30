"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridDataSource = void 0;
var React = _interopRequireWildcard(require("react"));
var _useGridApiMethod = require("../../utils/useGridApiMethod");
var _useGridRegisterStrategyProcessor = require("../../core/strategyProcessing/useGridRegisterStrategyProcessor");
var _useGridEvent = require("../../utils/useGridEvent");
var _useGridDataSourceBase = require("./useGridDataSourceBase");
/**
 * Community version of the data source hook. Contains implementation of the `useGridDataSourceBase` hook.
 */
const useGridDataSource = (apiRef, props) => {
  const {
    api,
    strategyProcessor,
    events,
    setStrategyAvailability
  } = (0, _useGridDataSourceBase.useGridDataSourceBase)(apiRef, props);
  (0, _useGridApiMethod.useGridApiMethod)(apiRef, api.public, 'public');
  (0, _useGridRegisterStrategyProcessor.useGridRegisterStrategyProcessor)(apiRef, strategyProcessor.strategyName, strategyProcessor.group, strategyProcessor.processor);
  Object.entries(events).forEach(([event, handler]) => {
    (0, _useGridEvent.useGridEvent)(apiRef, event, handler);
  });
  React.useEffect(() => {
    setStrategyAvailability();
  }, [setStrategyAvailability]);
};
exports.useGridDataSource = useGridDataSource;