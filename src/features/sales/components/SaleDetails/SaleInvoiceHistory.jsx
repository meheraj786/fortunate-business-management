import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer } from "lucide-react";
import Button from "@/components/ui/Button";

const SaleInvoiceHistory = ({
  invoiceHistory,
  hasPermission,
  generateInvoiceLoading,
  isCancelled,
  onGenerateInvoiceClick,
  onViewInvoiceClick,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
        {hasPermission("SALE_GENERATE_INVOICE") && (
          <Button
            onClick={onGenerateInvoiceClick}
            disabled={generateInvoiceLoading}
            isLoading={generateInvoiceLoading}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>Generate New Invoice</span>
          </Button>
        )}
      </div>
      {invoiceHistory.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {invoiceHistory.map((inv) => (
              <motion.div
                key={inv._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Invoice #{inv._id.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Generated:{" "}
                    {new Date(inv.invoiceGeneratedDate).toLocaleString()}
                  </p>
                </div>
                {hasPermission("SALE_VIEW_INVOICE") && (
                  <Button
                    onClick={() => onViewInvoiceClick(inv._id)}
                    variant="subtle"
                    size="sm"
                    className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
                  >
                    View Invoice
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">
          No invoices generated yet
        </p>
      )}
    </div>
  );
};

export default SaleInvoiceHistory;
