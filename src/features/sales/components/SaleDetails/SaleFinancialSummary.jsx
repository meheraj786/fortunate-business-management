import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Truck, CreditCard } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSettings } from "@/context/SettingsContext";
import ValueSkeleton from "@/components/ui/ValueSkeleton";

const SaleFinancialSummary = ({
  sale,
  totalPayments,
  balanceDue,
  canAddPayment,
  hasPermission,
  onAddPaymentClick,
  loading = false,
}) => {
  const { formatCurrency } = useSettings();
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Financial Summary
        </h2>
        {hasPermission("SALE_ADD_PAYMENT") && canAddPayment && (
          <Button
            onClick={onAddPaymentClick}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Add Payment
          </Button>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            {loading ? (
              <ValueSkeleton width="w-20" height="h-4" />
            ) : (
              formatCurrency(sale?.totalAmount)
            )}
          </span>
        </div>
        <AnimatePresence initial={false}>
          {sale?.charges?.map((charge, i) => (
            <motion.div
              key={`charge-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="flex justify-between items-center py-2"
            >
              <span className="text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                {charge.name}
              </span>
              <span className="font-medium">
                {formatCurrency(charge.amount)}
              </span>
            </motion.div>
          ))}
          {sale?.costs?.map((cost, i) => (
            <motion.div
              key={`cost-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="flex justify-between items-center py-2"
            >
              <span className="text-gray-600 flex items-center">
                <Truck className="h-4 w-4 mr-2 text-gray-400" />
                {cost.name}
              </span>
              <span className="font-medium">{formatCurrency(cost.amount)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {sale?.discount > 0 && (
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-[var(--color-success)]">
              -{formatCurrency(sale?.discount)}
            </span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
          <span className="text-gray-900">Net Amount</span>
          <span className="text-gray-900">
            {loading ? (
              <ValueSkeleton width="w-24" height="h-5" />
            ) : (
              formatCurrency(sale?.totalAmountToBePaid)
            )}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Payments Made</span>
          <span className="font-medium">
            {loading ? (
              <ValueSkeleton width="w-20" height="h-4" />
            ) : (
              formatCurrency(totalPayments)
            )}
          </span>
        </div>
        <div
          className={`border-t border-gray-200 pt-3 flex justify-between items-center text-lg font-semibold ${
            balanceDue > 0
              ? "text-[var(--color-danger)]"
              : "text-[var(--color-success)]"
          }`}
        >
          <span>{balanceDue > 0 ? "Balance Due" : "Overpayment"}</span>
          <span>
            {loading ? (
              <ValueSkeleton width="w-24" height="h-6" />
            ) : (
              formatCurrency(Math.abs(balanceDue))
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SaleFinancialSummary;
