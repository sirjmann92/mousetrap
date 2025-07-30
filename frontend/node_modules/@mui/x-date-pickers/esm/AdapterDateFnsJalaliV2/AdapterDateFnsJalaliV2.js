import _extends from "@babel/runtime/helpers/esm/extends";
// date-fns-jalali@<3 has no exports field defined
// See https://github.com/date-fns/date-fns/issues/1781
/* eslint-disable import/extensions, class-methods-use-this */
/* v8 ignore start */
// @ts-nocheck
import addSeconds from 'date-fns-jalali/addSeconds/index.js';
import addMinutes from 'date-fns-jalali/addMinutes/index.js';
import addHours from 'date-fns-jalali/addHours/index.js';
import addDays from 'date-fns-jalali/addDays/index.js';
import addWeeks from 'date-fns-jalali/addWeeks/index.js';
import addMonths from 'date-fns-jalali/addMonths/index.js';
import addYears from 'date-fns-jalali/addYears/index.js';
import endOfDay from 'date-fns-jalali/endOfDay/index.js';
import endOfWeek from 'date-fns-jalali/endOfWeek/index.js';
import endOfYear from 'date-fns-jalali/endOfYear/index.js';
import dateFnsFormat from 'date-fns-jalali/format/index.js';
import getHours from 'date-fns-jalali/getHours/index.js';
import getSeconds from 'date-fns-jalali/getSeconds/index.js';
import getMilliseconds from 'date-fns-jalali/getMilliseconds/index.js';
import getWeek from 'date-fns-jalali/getWeek/index.js';
import getYear from 'date-fns-jalali/getYear/index.js';
import getMonth from 'date-fns-jalali/getMonth/index.js';
import getDate from 'date-fns-jalali/getDate/index.js';
import getDaysInMonth from 'date-fns-jalali/getDaysInMonth/index.js';
import getMinutes from 'date-fns-jalali/getMinutes/index.js';
import isAfter from 'date-fns-jalali/isAfter/index.js';
import isBefore from 'date-fns-jalali/isBefore/index.js';
import isEqual from 'date-fns-jalali/isEqual/index.js';
import isSameDay from 'date-fns-jalali/isSameDay/index.js';
import isSameYear from 'date-fns-jalali/isSameYear/index.js';
import isSameMonth from 'date-fns-jalali/isSameMonth/index.js';
import isSameHour from 'date-fns-jalali/isSameHour/index.js';
import isValid from 'date-fns-jalali/isValid/index.js';
import dateFnsParse from 'date-fns-jalali/parse/index.js';
import setDate from 'date-fns-jalali/setDate/index.js';
import setHours from 'date-fns-jalali/setHours/index.js';
import setMinutes from 'date-fns-jalali/setMinutes/index.js';
import setMonth from 'date-fns-jalali/setMonth/index.js';
import setSeconds from 'date-fns-jalali/setSeconds/index.js';
import setMilliseconds from 'date-fns-jalali/setMilliseconds/index.js';
import setYear from 'date-fns-jalali/setYear/index.js';
import startOfDay from 'date-fns-jalali/startOfDay/index.js';
import startOfMonth from 'date-fns-jalali/startOfMonth/index.js';
import endOfMonth from 'date-fns-jalali/endOfMonth/index.js';
import startOfWeek from 'date-fns-jalali/startOfWeek/index.js';
import startOfYear from 'date-fns-jalali/startOfYear/index.js';
import isWithinInterval from 'date-fns-jalali/isWithinInterval/index.js';
import defaultLocale from 'date-fns-jalali/locale/fa-IR/index.js';
import longFormatters from 'date-fns-jalali/_lib/format/longFormatters/index.js';
/* v8 ignore end */

