'use client';

import * as React from 'react';
import { useGridApiMethod } from "../../utils/useGridApiMethod.js";
import { useGridRegisterStrategyProcessor } from "../../core/strategyProcessing/useGridRegisterStrategyProcessor.js";
import { useGridEvent as addEventHandler } from "../../utils/useGridEvent.js";
import { useGridDataSourceBase } from "./useGridDataSourceBase.js";
/**
 * Community version of the data source hook. Contains implementation of the `useGridDataSourceBase` hook.
 */
export const useGridDataSource = (apiRef, props) => {
  const {
    api,
    strategyProcessor,
    events,
    setStrategyAvailability
  } = useGridDataSourceBase(apiRef, props);
  useGridApiMethod(apiRef, api.public, 'public');
  useGridRegisterStrategyProcessor(apiRef, strategyProcessor.strategyName, strategyProcessor.group, strategyProcessor.processor);
  Object.entries(events).forEach(([event, handler]) => {
    addEventHandler(apiRef, event, handler);
  });
  React.useEffect(() => {
    setStrategyAvailability();
  }, [setStrategyAvailability]);
};