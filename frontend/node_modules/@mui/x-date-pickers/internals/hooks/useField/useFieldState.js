"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFieldState = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useControlled = _interopRequireDefault(require("@mui/utils/useControlled"));
var _useTimeout = _interopRequireDefault(require("@mui/utils/useTimeout"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _RtlProvider = require("@mui/system/RtlProvider");
var _hooks = require("../../../hooks");
var _useField = require("./useField.utils");
var _buildSectionsFromFormat = require("./buildSectionsFromFormat");
var _validation = require("../../../validation");
var _useControlledValue = require("../useControlledValue");
var _getDefaultReferenceDate = require("../../utils/getDefaultReferenceDate");
const QUERY_LIFE_DURATION_MS = 5000;
const useFieldState = parameters => {
  const adapter = (0, _hooks.usePickerAdapter)();
  const translations = (0, _hooks.usePickerTranslations)();
  const isRtl = (0, _RtlProvider.useRtl)();
  const {
    manager: {
      validator,
      valueType,
      internal_valueManager: valueManager,
      internal_fieldValueManager: fieldValueManager
    },
    internalPropsWithDefaults,
    internalPropsWithDefaults: {
      value: valueProp,
      defaultValue,
      referenceDate: referenceDateProp,
      onChange,
      format,
      formatDensity = 'dense',
      selectedSections: selectedSectionsProp,
      onSelectedSectionsChange,
      shouldRespectLeadingZeros = false,
      timezone: timezoneProp,
      enableAccessibleFieldDOMStructure = true
    },
    forwardedProps: {
      error: errorProp
    }
  } = parameters;
  const {
    value,
    handleValueChange,
    timezone
  } = (0, _useControlledValue.useControlledValue)({
    name: 'a field component',
    timezone: timezoneProp,
    value: valueProp,
    defaultValue,
    referenceDate: referenceDateProp,
    onChange,
    valueManager
  });
  const valueRef = React.useRef(value);
  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const {
    hasValidationError
  } = (0, _validation.useValidation)({
    props: internalPropsWithDefaults,
    validator,
    timezone,
    value,
    onError: internalPropsWithDefaults.onError
  });
  const error = React.useMemo(() => {
    // only override when `error` is undefined.
    // in case of multi input fields, the `error` value is provided externally and will always be defined.
    if (errorProp !== undefined) {
      return errorProp;
    }
    return hasValidationError;
  }, [hasValidationError, errorProp]);
  const localizedDigits = React.useMemo(() => (0, _useField.getLocalizedDigits)(adapter), [adapter]);
  const sectionsValueBoundaries = React.useMemo(() => (0, _useField.getSectionsBoundaries)(adapter, localizedDigits, timezone), [adapter, localizedDigits, timezone]);
  const getSectionsFromValue = React.useCallback(valueToAnalyze => fieldValueManager.getSectionsFromValue(valueToAnalyze, date => (0, _buildSectionsFromFormat.buildSectionsFromFormat)({
    adapter,
    localeText: translations,
    localizedDigits,
    format,
    date,
    formatDensity,
    shouldRespectLeadingZeros,
    enableAccessibleFieldDOMStructure,
    isRtl
  })), [fieldValueManager, format, translations, localizedDigits, isRtl, shouldRespectLeadingZeros, adapter, formatDensity, enableAccessibleFieldDOMStructure]);
  const [state, setState] = React.useState(() => {
    const sections = getSectionsFromValue(value);
    (0, _useField.validateSections)(sections, valueType);
    const stateWithoutReferenceDate = {
      sections,
      lastExternalValue: value,
      lastSectionsDependencies: {
        format,
        isRtl,
        locale: adapter.locale
      },
      tempValueStrAndroid: null,
      characterQuery: null
    };
    const granularity = (0, _getDefaultReferenceDate.getSectionTypeGranularity)(sections);
    const referenceValue = valueManager.getInitialReferenceValue({
      referenceDate: referenceDateProp,
      value,
      adapter,
      props: internalPropsWithDefaults,
      granularity,
      timezone
    });
    return (0, _extends2.default)({}, stateWithoutReferenceDate, {
      referenceValue
    });
  });
  const [selectedSections, innerSetSelectedSections] = (0, _useControlled.default)({
    controlled: selectedSectionsProp,
    default: null,
    name: 'useField',
    state: 'selectedSections'
  });
  const setSelectedSections = newSelectedSections => {
    innerSetSelectedSections(newSelectedSections);
    onSelectedSectionsChange?.(newSelectedSections);
  };
  const parsedSelectedSections = React.useMemo(() => (0, _useField.parseSelectedSections)(selectedSections, state.sections), [selectedSections, state.sections]);
  const activeSectionIndex = parsedSelectedSections === 'all' ? 0 : parsedSelectedSections;
  const sectionOrder = React.useMemo(() => (0, _useField.getSectionOrder)(state.sections, isRtl && !enableAccessibleFieldDOMStructure), [state.sections, isRtl, enableAccessibleFieldDOMStructure]);
  const areAllSectionsEmpty = React.useMemo(() => state.sections.every(section => section.value === ''), [state.sections]);
  const publishValue = newValue => {
    const context = {
      validationError: validator({
        adapter,
        value: newValue,
        timezone,
        props: internalPropsWithDefaults
      })
    };
    handleValueChange(newValue, context);
  };
  const setSectionValue = (sectionIndex, newSectionValue) => {
    const newSections = [...state.sections];
    newSections[sectionIndex] = (0, _extends2.default)({}, newSections[sectionIndex], {
      value: newSectionValue,
      modified: true
    });
    return newSections;
  };
  const sectionToUpdateOnNextInvalidDateRef = React.useRef(null);
  const updateSectionValueOnNextInvalidDateTimeout = (0, _useTimeout.default)();
  const setSectionUpdateToApplyOnNextInvalidDate = newSectionValue => {
    if (activeSectionIndex == null) {
      return;
    }
    sectionToUpdateOnNextInvalidDateRef.current = {
      sectionIndex: activeSectionIndex,
      value: newSectionValue
    };
    updateSectionValueOnNextInvalidDateTimeout.start(0, () => {
      sectionToUpdateOnNextInvalidDateRef.current = null;
    });
  };
  const clearValue = () => {
    if (valueManager.areValuesEqual(adapter, value, valueManager.emptyValue)) {
      setState(prevState => (0, _extends2.default)({}, prevState, {
        sections: prevState.sections.map(section => (0, _extends2.default)({}, section, {
          value: ''
        })),
        tempValueStrAndroid: null,
        characterQuery: null
      }));
    } else {
      setState(prevState => (0, _extends2.default)({}, prevState, {
        characterQuery: null
      }));
      publishValue(valueManager.emptyValue);
    }
  };
  const clearActiveSection = () => {
    if (activeSectionIndex == null) {
      return;
    }
    const activeSection = state.sections[activeSectionIndex];
    if (activeSection.value === '') {
      return;
    }
    setSectionUpdateToApplyOnNextInvalidDate('');
    if (fieldValueManager.getDateFromSection(value, activeSection) === null) {
      setState(prevState => (0, _extends2.default)({}, prevState, {
        sections: setSectionValue(activeSectionIndex, ''),
        tempValueStrAndroid: null,
        characterQuery: null
      }));
    } else {
      setState(prevState => (0, _extends2.default)({}, prevState, {
        characterQuery: null
      }));
      publishValue(fieldValueManager.updateDateInValue(value, activeSection, null));
    }
  };
  const updateValueFromValueStr = valueStr => {
    const parseDateStr = (dateStr, referenceDate) => {
      const date = adapter.parse(dateStr, format);
      if (!adapter.isValid(date)) {
        return null;
      }
      const sections = (0, _buildSectionsFromFormat.buildSectionsFromFormat)({
        adapter,
        localeText: translations,
        localizedDigits,
        format,
        date,
        formatDensity,
        shouldRespectLeadingZeros,
        enableAccessibleFieldDOMStructure,
        isRtl
      });
      return (0, _useField.mergeDateIntoReferenceDate)(adapter, date, sections, referenceDate, false);
    };
    const newValue = fieldValueManager.parseValueStr(valueStr, state.referenceValue, parseDateStr);
    publishValue(newValue);
  };
  const cleanActiveDateSectionsIfValueNullTimeout = (0, _useTimeout.default)();
  const updateSectionValue = ({
    section,
    newSectionValue,
    shouldGoToNextSection
  }) => {
    updateSectionValueOnNextInvalidDateTimeout.clear();
    cleanActiveDateSectionsIfValueNullTimeout.clear();
    const activeDate = fieldValueManager.getDateFromSection(value, section);

    /**
     * Decide which section should be focused
     */
    if (shouldGoToNextSection && activeSectionIndex < state.sections.length - 1) {
      setSelectedSections(activeSectionIndex + 1);
    }

    /**
     * Try to build a valid date from the new section value
     */
    const newSections = setSectionValue(activeSectionIndex, newSectionValue);
    const newActiveDateSections = fieldValueManager.getDateSectionsFromValue(newSections, section);
    const newActiveDate = (0, _useField.getDateFromDateSections)(adapter, newActiveDateSections, localizedDigits);

    /**
     * If the new date is valid,
     * Then we merge the value of the modified sections into the reference date.
     * This makes sure that we don't lose some information of the initial date (like the time on a date field).
     */
    if (adapter.isValid(newActiveDate)) {
      const mergedDate = (0, _useField.mergeDateIntoReferenceDate)(adapter, newActiveDate, newActiveDateSections, fieldValueManager.getDateFromSection(state.referenceValue, section), true);
      if (activeDate == null) {
        cleanActiveDateSectionsIfValueNullTimeout.start(0, () => {
          if (valueRef.current === value) {
            setState(prevState => (0, _extends2.default)({}, prevState, {
              sections: fieldValueManager.clearDateSections(state.sections, section),
              tempValueStrAndroid: null
            }));
          }
        });
      }
      return publishValue(fieldValueManager.updateDateInValue(value, section, mergedDate));
    }

    /**
     * If all the sections are filled but the date is invalid and the previous date is valid or null,
     * Then we publish an invalid date.
     */
    if (newActiveDateSections.every(sectionBis => sectionBis.value !== '') && (activeDate == null || adapter.isValid(activeDate))) {
      setSectionUpdateToApplyOnNextInvalidDate(newSectionValue);
      return publishValue(fieldValueManager.updateDateInValue(value, section, newActiveDate));
    }

    /**
     * If the previous date is not null,
     * Then we publish the date as `null`.
     */
    if (activeDate != null) {
      setSectionUpdateToApplyOnNextInvalidDate(newSectionValue);
      return publishValue(fieldValueManager.updateDateInValue(value, section, null));
    }

    /**
     * If the previous date is already null,
     * Then we don't publish the date and we update the sections.
     */
    return setState(prevState => (0, _extends2.default)({}, prevState, {
      sections: newSections,
      tempValueStrAndroid: null
    }));
  };
  const setTempAndroidValueStr = tempValueStrAndroid => setState(prevState => (0, _extends2.default)({}, prevState, {
    tempValueStrAndroid
  }));
  const setCharacterQuery = (0, _useEventCallback.default)(newCharacterQuery => {
    setState(prevState => (0, _extends2.default)({}, prevState, {
      characterQuery: newCharacterQuery
    }));
  });

  // If `prop.value` changes, we update the state to reflect the new value
  if (value !== state.lastExternalValue) {
    let sections;
    if (sectionToUpdateOnNextInvalidDateRef.current != null && !adapter.isValid(fieldValueManager.getDateFromSection(value, state.sections[sectionToUpdateOnNextInvalidDateRef.current.sectionIndex]))) {
      sections = setSectionValue(sectionToUpdateOnNextInvalidDateRef.current.sectionIndex, sectionToUpdateOnNextInvalidDateRef.current.value);
    } else {
      sections = getSectionsFromValue(value);
    }
    setState(prevState => (0, _extends2.default)({}, prevState, {
      lastExternalValue: value,
      sections,
      sectionsDependencies: {
        format,
        isRtl,
        locale: adapter.locale
      },
      referenceValue: fieldValueManager.updateReferenceValue(adapter, value, prevState.referenceValue),
      tempValueStrAndroid: null
    }));
  }
  if (isRtl !== state.lastSectionsDependencies.isRtl || format !== state.lastSectionsDependencies.format || adapter.locale !== state.lastSectionsDependencies.locale) {
    const sections = getSectionsFromValue(value);
    (0, _useField.validateSections)(sections, valueType);
    setState(prevState => (0, _extends2.default)({}, prevState, {
      lastSectionsDependencies: {
        format,
        isRtl,
        locale: adapter.locale
      },
      sections,
      tempValueStrAndroid: null,
      characterQuery: null
    }));
  }
  if (state.characterQuery != null && !error && activeSectionIndex == null) {
    setCharacterQuery(null);
  }
  if (state.characterQuery != null && state.sections[state.characterQuery.sectionIndex]?.type !== state.characterQuery.sectionType) {
    setCharacterQuery(null);
  }
  React.useEffect(() => {
    if (sectionToUpdateOnNextInvalidDateRef.current != null) {
      sectionToUpdateOnNextInvalidDateRef.current = null;
    }
  });
  const cleanCharacterQueryTimeout = (0, _useTimeout.default)();
  React.useEffect(() => {
    if (state.characterQuery != null) {
      cleanCharacterQueryTimeout.start(QUERY_LIFE_DURATION_MS, () => setCharacterQuery(null));
    }
    return () => {};
  }, [state.characterQuery, setCharacterQuery, cleanCharacterQueryTimeout]);

  // If `tempValueStrAndroid` is still defined for some section when running `useEffect`,
  // Then `onChange` has only been called once, which means the user pressed `Backspace` to reset the section.
  // This causes a small flickering on Android,
  // But we can't use `useEnhancedEffect` which is always called before the second `onChange` call and then would cause false positives.
  React.useEffect(() => {
    if (state.tempValueStrAndroid != null && activeSectionIndex != null) {
      clearActiveSection();
    }
  }, [state.sections]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // States and derived states
    activeSectionIndex,
    areAllSectionsEmpty,
    error,
    localizedDigits,
    parsedSelectedSections,
    sectionOrder,
    sectionsValueBoundaries,
    state,
    timezone,
    value,
    // Methods to update the states
    clearValue,
    clearActiveSection,
    setCharacterQuery,
    setSelectedSections,
    setTempAndroidValueStr,
    updateSectionValue,
    updateValueFromValueStr,
    // Utilities methods
    getSectionsFromValue
  };
};
exports.useFieldState = useFieldState;