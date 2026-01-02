import React, { memo, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button"; // Import the new Button component

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
  variant = "danger", // New prop: 'danger' or 'primary'
  icon: Icon = AlertTriangle,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  const cancelButtonRef = useRef(null);

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

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "sm:max-w-sm";
      case "lg": return "sm:max-w-lg";
      case "xl": return "sm:max-w-xl";
      default: return "sm:max-w-md";
    }
  };

  const iconColorVariants = {
    danger: "bg-red-100 text-red-600",
    primary: "bg-blue-100 text-blue-600",
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeOnOverlayClick ? handleClose : () => {}}
      className="relative z-50"
      initialFocus={cancelButtonRef}
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto" onKeyDown={handleKeyDown}>
        <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
          <DialogPanel
            transition
            className={`relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full ${getSizeClasses()} sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95`}
          >
            {showCloseButton && (
              <Button
                  variant="subtle"
                  size="sm"
                  onClick={handleClose}
                  disabled={isConfirming}
                  className="!absolute right-2 top-2 !p-2 !rounded-full"
                  aria-label="Close modal"
              >
                  <X className="w-5 h-5" aria-hidden="true" />
              </Button>
            )}

            <div className="sm:flex sm:items-start">
              <div
                className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10 ${iconColorVariants[variant]}`}
                aria-hidden="true"
              >
                <Icon className="size-6" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <DialogTitle
                  as="h3"
                  id="confirmation-modal-title"
                  className="text-lg font-semibold leading-6 text-gray-900"
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

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse sm:gap-3">
              <Button
                variant={variant}
                onClick={onConfirm}
                isLoading={isConfirming}
                className="w-full sm:w-auto"
              >
                {isConfirming ? confirmingText : confirmText}
              </Button>

              <Button
                ref={cancelButtonRef}
                variant="secondary"
                onClick={handleClose}
                disabled={isConfirming}
                className="w-full sm:w-auto mt-3 sm:mt-0"
              >
                {cancelText}
              </Button>
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
  variant: PropTypes.oneOf(['danger', 'primary']),
  icon: PropTypes.elementType,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  closeOnOverlayClick: PropTypes.bool,
  showCloseButton: PropTypes.bool,
};

export default memo(ConfirmationModal);
