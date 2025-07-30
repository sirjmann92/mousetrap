"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.frFR = void 0;
var _getPickersLocalization = require("./utils/getPickersLocalization");
const views = {
  hours: 'heures',
  minutes: 'minutes',
  seconds: 'secondes',
  meridiem: 'méridien'
};
const frFRPickers = {
  // Calendar navigation
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  // View navigation
  openPreviousView: 'Ouvrir la vue précédente',
  openNextView: 'Ouvrir la vue suivante',
  calendarViewSwitchingButtonAriaLabel: view => view === 'year' ? 'La vue année est ouverte, ouvrir la vue calendrier' : 'La vue calendrier est ouverte, ouvrir la vue année',
  // DateRange labels
  start: 'Début',
  end: 'Fin',
  startDate: 'Date de début',
  startTime: 'Heure de début',
  endDate: 'Date de fin',
  endTime: 'Heure de fin',
  // Action bar
  cancelButtonLabel: 'Annuler',
  clearButtonLabel: 'Vider',
  okButtonLabel: 'OK',
  todayButtonLabel: "Aujourd'hui",
  nextStepButtonLabel: 'Suivant',
  // Toolbar titles
  datePickerToolbarTitle: 'Choisir une date',
  dateTimePickerToolbarTitle: "Choisir la date et l'heure",
  timePickerToolbarTitle: "Choisir l'heure",
  dateRangePickerToolbarTitle: 'Choisir la plage de dates',
  // timeRangePickerToolbarTitle: 'Select time range',

  // Clock labels
  clockLabelText: (view, formattedTime) => `Choix des ${views[view]}. ${!formattedTime ? 'Aucune heure choisie' : `L'heure choisie est ${formattedTime}`}`,
  hoursClockNumberText: hours => `${hours} heures`,
  minutesClockNumberText: minutes => `${minutes} minutes`,
  secondsClockNumberText: seconds => `${seconds} secondes`,
  // Digital clock labels
  selectViewText: view => `Choisir ${views[view]}`,
  // Calendar labels
  calendarWeekNumberHeaderLabel: 'Semaine',
  calendarWeekNumberHeaderText: '#',
  calendarWeekNumberAriaLabelText: weekNumber => `Semaine ${weekNumber}`,
  calendarWeekNumberText: weekNumber => `${weekNumber}`,
  // Open Picker labels
  openDatePickerDialogue: formattedDate => formattedDate ? `Choisir la date, la date sélectionnée est ${formattedDate}` : 'Choisir la date',
  openTimePickerDialogue: formattedTime => formattedTime ? `Choisir l'heure, l'heure sélectionnée est ${formattedTime}` : "Choisir l'heure",
  // openRangePickerDialogue: formattedRange => formattedRange ? `Choose range, selected range is ${formattedRange}` : 'Choose range',
  fieldClearLabel: 'Effacer la valeur',
  // Table labels
  timeTableLabel: "choix de l'heure",
  dateTableLabel: 'choix de la date',
  // Field section placeholders
  fieldYearPlaceholder: params => 'A'.repeat(params.digitAmount),
  fieldMonthPlaceholder: params => params.contentType === 'letter' ? 'MMMM' : 'MM',
  fieldDayPlaceholder: () => 'JJ',
  fieldWeekDayPlaceholder: params => params.contentType === 'letter' ? 'EEEE' : 'EE',
  fieldHoursPlaceholder: () => 'hh',
  fieldMinutesPlaceholder: () => 'mm',
  fieldSecondsPlaceholder: () => 'ss',
  fieldMeridiemPlaceholder: () => 'aa',
  // View names
  year: 'Année',
  month: 'Mois',
  day: 'Jour',
  weekDay: 'Jour de la semaine',
  hours: 'Heures',
  minutes: 'Minutes',
  seconds: 'Secondes',
  meridiem: 'Méridien',
  // Common
  empty: 'Vider'
};
const frFR = exports.frFR = (0, _getPickersLocalization.getPickersLocalization)(frFRPickers);