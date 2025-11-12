"use client";
import React from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { AlertTriangle, Loader2 } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isConfirming = false,
  confirmingText = "Confirming...",
  icon: Icon = AlertTriangle,
  iconBgColor = "bg-red-100",
  iconTextColor = "text-red-600",
  confirmButtonBgColor = "bg-red-600",
  confirmButtonHoverBgColor = "hover:bg-red-500",
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="sm:flex sm:items-start">
              <div
                className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${iconBgColor} sm:mx-0 sm:size-10`}
              >
                <Icon
                  aria-hidden="true"
                  className={`size-6 ${iconTextColor}`}
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold leading-6 text-gray-900"
                >
                  {title}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isConfirming}
                className={` cursor-pointer inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${confirmButtonBgColor} ${confirmButtonHoverBgColor} sm:ml-3 sm:w-auto disabled:opacity-50`}
              >
                {isConfirming && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isConfirming ? confirmingText : confirmText}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isConfirming}
                className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {cancelText}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmationModal;
