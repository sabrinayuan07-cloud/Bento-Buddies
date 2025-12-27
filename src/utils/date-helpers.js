// Date Helper Utilities

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Format date to readable string (e.g., "Jan 15, 2025")
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format time to 12-hour format (e.g., "2:30 PM")
 */
export function formatTime(timeString) {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Format date and time together
 */
export function formatDateTime(dateString, timeString) {
    return `${formatDate(dateString)} at ${formatTime(timeString)}`;
}

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 */
export function getRelativeTime(timestamp) {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return formatDate(date);
}

/**
 * Check if date is today
 */
export function isToday(dateString) {
    return dateString === getTodayDate();
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(dateString) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateString === tomorrow.toISOString().split('T')[0];
}

/**
 * Get day of week (e.g., "Monday")
 */
export function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Get time difference in readable format
 */
export function getTimeDifference(date1, date2) {
    const diff = Math.abs(date2 - date1);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Check if a meetup time has passed
 */
export function hasMeetupPassed(dateString, timeString) {
    const [hours, minutes] = timeString.split(':');
    const meetupDate = new Date(dateString);
    meetupDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return new Date() > meetupDate;
}

/**
 * Get upcoming dates for the next N days
 */
export function getUpcomingDates(days = 7) {
    const dates = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

/**
 * Parse Firebase Timestamp to JavaScript Date
 */
export function parseFirebaseTimestamp(timestamp) {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
}

/**
 * Group items by date
 */
export function groupByDate(items, dateField = 'date') {
    const grouped = {};

    items.forEach(item => {
        const date = item[dateField];
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(item);
    });

    return grouped;
}

/**
 * Sort items by date and time
 */
export function sortByDateTime(items, dateField = 'date', timeField = 'time') {
    return items.sort((a, b) => {
        const dateA = new Date(`${a[dateField]} ${a[timeField]}`);
        const dateB = new Date(`${b[dateField]} ${b[timeField]}`);
        return dateA - dateB;
    });
}
