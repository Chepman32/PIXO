import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getAppLocale, getStrings } from './i18n';
import { AppLocalePreference } from '../../types/models';

dayjs.extend(relativeTime);

export const formatTime = (iso: string, localePreference: AppLocalePreference = 'system') =>
  new Intl.DateTimeFormat(getAppLocale(localePreference), {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

export const formatDateLabel = (iso: string, localePreference: AppLocalePreference = 'system') => {
  const date = dayjs(iso);
  const strings = getStrings(localePreference);
  const locale = getAppLocale(localePreference);
  if (date.isSame(dayjs(), 'day')) {
    return strings.common.today;
  }
  if (date.isSame(dayjs().subtract(1, 'day'), 'day')) {
    return strings.common.yesterday;
  }
  if (date.isSame(dayjs(), 'year')) {
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      day: 'numeric',
    }).format(date.toDate());
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date.toDate());
};

export const groupByDateBucket = <T extends { createdAt: string }>(items: T[]) => {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = formatDateLabel(item.createdAt);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
};
