"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePickerTranslations = void 0;
var _usePickerAdapter = require("./usePickerAdapter");
const usePickerTranslations = () => (0, _usePickerAdapter.useLocalizationContext)().localeText;
exports.usePickerTranslations = usePickerTranslations;