import { AdapterDateFnsBase } from "../AdapterDateFnsBase/index.js";
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
export class AdapterDateFnsJalali extends AdapterDateFnsBase {
  constructor({
    locale,
    formats
  } = {}) {
    /* v8 ignore start */
    if (process.env.NODE_ENV !== 'production') {
      if (typeof addDays !== 'function') {
        throw new Error(['MUI: This adapter is only compatible with `date-fns-jalali` v2.x package versions.', 'Please, install v2.x of the package or use the `AdapterDateFnsJalali` instead.'].join('\n'));
      }
    }
    /* v8 ignore stop */
    super({
      locale: locale ?? defaultLocale,
      // some formats are different in jalali adapter,
      // this ensures that `AdapterDateFnsBase` formats are overridden
      formats: _extends({}, defaultFormats, formats),
      longFormatters,
      lib: 'date-fns-jalali'
    });
    this.parse = (value, format) => {
      if (value === '') {
        return null;
      }
      return dateFnsParse(value, format, new Date(), {
        locale: this.locale
      });
    };
    this.isValid = value => {
      if (value == null) {
        return false;
      }
      return isValid(value);
    };
    this.format = (value, formatKey) => {
      return this.formatByString(value, this.formats[formatKey]);
    };
    this.formatByString = (value, formatString) => {
      return dateFnsFormat(value, formatString, {
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
      return isEqual(value, comparing);
    };
    this.isSameYear = (value, comparing) => {
      return isSameYear(value, comparing);
    };
    this.isSameMonth = (value, comparing) => {
      return isSameMonth(value, comparing);
    };
    this.isSameDay = (value, comparing) => {
      return isSameDay(value, comparing);
    };
    this.isSameHour = (value, comparing) => {
      return isSameHour(value, comparing);
    };
    this.isAfter = (value, comparing) => {
      return isAfter(value, comparing);
    };
    this.isAfterYear = (value, comparing) => {
      return isAfter(value, this.endOfYear(comparing));
    };
    this.isAfterDay = (value, comparing) => {
      return isAfter(value, this.endOfDay(comparing));
    };
    this.isBefore = (value, comparing) => {
      return isBefore(value, comparing);
    };
    this.isBeforeYear = (value, comparing) => {
      return isBefore(value, this.startOfYear(comparing));
    };
    this.isBeforeDay = (value, comparing) => {
      return isBefore(value, this.startOfDay(comparing));
    };
    this.isWithinRange = (value, [start, end]) => {
      return isWithinInterval(value, {
        start,
        end
      });
    };
    this.startOfYear = value => {
      return startOfYear(value);
    };
    this.startOfMonth = value => {
      return startOfMonth(value);
    };
    this.startOfWeek = value => {
      return startOfWeek(value, {
        locale: this.locale
      });
    };
    this.startOfDay = value => {
      return startOfDay(value);
    };
    this.endOfYear = value => {
      return endOfYear(value);
    };
    this.endOfMonth = value => {
      return endOfMonth(value);
    };
    this.endOfWeek = value => {
      return endOfWeek(value, {
        locale: this.locale
      });
    };
    this.endOfDay = value => {
      return endOfDay(value);
    };
    this.addYears = (value, amount) => {
      return addYears(value, amount);
    };
    this.addMonths = (value, amount) => {
      return addMonths(value, amount);
    };
    this.addWeeks = (value, amount) => {
      return addWeeks(value, amount);
    };
    this.addDays = (value, amount) => {
      return addDays(value, amount);
    };
    this.addHours = (value, amount) => {
      return addHours(value, amount);
    };
    this.addMinutes = (value, amount) => {
      return addMinutes(value, amount);
    };
    this.addSeconds = (value, amount) => {
      return addSeconds(value, amount);
    };
    this.getYear = value => {
      return getYear(value);
    };
    this.getMonth = value => {
      return getMonth(value);
    };
    this.getDate = value => {
      return getDate(value);
    };
    this.getHours = value => {
      return getHours(value);
    };
    this.getMinutes = value => {
      return getMinutes(value);
    };
    this.getSeconds = value => {
      return getSeconds(value);
    };
    this.getMilliseconds = value => {
      return getMilliseconds(value);
    };
    this.setYear = (value, year) => {
      return setYear(value, year);
    };
    this.setMonth = (value, month) => {
      return setMonth(value, month);
    };
    this.setDate = (value, date) => {
      return setDate(value, date);
    };
    this.setHours = (value, hours) => {
      return setHours(value, hours);
    };
    this.setMinutes = (value, minutes) => {
      return setMinutes(value, minutes);
    };
    this.setSeconds = (value, seconds) => {
      return setSeconds(value, seconds);
    };
    this.setMilliseconds = (value, milliseconds) => {
      return setMilliseconds(value, milliseconds);
    };
    this.getDaysInMonth = value => {
      return getDaysInMonth(value);
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
      return getWeek(date, {
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