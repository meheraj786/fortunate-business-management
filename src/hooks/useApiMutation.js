import { useMutation } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/utils/notifications";

/**
 * A custom hook for API mutations that handles success and error toasts automatically.
 *
 * @param {Object} options - The options for the mutation.
 * @param {Function} options.mutationFn - The asynchronous mutation function.
 * @param {string} [options.successMessage] - A custom success message to display. If not provided, it will try to use `data.message` from the response.
 * @param {Function} [options.onSuccess] - An optional callback to run on success, after the toast has been shown.
 * @param {Function} [options.onError] - An optional callback to run on error, after the toast has been shown.
 * @returns The result of the useMutation hook.
 */
export const useApiMutation = ({
  mutationFn,
  successMessage,
  ...options
}) => {
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Show success toast
      const message = successMessage || (data && data.message) || "Operation successful!";
      showSuccessToast(message);

      // Call original onSuccess if it exists
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Show error toast
      showErrorToast(error);

      // Call original onError if it exists
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};