import toast from "react-hot-toast";

/**
 * A utility to consistently display toast notifications.
 */

/**
 * Displays a success toast.
 * @param {string} message - The message to display.
 * @param {object} options - Options to pass to react-hot-toast.
 */
export const showSuccessToast = (message, options) => {
  toast.success(message, options);
};

/**
 * Displays an error toast, intelligently parsing the error object.
 * @param {any} error - The error object (from an API call or elsewhere).
 * @param {string} defaultMessage - A fallback message.
 */
export const showErrorToast = (error, defaultMessage = "An unexpected error occurred.") => {
  let message = defaultMessage;

  if (typeof error === 'string') {
    message = error;
  } else if (error && error.response && error.response.data && error.response.data.message) {
    // For axios errors with a specific backend message
    message = error.response.data.message;
  } else if (error && error.message) {
    message = error.message;
  }

  toast.error(message);
  console.error("Error displayed in toast:", error);
};

/**
 * Displays a loading toast and returns its ID.
 * @param {string} message - The message to display.
 * @returns {string} The ID of the toast.
 */
export const showLoadingToast = (message = "Loading...") => {
  return toast.loading(message);
};

/**
 * Dismisses a toast by its ID.
 * @param {string} toastId - The ID of the toast to dismiss.
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
