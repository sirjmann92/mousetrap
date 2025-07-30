'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className", "sx"];
import * as React from 'react';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import useId from '@mui/utils/useId';
import { usePickerAdapter } from "../../../hooks/usePickerAdapter.js";
import { useReduceAnimations } from "../useReduceAnimations.js";
import { isTimeView } from "../../utils/time-utils.js";
import { useViews } from "../useViews.js";
import { useOrientation } from "./hooks/useOrientation.js";
import { useValueAndOpenStates } from "./hooks/useValueAndOpenStates.js";
import { jsx as _jsx } from "react/jsx-runtime";
export const usePicker = ({
  ref,
  props,
  valueManager,
  valueType,
  variant,
  validator,
  onPopperExited,
  autoFocusView,
  rendererInterceptor: RendererInterceptor,
  localeText,
  viewContainerRole,
  getStepNavigation
}) => {
  const {
    // View props
    views,
    view: viewProp,
    openTo,
    onViewChange,
    viewRenderers,
    reduceAnimations: reduceAnimationsProp,
    orientation: orientationProp,
    disableOpenPicker,
    closeOnSelect,
    // Form props
    disabled,
    readOnly,
    // Field props
    formatDensity,
    enableAccessibleFieldDOMStructure,
    selectedSections,
    onSelectedSectionsChange,
    format,
    label,
    // Other props
    autoFocus,
    name
  } = props;
  const {
      className,
      sx
    } = props,
    propsToForwardToView = _objectWithoutPropertiesLoose(props, _excluded);

  /**
   * TODO: Improve how we generate the aria-label and aria-labelledby attributes.
   */
  const labelId = useId();
  const adapter = usePickerAdapter();
  const reduceAnimations = useReduceAnimations(reduceAnimationsProp);
  const orientation = useOrientation(views, orientationProp);
  const {
    current: initialView
  } = React.useRef(openTo ?? null);

  /**
   * Refs
   */
  const [triggerElement, triggerRef] = React.useState(null);
  const popupRef = React.useRef(null);
  const fieldRef = React.useRef(null);
  const rootRefObject = React.useRef(null);
  const rootRef = useForkRef(ref, rootRefObject);
  const {
    timezone,
    state,
    setOpen,
    setValue,
    setValueFromView,
    value,
    viewValue
  } = useValueAndOpenStates({
    props,
    valueManager,
    validator
  });
  const {
    view,
    setView,
    defaultView,
    focusedView,
    setFocusedView,
    setValueAndGoToNextView,
    goToNextStep,
    hasNextStep,
    hasSeveralSteps
  } = useViews({
    view: viewProp,
    views,
    openTo,
    onChange: setValueFromView,
    onViewChange,
    autoFocus: autoFocusView,
    getStepNavigation
  });
  const clearValue = useEventCallback(() => setValue(valueManager.emptyValue));
  const setValueToToday = useEventCallback(() => setValue(valueManager.getTodayValue(adapter, timezone, valueType)));
  const acceptValueChanges = useEventCallback(() => setValue(value));
  const cancelValueChanges = useEventCallback(() => setValue(state.lastCommittedValue, {
    skipPublicationIfPristine: true
  }));
  const dismissViews = useEventCallback(() => {
    setValue(value, {
      skipPublicationIfPristine: true
    });
  });
  const {
    hasUIView,
    viewModeLookup,
    timeViewsCount
  } = React.useMemo(() => views.reduce((acc, viewForReduce) => {
    const viewMode = viewRenderers[viewForReduce] == null ? 'field' : 'UI';
    acc.viewModeLookup[viewForReduce] = viewMode;
    if (viewMode === 'UI') {
      acc.hasUIView = true;
      if (isTimeView(viewForReduce)) {
        acc.timeViewsCount += 1;
      }
    }
    return acc;
  }, {
    hasUIView: false,
    viewModeLookup: {},
    timeViewsCount: 0
  }), [viewRenderers, views]);
  const currentViewMode = viewModeLookup[view];
  const getCurrentViewMode = useEventCallback(() => currentViewMode);
  const [popperView, setPopperView] = React.useState(currentViewMode === 'UI' ? view : null);
  if (popperView !== view && viewModeLookup[view] === 'UI') {
    setPopperView(view);
  }
  useEnhancedEffect(() => {
    // Handle case of Date Time Picker without time renderers
    if (currentViewMode === 'field' && state.open) {
      setOpen(false);
      setTimeout(() => {
        fieldRef?.current?.setSelectedSections(view);
        // focusing the input before the range selection is done
        // calling it outside of timeout results in an inconsistent behavior between Safari And Chrome
        fieldRef?.current?.focusField(view);
      });
    }
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  useEnhancedEffect(() => {
    if (!state.open) {
      return;
    }
    let newView = view;

    // If the current view is a field view, go to the last popper view
    if (currentViewMode === 'field' && popperView != null) {
      newView = popperView;
    }

    // If the current view is not the default view and both are UI views
    if (newView !== defaultView && viewModeLookup[newView] === 'UI' && viewModeLookup[defaultView] === 'UI') {
      newView = defaultView;
    }
    if (newView !== view) {
      setView(newView);
    }
    setFocusedView(newView, true);
  }, [state.open]); // eslint-disable-line react-hooks/exhaustive-deps

  const ownerState = React.useMemo(() => ({
    isPickerValueEmpty: valueManager.areValuesEqual(adapter, value, valueManager.emptyValue),
    isPickerOpen: state.open,
    isPickerDisabled: props.disabled ?? false,
    isPickerReadOnly: props.readOnly ?? false,
    pickerOrientation: orientation,
    pickerVariant: variant
  }), [adapter, valueManager, value, state.open, orientation, variant, props.disabled, props.readOnly]);
  const triggerStatus = React.useMemo(() => {
    if (disableOpenPicker || !hasUIView) {
      return 'hidden';
    }
    if (disabled || readOnly) {
      return 'disabled';
    }
    return 'enabled';
  }, [disableOpenPicker, hasUIView, disabled, readOnly]);
  const wrappedGoToNextStep = useEventCallback(goToNextStep);
  const defaultActionBarActions = React.useMemo(() => {
    if (closeOnSelect && !hasSeveralSteps) {
      return [];
    }
    return ['cancel', 'nextOrAccept'];
  }, [closeOnSelect, hasSeveralSteps]);
  const actionsContextValue = React.useMemo(() => ({
    setValue,
    setOpen,
    clearValue,
    setValueToToday,
    acceptValueChanges,
    cancelValueChanges,
    setView,
    goToNextStep: wrappedGoToNextStep
  }), [setValue, setOpen, clearValue, setValueToToday, acceptValueChanges, cancelValueChanges, setView, wrappedGoToNextStep]);
  const contextValue = React.useMemo(() => _extends({}, actionsContextValue, {
    value,
    timezone,
    open: state.open,
    views,
    view: popperView,
    initialView,
    disabled: disabled ?? false,
    readOnly: readOnly ?? false,
    autoFocus: autoFocus ?? false,
    variant,
    orientation,
    popupRef,
    reduceAnimations,
    triggerRef,
    triggerStatus,
    hasNextStep,
    fieldFormat: format ?? '',
    name,
    label,
    rootSx: sx,
    rootRef,
    rootClassName: className
  }), [actionsContextValue, value, rootRef, variant, orientation, reduceAnimations, disabled, readOnly, format, className, name, label, sx, triggerStatus, hasNextStep, timezone, state.open, popperView, views, initialView, autoFocus]);
  const privateContextValue = React.useMemo(() => ({
    dismissViews,
    ownerState,
    hasUIView,
    getCurrentViewMode,
    rootRefObject,
    labelId,
    triggerElement,
    viewContainerRole,
    defaultActionBarActions,
    onPopperExited
  }), [dismissViews, ownerState, hasUIView, getCurrentViewMode, labelId, triggerElement, viewContainerRole, defaultActionBarActions, onPopperExited]);
  const fieldPrivateContextValue = React.useMemo(() => ({
    formatDensity,
    enableAccessibleFieldDOMStructure,
    selectedSections,
    onSelectedSectionsChange,
    fieldRef
  }), [formatDensity, enableAccessibleFieldDOMStructure, selectedSections, onSelectedSectionsChange, fieldRef]);
  const isValidContextValue = testedValue => {
    const error = validator({
      adapter,
      value: testedValue,
      timezone,
      props
    });
    return !valueManager.hasError(error);
  };
  const renderCurrentView = () => {
    if (popperView == null) {
      return null;
    }
    const renderer = viewRenderers[popperView];
    if (renderer == null) {
      return null;
    }
    const rendererProps = _extends({}, propsToForwardToView, {
      views,
      timezone,
      value: viewValue,
      onChange: setValueAndGoToNextView,
      view: popperView,
      onViewChange: setView,
      showViewSwitcher: timeViewsCount > 1,
      timeViewsCount
    }, viewContainerRole === 'tooltip' ? {
      focusedView: null,
      onFocusedViewChange: () => {}
    } : {
      focusedView,
      onFocusedViewChange: setFocusedView
    });
    if (RendererInterceptor) {
      return /*#__PURE__*/_jsx(RendererInterceptor, {
        viewRenderers: viewRenderers,
        popperView: popperView,
        rendererProps: rendererProps
      });
    }
    return renderer(rendererProps);
  };
  return {
    providerProps: {
      localeText,
      contextValue,
      privateContextValue,
      actionsContextValue,
      fieldPrivateContextValue,
      isValidContextValue
    },
    renderCurrentView,
    ownerState
  };
};