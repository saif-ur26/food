// Time-based utilities for ordering restrictions
export const ORDER_CUTOFF_HOUR = 17; // 5 PM (24-hour format)

export const getCurrentTime = (): Date => {
    return new Date();
};

export const isOrderingAllowed = (): boolean => {
    const now = getCurrentTime();
    const currentHour = now.getHours();
    return currentHour < ORDER_CUTOFF_HOUR;
};

export const getNextOrderingTime = (): string => {
    const now = getCurrentTime();
    const currentHour = now.getHours();

    if (currentHour >= ORDER_CUTOFF_HOUR) {
        // If it's after 5 PM, next ordering is tomorrow at 12 AM
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }

    return 'today';
};

export const getTimeUntilCutoff = (): string => {
    const now = getCurrentTime();
    const cutoffTime = new Date(now);
    cutoffTime.setHours(ORDER_CUTOFF_HOUR, 0, 0, 0);

    if (now >= cutoffTime) {
        return 'Ordering closed for today';
    }

    const timeDiff = cutoffTime.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursLeft > 0) {
        return `${hoursLeft}h ${minutesLeft}m left to order for today`;
    } else {
        return `${minutesLeft}m left to order for today`;
    }
};