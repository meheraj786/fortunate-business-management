import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Button from "./Button"; // Import the new Button component

export default function FormDialog({
  open,
  onClose,
  title,
  children,
  primaryButtonText,
  secondaryButtonText,
  onSubmit,
  isPrimaryButtonDisabled = false,
  isSubmitting = false, // New prop for loading state
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in z-40"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:opacity-0 data-closed:scale-95 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 "
          >
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-center sm:mt-0">
                <DialogTitle
                  as="h3"
                  className="text-xl font-semibold text-gray-900 "
                >
                  {title}
                </DialogTitle>
                <div className="mt-4">{children}</div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-3">
              {primaryButtonText && (
                <Button
                  type="submit" // Changed to submit as it's typically used in forms
                  onClick={onSubmit}
                  disabled={isPrimaryButtonDisabled || isSubmitting}
                  isLoading={isSubmitting}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  {primaryButtonText}
                </Button>
              )}
              {secondaryButtonText && (
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  variant="secondary"
                  className="w-full sm:w-auto mt-3 sm:mt-0"
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
