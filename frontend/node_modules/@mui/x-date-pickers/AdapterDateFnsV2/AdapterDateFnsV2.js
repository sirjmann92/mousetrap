"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdapterDateFns = void 0;
var _index = _interopRequireDefault(require("date-fns/addDays/index.js"));
var _index2 = _interopRequireDefault(require("date-fns/addSeconds/index.js"));
var _index3 = _interopRequireDefault(require("date-fns/addMinutes/index.js"));
var _index4 = _interopRequireDefault(require("date-fns/addHours/index.js"));
var _index5 = _interopRequireDefault(require("date-fns/addWeeks/index.js"));
var _index6 = _interopRequireDefault(require("date-fns/addMonths/index.js"));
var _index7 = _interopRequireDefault(require("date-fns/addYears/index.js"));
var _index8 = _interopRequireDefault(require("date-fns/endOfDay/index.js"));
var _index9 = _interopRequireDefault(require("date-fns/endOfWeek/index.js"));
var _index0 = _interopRequireDefault(require("date-fns/endOfYear/index.js"));
var _index1 = _interopRequireDefault(require("date-fns/format/index.js"));
var _index10 = _interopRequireDefault(require("date-fns/getDate/index.js"));
var _index11 = _interopRequireDefault(require("date-fns/getDaysInMonth/index.js"));
var _index12 = _interopRequireDefault(require("date-fns/getHours/index.js"));
var _index13 = _interopRequireDefault(require("date-fns/getMinutes/index.js"));
var _index14 = _interopRequireDefault(require("date-fns/getMonth/index.js"));
var _index15 = _interopRequireDefault(require("date-fns/getSeconds/index.js"));
var _index16 = _interopRequireDefault(require("date-fns/getMilliseconds/index.js"));
var _index17 = _interopRequireDefault(require("date-fns/getWeek/index.js"));
var _index18 = _interopRequireDefault(require("date-fns/getYear/index.js"));
var _index19 = _interopRequireDefault(require("date-fns/isAfter/index.js"));
var _index20 = _interopRequireDefault(require("date-fns/isBefore/index.js"));
var _index21 = _interopRequireDefault(require("date-fns/isEqual/index.js"));
var _index22 = _interopRequireDefault(require("date-fns/isSameDay/index.js"));
var _index23 = _interopRequireDefault(require("date-fns/isSameYear/index.js"));
var _index24 = _interopRequireDefault(require("date-fns/isSameMonth/index.js"));
var _index25 = _interopRequireDefault(require("date-fns/isSameHour/index.js"));
var _index26 = _interopRequireDefault(require("date-fns/isValid/index.js"));
var _index27 = _interopRequireDefault(require("date-fns/parse/index.js"));
var _index28 = _interopRequireDefault(require("date-fns/setDate/index.js"));
var _index29 = _interopRequireDefault(require("date-fns/setHours/index.js"));
var _index30 = _interopRequireDefault(require("date-fns/setMinutes/index.js"));
var _index31 = _interopRequireDefault(require("date-fns/setMonth/index.js"));
var _index32 = _interopRequireDefault(require("date-fns/setSeconds/index.js"));
var _index33 = _interopRequireDefault(require("date-fns/setMilliseconds/index.js"));
var _index34 = _interopRequireDefault(require("date-fns/setYear/index.js"));
var _index35 = _interopRequireDefault(require("date-fns/startOfDay/index.js"));
var _index36 = _interopRequireDefault(require("date-fns/startOfMonth/index.js"));
var _index37 = _interopRequireDefault(require("date-fns/endOfMonth/index.js"));
var _index38 = _interopRequireDefault(require("date-fns/startOfWeek/index.js"));
var _index39 = _interopRequireDefault(require("date-fns/startOfYear/index.js"));
var _index40 = _interopRequireDefault(require("date-fns/isWithinInterval/index.js"));
var _index41 = _interopRequireDefault(require("date-fns/locale/en-US/index.js"));
var _index42 = _interopRequireDefault(require("date-fns/_lib/format/longFormatters/index.js"));
var _AdapterDateFnsBase = require("../AdapterDateFnsBase");
// date-fns@<3 has no exports field defined
// See https://github.com/date-fns/date-fns/issues/1781
/* eslint-disable import/extensions, class-methods-use-this */
/* v8 ignore start */
// @ts-nocheck

/* v8 ignore end */

