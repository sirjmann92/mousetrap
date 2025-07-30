import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import useControlled from '@mui/utils/useControlled';
import { usePickerAdapter } from "../../hooks/usePickerAdapter.js";

/**
 * Hooks controlling the value while making sure that:
 * - The value returned by `onChange` always have the timezone of `props.value` or `props.defaultValue` if defined
 * - The value rendered is always the one from `props.timezone` if defined
 */
export const useControlledValue = ({
  name,
  timezone: timezoneProp,
  value: valueProp,
  defaultValue,
  referenceDate,
  onChange: onChangeProp,
  valueManager
}) => {
  const adapter = usePickerAdapter();
  const [valueWithInputTimezone, setValue] = useControlled({
    name,
    state: 'value',
    controlled: valueProp,
    default: defaultValue ?? valueManager.emptyValue
  });
  const inputTimezone = React.useMemo(() => valueManager.getTimezone(adapter, valueWithInputTimezone), [adapter, valueManager, valueWithInputTimezone]);
  const setInputTimezone = useEventCallback(newValue => {
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
  const handleValueChange = useEventCallback((newValue, ...otherParams) => {
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