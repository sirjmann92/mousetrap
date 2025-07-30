"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useControlledValue = void 0;
var React = _interopRequireWildcard(require("react"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _useControlled = _interopRequireDefault(require("@mui/utils/useControlled"));
var _usePickerAdapter = require("../../hooks/usePickerAdapter");
/**
 * Hooks controlling the value while making sure that:
 * - The value returned by `onChange` always have the timezone of `props.value` or `props.defaultValue` if defined
 * - The value rendered is always the one from `props.timezone` if defined
 */
const useControlledValue = ({
  name,
  timezone: timezoneProp,
  value: valueProp,
  defaultValue,
  referenceDate,
  onChange: onChangeProp,
  valueManager
}) => {
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const [valueWithInputTimezone, setValue] = (0, _useControlled.default)({
    name,
    state: 'value',
    controlled: valueProp,
    default: defaultValue ?? valueManager.emptyValue
  });
  const inputTimezone = React.useMemo(() => valueManager.getTimezone(adapter, valueWithInputTimezone), [adapter, valueManager, valueWithInputTimezone]);
  const setInputTimezone = (0, _useEventCallback.default)(newValue => {
    if (inputTimezone == null) {
      return newValue;
    }
    return valueManager.setTimezone(adapter, inputTimezone, newValue);
  });
  const timezoneToRender = React.useMemo(() => {
    if (timezoneProp) {
      return timezoneProp;
    }
    if (inputTimezone) {
      return inputTimezone;
    }
    if (referenceDate) {
      return adapter.getTimezone(Array.isArray(referenceDate) ? referenceDate[0] : referenceDate);
    }
    return 'default';
  }, [timezoneProp, inputTimezone, referenceDate, adapter]);
  const valueWithTimezoneToRender = React.useMemo(() => valueManager.setTimezone(adapter, timezoneToRender, valueWithInputTimezone), [valueManager, adapter, timezoneToRender, valueWithInputTimezone]);
  const handleValueChange = (0, _useEventCallback.default)((newValue, ...otherParams) => {
    const newValueWithInputTimezone = setInputTimezone(newValue);
    setValue(newValueWithInputTimezone);
    onChangeProp?.(newValueWithInputTimezone, ...otherParams);
  });
  return {
    value: valueWithTimezoneToRender,
    handleValueChange,
    timezone: timezoneToRender
  };
};
exports.useControlledValue = useControlledValue;