/**
 * Based on `@date-io/date-fns`
 *
 * MIT License
 *
 * Copyright (c) 2017 Dmitriy Kovalenko
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
class AdapterDateFns extends _AdapterDateFnsBase.AdapterDateFnsBase {
  constructor({
    locale,
    formats
  } = {}) {
    /* v8 ignore start */
    if (process.env.NODE_ENV !== 'production') {
      if (typeof _index.default !== 'function') {
        throw new Error(['MUI: This adapter is only compatible with `date-fns` v2.x package versions.', 'Please, install v2.x of the package or use the `AdapterDateFns` instead.'].join('\n'));
      }
    }
    /* v8 ignore stop */
    super({
      locale: locale ?? _index41.default,
      formats,
      longFormatters: _index42.default
    });
    this.parse = (value, format) => {
      if (value === '') {
        return null;
      }
      return (0, _index27.default)(value, format, new Date(), {
        locale: this.locale
      });
    };
    this.isValid = value => {
      if (value == null) {
        return false;
      }
      return (0, _index26.default)(value);
    };
    this.format = (value, formatKey) => {
      return this.formatByString(value, this.formats[formatKey]);
    };
    this.formatByString = (value, formatString) => {
      return (0, _index1.default)(value, formatString, {
        locale: this.locale
      });
    };
    this.isEqual = (value, comparing) => {
      if (value === null && comparing === null) {
        return true;
      }
      if (value === null || comparing === null) {
        return false;
      }
      return (0, _index21.default)(value, comparing);
    };
    this.isSameYear = (value, comparing) => {
      return (0, _index23.default)(value, comparing);
    };
    this.isSameMonth = (value, comparing) => {
      return (0, _index24.default)(value, comparing);
    };
    this.isSameDay = (value, comparing) => {
      return (0, _index22.default)(value, comparing);
    };
    this.isSameHour = (value, comparing) => {
      return (0, _index25.default)(value, comparing);
    };
    this.isAfter = (value, comparing) => {
      return (0, _index19.default)(value, comparing);
    };
    this.isAfterYear = (value, comparing) => {
      return (0, _index19.default)(value, (0, _index0.default)(comparing));
    };
    this.isAfterDay = (value, comparing) => {
      return (0, _index19.default)(value, (0, _index8.default)(comparing));
    };
    this.isBefore = (value, comparing) => {
      return (0, _index20.default)(value, comparing);
    };
    this.isBeforeYear = (value, comparing) => {
      return (0, _index20.default)(value, this.startOfYear(comparing));
    };
    this.isBeforeDay = (value, comparing) => {
      return (0, _index20.default)(value, this.startOfDay(comparing));
    };
    this.isWithinRange = (value, [start, end]) => {
      return (0, _index40.default)(value, {
        start,
        end
      });
    };
    this.startOfYear = value => {
      return (0, _index39.default)(value);
    };
    this.startOfMonth = value => {
      return (0, _index36.default)(value);
    };
    this.startOfWeek = value => {
      return (0, _index38.default)(value, {
        locale: this.locale
      });
    };
    this.startOfDay = value => {
      return (0, _index35.default)(value);
    };
    this.endOfYear = value => {
      return (0, _index0.default)(value);
    };
    this.endOfMonth = value => {
      return (0, _index37.default)(value);
    };
    this.endOfWeek = value => {
      return (0, _index9.default)(value, {
        locale: this.locale
      });
    };
    this.endOfDay = value => {
      return (0, _index8.default)(value);
    };
    this.addYears = (value, amount) => {
      return (0, _index7.default)(value, amount);
    };
    this.addMonths = (value, amount) => {
      return (0, _index6.default)(value, amount);
    };
    this.addWeeks = (value, amount) => {
      return (0, _index5.default)(value, amount);
    };
    this.addDays = (value, amount) => {
      return (0, _index.default)(value, amount);
    };
    this.addHours = (value, amount) => {
      return (0, _index4.default)(value, amount);
    };
    this.addMinutes = (value, amount) => {
      return (0, _index3.default)(value, amount);
    };
    this.addSeconds = (value, amount) => {
      return (0, _index2.default)(value, amount);
    };
    this.getYear = value => {
      return (0, _index18.default)(value);
    };
    this.getMonth = value => {
      return (0, _index14.default)(value);
    };
    this.getDate = value => {
      return (0, _index10.default)(value);
    };
    this.getHours = value => {
      return (0, _index12.default)(value);
    };
    this.getMinutes = value => {
      return (0, _index13.default)(value);
    };
    this.getSeconds = value => {
      return (0, _index15.default)(value);
    };
    this.getMilliseconds = value => {
      return (0, _index16.default)(value);
    };
    this.setYear = (value, year) => {
      return (0, _index34.default)(value, year);
    };
    this.setMonth = (value, month) => {
      return (0, _index31.default)(value, month);
    };
    this.setDate = (value, date) => {
      return (0, _index28.default)(value, date);
    };
    this.setHours = (value, hours) => {
      return (0, _index29.default)(value, hours);
    };
    this.setMinutes = (value, minutes) => {
      return (0, _index30.default)(value, minutes);
    };
    this.setSeconds = (value, seconds) => {
      return (0, _index32.default)(value, seconds);
    };
    this.setMilliseconds = (value, milliseconds) => {
      return (0, _index33.default)(value, milliseconds);
    };
    this.getDaysInMonth = value => {
      return (0, _index11.default)(value);
    };
    this.getWeekArray = value => {
      const start = this.startOfWeek(this.startOfMonth(value));
      const end = this.endOfWeek(this.endOfMonth(value));
      let count = 0;
      let current = start;
      const nestedWeeks = [];
      while (this.isBefore(current, end)) {
        const weekNumber = Math.floor(count / 7);
        nestedWeeks[weekNumber] = nestedWeeks[weekNumber] || [];
        nestedWeeks[weekNumber].push(current);
        current = this.addDays(current, 1);
        count += 1;
      }
      return nestedWeeks;
    };
    this.getWeekNumber = value => {
      return (0, _index17.default)(value, {
        locale: this.locale
      });
    };
    this.getYearRange = ([start, end]) => {
      const startDate = this.startOfYear(start);
      const endDate = this.endOfYear(end);
      const years = [];
      let current = startDate;
      while (this.isBefore(current, endDate)) {
        years.push(current);
        current = this.addYears(current, 1);
      }
      return years;
    };
  }
}
exports.AdapterDateFns = AdapterDateFns;