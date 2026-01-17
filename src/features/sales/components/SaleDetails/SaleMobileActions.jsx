import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, XCircle, Trash2, Printer, CreditCard } from "lucide-react";
import Button from "@/components/ui/Button";

const SaleMobileActions = ({
  isOpen,
  onClose,
  hasPermission,
  sale,
  isCancelled,
  canAddPayment,
  onUpdateClick,
  onCancelClick,
  onDeleteClick,
  onGenerateInvoiceClick,
  onAddPaymentClick,
  deleteLoading,
  cancelLoading,
  generateInvoiceLoading,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 z-40 bg-gray-900/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-semibold text-gray-900">
                Sale Actions
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {hasPermission("SALE_UPDATE") && (
                <Button
                  onClick={() => {
                    onUpdateClick();
                    onClose();
                  }}
                  disabled={isCancelled || deleteLoading || cancelLoading}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Update Sale</span>
                </Button>
              )}
              {hasPermission("SALE_CANCEL") && (
                <Button
                  onClick={() => {
                    onCancelClick();
                    onClose();
                  }}
                  disabled={isCancelled || deleteLoading || cancelLoading}
                  variant="warning"
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Sale</span>
                </Button>
              )}
              {hasPermission("SALE_DELETE") && (
                <Button
                  onClick={() => {
                    onDeleteClick();
                    onClose();
                  }}
                  disabled={deleteLoading || cancelLoading}
                  variant="danger"
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Sale</span>
                </Button>
              )}
              {hasPermission("SALE_GENERATE_INVOICE") &&
                sale.invoiceStatus !== "Invoiced" &&
                !isCancelled && (
                  <Button
                    onClick={() => {
                      onGenerateInvoiceClick();
                      onClose();
                    }}
                    disabled={generateInvoiceLoading || isCancelled}
                    isLoading={generateInvoiceLoading}
                    variant="success"
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Generate Invoice</span>
                  </Button>
                )}
              {hasPermission("SALE_ADD_PAYMENT") && canAddPayment && (
                <Button
                  onClick={() => {
                    onAddPaymentClick();
                    onClose();
                  }}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Add Payment</span>
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaleMobileActions;
