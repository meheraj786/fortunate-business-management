/**
 * Returns the current date in YYYY-MM-DD format based on the business timezone.
 * Uses Intl.DateTimeFormat to avoid external dependencies for basic timezone handling.
 * @param {string} timezone - The IANA timezone identifier (e.g., "Asia/Dhaka")
 * @returns {string} - Date string in "YYYY-MM-DD" format
 */
export const getBusinessDateISO = (timezone = "Asia/Dhaka") => {
    try {
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        return formatter.format(new Date());
    } catch (error) {
        console.error("Invalid timezone:", timezone, error);
        // Fallback to local time if timezone is invalid
        return new Date().toISOString().split("T")[0];
    }
};

/**
 * Formats a date string or Date object into a detailed string with timezone info
 * @param {string|Date} date - The date to format
 * @param {string} timezone - The IANA timezone identifier
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatInTimezone = (date, timezone = "Asia/Dhaka", options = {}) => {
    if (!date) return "";
    try {
        const dateObj = new Date(date);
        return new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            ...options,
        }).format(dateObj);
    } catch (error) {
        console.error("Date formatting error:", error);
        return "";
    }
};

/**
 * Returns the current date and time in YYYY-MM-DDTHH:mm format based on the business timezone.
 * Suitable for datetime-local inputs.
 * @param {string} timezone - The IANA timezone identifier
 * @returns {string}
 */
export const getBusinessDateTimeISO = (timezone = "Asia/Dhaka") => {
    try {
        const now = new Date();
        // Get parts in business timezone
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        // Format: 2024-02-14, 23:45
        const parts = formatter.formatToParts(now);
        const getPart = (type) => parts.find(p => p.type === type)?.value;

        return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
    } catch (error) {
        console.error("Error getting business datetime:", error);
        // Fallback to local
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    }
};
