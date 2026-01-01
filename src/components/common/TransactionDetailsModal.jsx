import React, { useState } from "react";
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
  Hash,
  XCircle,
  Trash,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useDeleteTransaction, useTransaction } from "@/api/hooks/transaction";

const TransactionDetailsModal = ({ isOpen, onClose, transactionId }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Use react-query hook to fetch transaction details
  const { data: response, isLoading, isError } = useTransaction(transactionId);
  const transaction = response?.data;

  const deleteMutation = useDeleteTransaction();

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatCurrency = (amount) => `৳${amount?.toLocaleString("en-BD") || 0}`;

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
      hideButtons
      size="md"
      maxWidth="max-w-2xl"
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
          <div className="space-y-4">
            {/* Amount Banner */}
            <div
              className={`p-4 rounded-lg border ${
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
                      <ArrowUpRight />
                    ) : (
                      <ArrowDownRight />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction Type</p>
                    <p className="font-bold">{transaction.transactionType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Info
                label="Date"
                icon={<Calendar />}
                value={formatDate(transaction.date)}
              />
              <Info
                label="Payment Method"
                icon={getPaymentMethodIcon(transaction.paymentMethod)}
                value={transaction.paymentMethod}
              />
              <Info
                label="Category"
                icon={<CircleDashed />}
                value={transaction.category}
              />
              <Info
                label="Account"
                icon={<User />}
                value={transaction.accountId?.accountName}
              />
            </div>

            {/* Description */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Description</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg min-h-[80px]">
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

            {/* Footer */}
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                <span className="font-mono">{transaction._id}</span>
              </div>

              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 !px-3 !py-2"
              >
                <Trash className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirm Popup */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg w-full max-w-sm p-5">
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this transaction? This action
                cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    deleteMutation.mutate(transaction._id, {
                      onSuccess: () => {
                        toast.success("Transaction deleted");
                        setShowDeleteConfirm(false);
                        onClose();
                      },
                      onError: () => {
                        // The hook's default onError should already show a toast
                      },
                    });
                  }}
                  disabled={deleteMutation.isLoading}
                >
                  {deleteMutation.isLoading ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FormDialog>
  );
};

const Info = ({ label, icon, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
      {icon}
      {label}
    </div>
    <div className="font-medium text-gray-900 truncate">{value || "N/A"}</div>
  </div>
);

TransactionDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transactionId: PropTypes.string,
};

export default TransactionDetailsModal;
