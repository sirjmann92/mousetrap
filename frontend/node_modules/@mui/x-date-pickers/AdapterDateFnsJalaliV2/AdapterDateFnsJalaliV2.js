"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdapterDateFnsJalali = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _index = _interopRequireDefault(require("date-fns-jalali/addSeconds/index.js"));
var _index2 = _interopRequireDefault(require("date-fns-jalali/addMinutes/index.js"));
var _index3 = _interopRequireDefault(require("date-fns-jalali/addHours/index.js"));
var _index4 = _interopRequireDefault(require("date-fns-jalali/addDays/index.js"));
var _index5 = _interopRequireDefault(require("date-fns-jalali/addWeeks/index.js"));
var _index6 = _interopRequireDefault(require("date-fns-jalali/addMonths/index.js"));
var _index7 = _interopRequireDefault(require("date-fns-jalali/addYears/index.js"));
var _index8 = _interopRequireDefault(require("date-fns-jalali/endOfDay/index.js"));
var _index9 = _interopRequireDefault(require("date-fns-jalali/endOfWeek/index.js"));
var _index0 = _interopRequireDefault(require("date-fns-jalali/endOfYear/index.js"));
var _index1 = _interopRequireDefault(require("date-fns-jalali/format/index.js"));
var _index10 = _interopRequireDefault(require("date-fns-jalali/getHours/index.js"));
var _index11 = _interopRequireDefault(require("date-fns-jalali/getSeconds/index.js"));
var _index12 = _interopRequireDefault(require("date-fns-jalali/getMilliseconds/index.js"));
var _index13 = _interopRequireDefault(require("date-fns-jalali/getWeek/index.js"));
var _index14 = _interopRequireDefault(require("date-fns-jalali/getYear/index.js"));
var _index15 = _interopRequireDefault(require("date-fns-jalali/getMonth/index.js"));
var _index16 = _interopRequireDefault(require("date-fns-jalali/getDate/index.js"));
var _index17 = _interopRequireDefault(require("date-fns-jalali/getDaysInMonth/index.js"));
var _index18 = _interopRequireDefault(require("date-fns-jalali/getMinutes/index.js"));
var _index19 = _interopRequireDefault(require("date-fns-jalali/isAfter/index.js"));
var _index20 = _interopRequireDefault(require("date-fns-jalali/isBefore/index.js"));
var _index21 = _interopRequireDefault(require("date-fns-jalali/isEqual/index.js"));
var _index22 = _interopRequireDefault(require("date-fns-jalali/isSameDay/index.js"));
var _index23 = _interopRequireDefault(require("date-fns-jalali/isSameYear/index.js"));
var _index24 = _interopRequireDefault(require("date-fns-jalali/isSameMonth/index.js"));
var _index25 = _interopRequireDefault(require("date-fns-jalali/isSameHour/index.js"));
var _index26 = _interopRequireDefault(require("date-fns-jalali/isValid/index.js"));
var _index27 = _interopRequireDefault(require("date-fns-jalali/parse/index.js"));
var _index28 = _interopRequireDefault(require("date-fns-jalali/setDate/index.js"));
var _index29 = _interopRequireDefault(require("date-fns-jalali/setHours/index.js"));
var _index30 = _interopRequireDefault(require("date-fns-jalali/setMinutes/index.js"));
var _index31 = _interopRequireDefault(require("date-fns-jalali/setMonth/index.js"));
var _index32 = _interopRequireDefault(require("date-fns-jalali/setSeconds/index.js"));
var _index33 = _interopRequireDefault(require("date-fns-jalali/setMilliseconds/index.js"));
var _index34 = _interopRequireDefault(require("date-fns-jalali/setYear/index.js"));
var _index35 = _interopRequireDefault(require("date-fns-jalali/startOfDay/index.js"));
var _index36 = _interopRequireDefault(require("date-fns-jalali/startOfMonth/index.js"));
var _index37 = _interopRequireDefault(require("date-fns-jalali/endOfMonth/index.js"));
var _index38 = _interopRequireDefault(require("date-fns-jalali/startOfWeek/index.js"));
var _index39 = _interopRequireDefault(require("date-fns-jalali/startOfYear/index.js"));
var _index40 = _interopRequireDefault(require("date-fns-jalali/isWithinInterval/index.js"));
var _index41 = _interopRequireDefault(require("date-fns-jalali/locale/fa-IR/index.js"));
var _index42 = _interopRequireDefault(require("date-fns-jalali/_lib/format/longFormatters/index.js"));
var _AdapterDateFnsBase = require("../AdapterDateFnsBase");
// date-fns-jalali@<3 has no exports field defined
// See https://github.com/date-fns/date-fns/issues/1781
/* eslint-disable import/extensions, class-methods-use-this */
/* v8 ignore start */
// @ts-nocheck

