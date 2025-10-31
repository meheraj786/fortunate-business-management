// /**
//  * FormDialog Component
//  *
//  * A reusable dialog component for displaying forms or other content in a modal.
//  * It provides a consistent look and feel for dialogs across the application.
//  *
//  * @param {object} props - The component's properties.
//  * @param {boolean} props.open - Controls the visibility of the dialog. True to open, false to close.
//  * @param {function} props.onClose - Callback function to be called when the dialog is requested to close (e.g., by clicking the backdrop or a close button).
//  * @param {string} props.title - The title displayed at the top of the dialog.
//  * @param {React.ReactNode} props.children - The content to be rendered inside the dialog's body. This is typically the form elements.
//  * @param {string} props.primaryButtonText - The text for the primary action button (e.g., "Submit", "Save").
//  * @param {string} props.secondaryButtonText - The text for the secondary action button (e.g., "Cancel", "Close").
//  * @param {function} props.onSubmit - Callback function to be called when the primary action button is clicked.
//  */

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function FormDialog({
  open,
  onClose,
  title,
  children,
  primaryButtonText,
  secondaryButtonText,
  onSubmit,
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full  items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="w-full relative transform overflow-hidden rounded-lg bg-black px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-white dark:outline dark:-outline-offset-1 dark:outline-black/10"
          >
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <DialogTitle
                  as="h3"
                  className="text-xl mb-6 font-semibold text-gray-900 dark:text-black"
                >
                  {title}
                </DialogTitle>
                <div className="mt-4">{children}</div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onSubmit}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 sm:ml-3 sm:w-auto dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400"
              >
                {primaryButtonText}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto dark:bg-black/10 dark:text-black dark:ring-black/10 dark:hover:bg-black/20"
              >
                {secondaryButtonText}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
