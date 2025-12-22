import React, { memo, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { AlertTriangle, Loader2, X } from "lucide-react";

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
  confirmButtonTextColor = "text-white",
  cancelButtonBgColor = "bg-white",
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus on cancel button when modal opens
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!isConfirming && onClose) {
      onClose();
    }
  }, [isConfirming, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleConfirm = useCallback(() => {
    if (!isConfirming && onConfirm) {
      onConfirm();
    }
  }, [isConfirming, onConfirm]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "sm:max-w-sm";
      case "lg":
        return "sm:max-w-lg";
      case "xl":
        return "sm:max-w-xl";
      case "md":
      default:
        return "sm:max-w-md";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeOnOverlayClick ? handleClose : () => {}}
      className="relative z-50"
      onKeyDown={handleKeyDown}
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
          <DialogPanel
            transition
            className={`relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full ${getSizeClasses()} sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95`}
          >
            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                disabled={isConfirming}
                className="absolute right-3 top-3 p-1.5 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}

            <div className="sm:flex sm:items-start">
              <div
                className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${iconBgColor} sm:mx-0 sm:size-10`}
                aria-hidden="true"
              >
                <Icon className={`size-6 ${iconTextColor}`} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <DialogTitle
                  as="h3"
                  id="confirmation-modal-title"
                  className="text-base font-semibold leading-6 text-gray-900 pr-6"
                >
                  {title}
                </DialogTitle>
                <div className="mt-2">
                  <p
                    id="confirmation-modal-description"
                    className="text-sm text-gray-500"
                  >
                    {description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-3">
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold ${confirmButtonTextColor} shadow-sm ${confirmButtonBgColor} ${confirmButtonHoverBgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${confirmButtonBgColor.replace(
                  "bg-",
                  ""
                )} disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto sm:text-sm transition-colors duration-200`}
              >
                {isConfirming ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    {confirmingText}
                  </>
                ) : (
                  confirmText
                )}
              </button>

              <button
                ref={cancelButtonRef}
                type="button"
                onClick={handleClose}
                disabled={isConfirming}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto transition-colors duration-200"
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

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isConfirming: PropTypes.bool,
  confirmingText: PropTypes.string,
  icon: PropTypes.elementType,
  iconBgColor: PropTypes.string,
  iconTextColor: PropTypes.string,
  confirmButtonBgColor: PropTypes.string,
  confirmButtonHoverBgColor: PropTypes.string,
  confirmButtonTextColor: PropTypes.string,
  cancelButtonBgColor: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  closeOnOverlayClick: PropTypes.bool,
  showCloseButton: PropTypes.bool,
};

export default memo(ConfirmationModal);
