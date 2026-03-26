import {
  WEEKEND_START_DAY,
  WEEKEND_START_HOUR,
  WEEKEND_START_MINUTE,
  WEEKEND_END_DAY,
  WEEKEND_END_HOUR,
  WEEKEND_END_MINUTE
} from './constants.js';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export class WeekendCountdown {
  constructor(board, nowProvider = () => new Date()) {
    this.board = board;
    this.nowProvider = nowProvider;
    this._timer = null;
    this._lastRenderKey = null;
  }

  start() {
    this.render(true);

    this._timer = setInterval(() => {
      const renderKey = this._getRenderKey(this.nowProvider());
      if (renderKey !== this._lastRenderKey && !this.board.isTransitioning) {
        this.render();
      }
    }, 1000);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  render(force = false) {
    const now = this.nowProvider();
    const renderKey = this._getRenderKey(now);

    if (!force && renderKey === this._lastRenderKey) {
      return;
    }

    this.board.displayMessage(this._buildLines(now));
    this._lastRenderKey = renderKey;
  }

  _getRenderKey(now) {
    return [
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes()
    ].join('-');
  }

  _buildLines(now) {
    const currentWeekendStart = getMostRecentOccurrence(
      now,
      WEEKEND_START_DAY,
      WEEKEND_START_HOUR,
      WEEKEND_START_MINUTE
    );
    const currentWeekendEnd = getWeekendEnd(currentWeekendStart);
    const isWeekend = now >= currentWeekendStart && now < currentWeekendEnd;
    const target = isWeekend
      ? getNextOccurrence(currentWeekendStart, WEEKEND_START_DAY, WEEKEND_START_HOUR, WEEKEND_START_MINUTE)
      : getNextOccurrence(now, WEEKEND_START_DAY, WEEKEND_START_HOUR, WEEKEND_START_MINUTE);

    const countdown = getCountdownParts(target.getTime() - now.getTime());
    const targetLabel = `${DAY_LABELS[target.getDay()]} ${formatTime(target)}`;
    const counterLabel = `${pad(countdown.days)}D ${pad(countdown.hours)}H ${pad(countdown.minutes)}M`;

    if (isWeekend) {
      return [
        '',
        'ENJOY THE WEEKEND',
        'NEXT ONE IN',
        counterLabel,
        `${targetLabel} LOCAL`
      ];
    }

    return [
      '',
      'WEEKEND STARTS IN',
      counterLabel,
      `${targetLabel} LOCAL`,
      ''
    ];
  }
}

function getMostRecentOccurrence(now, day, hour, minute) {
  const occurrence = new Date(now);
  const daysSince = (now.getDay() - day + 7) % 7;

  occurrence.setDate(now.getDate() - daysSince);
  occurrence.setHours(hour, minute, 0, 0);

  if (occurrence > now) {
    occurrence.setDate(occurrence.getDate() - 7);
  }

  return occurrence;
}

function getNextOccurrence(from, day, hour, minute) {
  const occurrence = new Date(from);
  const daysUntil = (day - occurrence.getDay() + 7) % 7;

  occurrence.setDate(occurrence.getDate() + daysUntil);
  occurrence.setHours(hour, minute, 0, 0);

  if (occurrence <= from) {
    occurrence.setDate(occurrence.getDate() + 7);
  }

  return occurrence;
}

function getWeekendEnd(weekendStart) {
  const weekendEnd = new Date(weekendStart);
  const daysToEnd = (WEEKEND_END_DAY - WEEKEND_START_DAY + 7) % 7 || 7;

  weekendEnd.setDate(weekendEnd.getDate() + daysToEnd);
  weekendEnd.setHours(WEEKEND_END_HOUR, WEEKEND_END_MINUTE, 0, 0);

  return weekendEnd;
}

function getCountdownParts(milliseconds) {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

function formatTime(date) {
  const hours = date.getHours();
  const displayHour = ((hours + 11) % 12) + 1;
  const suffix = hours >= 12 ? 'PM' : 'AM';

  return `${displayHour}:${String(date.getMinutes()).padStart(2, '0')} ${suffix}`;
}

function pad(value) {
  return String(value).padStart(2, '0');
}
