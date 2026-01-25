import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Helpers for the Date Logic
export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', TIME_FORMAT_OPTIONS);
}

export const getRelativeTime = (dateString: string) => {
    const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });
    const diff = new Date(dateString).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Heute';
    if (days === 1) return 'Morgen';
    if (days > 1 && days < 7) return rtf.format(days, 'day');
    return formatDate(dateString);
}
