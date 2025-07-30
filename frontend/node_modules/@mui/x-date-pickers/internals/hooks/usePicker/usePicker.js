"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePicker = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _usePickerAdapter = require("../../../hooks/usePickerAdapter");
var _useReduceAnimations = require("../useReduceAnimations");
var _timeUtils = require("../../utils/time-utils");
var _useViews = require("../useViews");
var _useOrientation = require("./hooks/useOrientation");
var _useValueAndOpenStates = require("./hooks/useValueAndOpenStates");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className", "sx"];
const usePicker = ({
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
    propsToForwardToView = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);

  /**
   * TODO: Improve how we generate the aria-label and aria-labelledby attributes.
   */
  const labelId = (0, _useId.default)();
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const reduceAnimations = (0, _useReduceAnimations.useReduceAnimations)(reduceAnimationsProp);
  const orientation = (0, _useOrientation.useOrientation)(views, orientationProp);
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
  const rootRef = (0, _useForkRef.default)(ref, rootRefObject);
  const {
    timezone,
    state,
    setOpen,
    setValue,
    setValueFromView,
    value,
    viewValue
  } = (0, _useValueAndOpenStates.useValueAndOpenStates)({
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
  } = (0, _useViews.useViews)({
    view: viewProp,
    views,
    openTo,
    onChange: setValueFromView,
    onViewChange,
    autoFocus: autoFocusView,
    getStepNavigation
  });
  const clearValue = (0, _useEventCallback.default)(() => setValue(valueManager.emptyValue));
  const setValueToToday = (0, _useEventCallback.default)(() => setValue(valueManager.getTodayValue(adapter, timezone, valueType)));
  const acceptValueChanges = (0, _useEventCallback.default)(() => setValue(value));
  const cancelValueChanges = (0, _useEventCallback.default)(() => setValue(state.lastCommittedValue, {
    skipPublicationIfPristine: true
  }));
  const dismissViews = (0, _useEventCallback.default)(() => {
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
      if ((0, _timeUtils.isTimeView)(viewForReduce)) {
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
  const getCurrentViewMode = (0, _useEventCallback.default)(() => currentViewMode);
  const [popperView, setPopperView] = React.useState(currentViewMode === 'UI' ? view : null);
  if (popperView !== view && viewModeLookup[view] === 'UI') {
    setPopperView(view);
  }
  (0, _useEnhancedEffect.default)(() => {
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

  (0, _useEnhancedEffect.default)(() => {
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
  const wrappedGoToNextStep = (0, _useEventCallback.default)(goToNextStep);
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
  const contextValue = React.useMemo(() => (0, _extends2.default)({}, actionsContextValue, {
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
    const rendererProps = (0, _extends2.default)({}, propsToForwardToView, {
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
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(RendererInterceptor, {
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
exports.usePicker = usePicker;