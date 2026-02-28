import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatTime = (iso: string) => dayjs(iso).format('h:mm A');

export const formatDateLabel = (iso: string) => {
  const date = dayjs(iso);
  if (date.isSame(dayjs(), 'day')) {
    return 'Today';
  }
  if (date.isSame(dayjs().subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }
  if (date.isSame(dayjs(), 'year')) {
    return date.format('MMMM D');
  }
  return date.format('MMM D, YYYY');
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
