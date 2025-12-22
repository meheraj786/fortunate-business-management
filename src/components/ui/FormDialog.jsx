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
  isPrimaryButtonDisabled = false,
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
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onSubmit}
                disabled={isPrimaryButtonDisabled}
                className="cursor-pointer inline-flex w-full justify-center rounded-md bg-[#003b75] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#002855] disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
              >
                {primaryButtonText}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto "
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
