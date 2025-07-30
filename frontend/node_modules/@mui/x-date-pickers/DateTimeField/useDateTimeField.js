"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDateTimeField = void 0;
var _useField = require("../internals/hooks/useField");
var _managers = require("../managers");
const useDateTimeField = props => {
  const manager = (0, _managers.useDateTimeManager)(props);
  return (0, _useField.useField)({
    manager,
    props
  });
};
exports.useDateTimeField = useDateTimeField;