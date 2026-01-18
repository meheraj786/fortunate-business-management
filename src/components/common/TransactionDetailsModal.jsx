import React from "react";
import PropTypes from "prop-types";
import FormDialog from "@/components/ui/FormDialog";
import {
  Calendar,
  CreditCard,
  CircleDashed,
  FileText,
  Building,
  Smartphone,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";
import Button from "../ui/Button";
import { useTransaction } from "@/api/hooks/transaction";
import { useSettings } from "@/context/SettingsContext";

const getAccountDisplayName = (accountId) => {
  if (!accountId) return "N/A";

  switch (accountId.accountType) {
    case "Bank":
      return `${accountId.bankName} (${accountId.accountHolderName})`;
    case "Mobile Banking":
      return `${accountId.serviceName} (${accountId.accountHolderName})`;
    case "Cash":
      return `${accountId.accountName} (${accountId.accountHolderName})`;
    default:
      return accountId.accountName || "N/A";
  }
};

const TransactionDetailsModal = ({ isOpen, onClose, transactionId }) => {
  // Use react-query hook to fetch transaction details
  const { data: response, isLoading, isError } = useTransaction(transactionId);
  const transaction = response?.data;
  const { formatCurrency, formatDate } = useSettings();

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "Bank":
        return <Building className="w-4 h-4" />;
      case "Mobile Banking":
        return <Smartphone className="w-4 h-4" />;
      case "Cash":
        return <Wallet className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <FormDialog
      open={isOpen}
      onClose={onClose}
      title={transaction?.name || "Transaction Details"}
      secondaryButtonText="Close"
    >
      <div className="space-y-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="text-center py-8 text-red-500">
            Failed to load transaction details.
          </div>
        )}

        {/* Details */}
        {transaction && !isLoading && !isError && (
          <div className="space-y-4 sm:space-y-5">
            {/* Amount Banner */}
            <div
              className={`p-4 sm:p-5 rounded-lg border ${
                transaction.transactionType === "Income"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.transactionType === "Income"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {transaction.transactionType === "Income" ? (
                      <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction Type</p>
                    <p className="font-bold text-base sm:text-lg">
                      {transaction.transactionType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Info
                label="Date"
                icon={<Calendar className="w-5 h-5" />}
                value={formatDate(transaction.date)}
              />
              <Info
                label="Payment Method"
                icon={getPaymentMethodIcon(transaction.paymentMethod)}
                value={transaction.paymentMethod}
              />
              <Info
                label="Category"
                icon={<CircleDashed className="w-5 h-5" />}
                value={transaction.category}
              />
              <Info
                label="Account"
                icon={<User className="w-5 h-5" />}
                value={getAccountDisplayName(transaction.accountId)}
              />
            </div>

            {/* Description */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-base sm:text-lg">
                  Description
                </h3>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg min-h-[80px] text-sm sm:text-base">
                {transaction.description ? (
                  transaction.description
                ) : (
                  <div className="text-center text-gray-400">
                    <XCircle className="mx-auto mb-1" />
                    No description
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </FormDialog>
  );
};

const Info = ({ label, icon, value }) => (
  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1">
      {icon}
      {label}
    </div>
    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
      {value || "N/A"}
    </div>
  </div>
);

TransactionDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transactionId: PropTypes.string,
};

export default TransactionDetailsModal;
