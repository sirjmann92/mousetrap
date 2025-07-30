"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.roundToDecimalPlaces = roundToDecimalPlaces;
function roundToDecimalPlaces(value, decimals) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}