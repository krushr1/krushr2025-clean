import {
  constructFrom,
  getDefaultOptions,
  toDate
} from "/chunks/chunk-YCSJSQP5.js";

// ../node_modules/date-fns/endOfWeek.mjs
function endOfWeek(date, options) {
  const defaultOptions = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
  _date.setDate(_date.getDate() + diff);
  _date.setHours(23, 59, 59, 999);
  return _date;
}

// ../node_modules/date-fns/isSameMonth.mjs
function isSameMonth(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  return _dateLeft.getFullYear() === _dateRight.getFullYear() && _dateLeft.getMonth() === _dateRight.getMonth();
}

// ../node_modules/date-fns/addDays.mjs
function addDays(date, amount) {
  const _date = toDate(date);
  if (isNaN(amount)) return constructFrom(date, NaN);
  if (!amount) {
    return _date;
  }
  _date.setDate(_date.getDate() + amount);
  return _date;
}

// ../shared/utils.ts
var formatDateShort = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "numeric",
    day: "numeric"
  });
};
var formatDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export {
  addDays,
  endOfWeek,
  isSameMonth,
  formatDateShort,
  formatDateTime
};
//# sourceMappingURL=/chunks/chunk-3M7GDMAS.js.map