/* v8 ignore end */

const defaultFormats = {
  year: 'yyyy',
  month: 'LLLL',
  monthShort: 'MMM',
  dayOfMonth: 'd',
  dayOfMonthFull: 'do',
  weekday: 'EEEE',
  weekdayShort: 'EEEEEE',
  hours24h: 'HH',
  hours12h: 'hh',
  meridiem: 'aa',
  minutes: 'mm',
  seconds: 'ss',
  fullDate: 'PPP',
  keyboardDate: 'P',
  shortDate: 'd MMM',
  normalDate: 'd MMMM',
  normalDateWithWeekday: 'EEE, d MMMM',
  fullTime12h: 'hh:mm aaa',
  fullTime24h: 'HH:mm',
  keyboardDateTime12h: 'P hh:mm aa',
  keyboardDateTime24h: 'P HH:mm'
};
const NUMBER_SYMBOL_MAP = {
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',
  '0': '۰'
};
/**
 * Based on `@date-io/date-fns-jalali`
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
class AdapterDateFnsJalali extends _AdapterDateFnsBase.AdapterDateFnsBase {
  constructor({
    locale,
    formats
  } = {}) {
    /* v8 ignore start */
    if (process.env.NODE_ENV !== 'production') {
      if (typeof _index4.default !== 'function') {
        throw new Error(['MUI: This adapter is only compatible with `date-fns-jalali` v2.x package versions.', 'Please, install v2.x of the package or use the `AdapterDateFnsJalali` instead.'].join('\n'));
      }
    }
    /* v8 ignore stop */
    super({
      locale: locale ?? _index41.default,
      // some formats are different in jalali adapter,
      // this ensures that `AdapterDateFnsBase` formats are overridden
      formats: (0, _extends2.default)({}, defaultFormats, formats),
      longFormatters: _index42.default,
      lib: 'date-fns-jalali'
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
    this.formatNumber = numberToFormat => {
      return numberToFormat.replace(/\d/g, match => NUMBER_SYMBOL_MAP[match]).replace(/,/g, '،');
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
      return (0, _index19.default)(value, this.endOfYear(comparing));
    };
    this.isAfterDay = (value, comparing) => {
      return (0, _index19.default)(value, this.endOfDay(comparing));
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
      return (0, _index4.default)(value, amount);
    };
    this.addHours = (value, amount) => {
      return (0, _index3.default)(value, amount);
    };
    this.addMinutes = (value, amount) => {
      return (0, _index2.default)(value, amount);
    };
    this.addSeconds = (value, amount) => {
      return (0, _index.default)(value, amount);
    };
    this.getYear = value => {
      return (0, _index14.default)(value);
    };
    this.getMonth = value => {
      return (0, _index15.default)(value);
    };
    this.getDate = value => {
      return (0, _index16.default)(value);
    };
    this.getHours = value => {
      return (0, _index10.default)(value);
    };
    this.getMinutes = value => {
      return (0, _index18.default)(value);
    };
    this.getSeconds = value => {
      return (0, _index11.default)(value);
    };
    this.getMilliseconds = value => {
      return (0, _index12.default)(value);
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
      return (0, _index17.default)(value);
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
    this.getWeekNumber = date => {
      return (0, _index13.default)(date, {
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
exports.AdapterDateFnsJalali = AdapterDateFnsJalali;