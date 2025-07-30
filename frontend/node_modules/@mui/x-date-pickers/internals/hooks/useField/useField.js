"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useField = void 0;
var _useFieldV7TextField = require("./useFieldV7TextField");
var _useFieldV6TextField = require("./useFieldV6TextField");
var _useNullableFieldPrivateContext = require("../useNullableFieldPrivateContext");
const useField = parameters => {
  const fieldPrivateContext = (0, _useNullableFieldPrivateContext.useNullableFieldPrivateContext)();
  const enableAccessibleFieldDOMStructure = parameters.props.enableAccessibleFieldDOMStructure ?? fieldPrivateContext?.enableAccessibleFieldDOMStructure ?? true;
  const useFieldTextField = enableAccessibleFieldDOMStructure ? _useFieldV7TextField.useFieldV7TextField : _useFieldV6TextField.useFieldV6TextField;
  return useFieldTextField(parameters);
};
exports.useField = useField;