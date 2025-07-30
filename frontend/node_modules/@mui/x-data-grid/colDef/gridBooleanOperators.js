"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGridBooleanOperators = void 0;
var _GridFilterInputBoolean = require("../components/panel/filterPanel/GridFilterInputBoolean");
const getGridBooleanOperators = () => [{
  value: 'is',
  getApplyFilterFn: filterItem => {
    const sanitizedValue = (0, _GridFilterInputBoolean.sanitizeFilterItemValue)(filterItem.value);
    if (sanitizedValue === undefined) {
      return null;
    }
    return value => Boolean(value) === sanitizedValue;
  },
  InputComponent: _GridFilterInputBoolean.GridFilterInputBoolean
}];
exports.getGridBooleanOperators = getGridBooleanOperators;