import toast from "react-hot-toast";

/**
 * Handles API errors and displays a toast notification.
 * It intelligently prioritizes the error message from the backend response,
 * falling back to a default message if one isn't available.
 *
 * @param {Error | { response?: { data?: { message?: string } } }} error - The error object from a try-catch block.
 * @param {string} [defaultMessage] - A fallback message for when the backend doesn't provide one.
 */
export const handleError = (error, defaultMessage = "An unexpected error occurred.") => {
  let message;

  // Prioritize the specific message from the backend
  if (error && error.response && error.response.data && error.response.data.message) {
    message = error.response.data.message;
  } else {
    // Fallback to the default message for network errors or other exceptions
    message = defaultMessage;
  }

  toast.error(message);

  // Log the full error for debugging purposes
  console.error("API Error caught by handleError:", error);
};
