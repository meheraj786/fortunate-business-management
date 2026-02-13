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
