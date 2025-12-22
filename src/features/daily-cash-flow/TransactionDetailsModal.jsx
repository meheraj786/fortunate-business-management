import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import FormDialog from "@/components/ui/FormDialog";
import api from "@/services/apiService";
import toast from "react-hot-toast";
import {
  Loader2,
  DollarSign,
  Calendar,
  Tag,
  Info,
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  Package,
  FileText,
  User,
  Hash,
  ArrowRight,
  Link as LinkIcon,
} from "lucide-react";

const TransactionDetailsModal = ({ isOpen, onClose, transactionId }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactionDetails = useCallback(async () => {
    if (!transactionId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      if (response.data.success) {
        setTransaction(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch transaction details."
        );
      }
    } catch (err) {
      console.error("Failed to fetch transaction details:", err);
      setError("Failed to load transaction details.");
      toast.error(
        err.response?.data?.message || "Failed to load transaction details."
      );
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (isOpen) {
      fetchTransactionDetails();
    }
  }, [isOpen, fetchTransactionDetails]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT", // Assuming BDT as currency
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  const getAccountIcon = (accountType) => {
    switch (accountType) {
      case "Bank":
        return Building;
      case "Mobile Banking":
        return Smartphone;
      case "Cash":
        return Wallet;
      default:
        return CreditCard;
    }
  };

  const getTransactionIcon = (category) => {
    switch (category) {
      case "LC":
        return Package;
      case "Sales":
        return DollarSign;
      case "Salary":
        return User;
      case "Rent":
        return Home; // Assuming Home icon for Rent
      default:
        return Tag;
    }
  };

  if (!isOpen) return null;

  return (
    <FormDialog
      open={isOpen}
      onClose={onClose}
      title="Transaction Details"
      hideButtons // No action buttons needed for just displaying details
      size="lg"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-4" />
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-600">{error}</div>
      ) : transaction ? (
        <div className="space-y-6 p-2">
          {/* General Information */}
          <section className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-500" /> General Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                icon={DollarSign}
                label="Amount"
                value={formatCurrency(transaction.amount)}
                valueColor={
                  transaction.transactionType === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }
              />
              <DetailItem
                icon={Calendar}
                label="Date"
                value={formatDate(transaction.date)}
              />
              <DetailItem
                icon={Tag}
                label="Category"
                value={transaction.category}
              />
              <DetailItem
                icon={getTransactionIcon(transaction.category)}
                label="Transaction Name"
                value={transaction.name}
              />
              <DetailItem
                icon={Info}
                label="Type"
                value={
                  transaction.transactionType.charAt(0).toUpperCase() +
                  transaction.transactionType.slice(1)
                }
                valueColor={
                  transaction.transactionType === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }
              />
            </div>
            {transaction.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <DetailItem
                  icon={FileText}
                  label="Description"
                  value={transaction.description}
                />
              </div>
            )}
          </section>

          {/* Account Information */}
          {transaction.accountId && (
            <section className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-500" /> Account
                Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  icon={getAccountIcon(transaction.accountId.accountType)}
                  label="Account Type"
                  value={transaction.accountId.accountType}
                />
                <DetailItem
                  icon={User}
                  label="Account Holder"
                  value={transaction.accountId.accountHolderName}
                />
                <DetailItem
                  icon={Hash}
                  label="Account Name"
                  value={transaction.accountId.accountName}
                />
                {transaction.accountId.accountNumber && (
                  <DetailItem
                    icon={CreditCard}
                    label="Account Number"
                    value={transaction.accountId.accountNumber}
                  />
                )}
                {transaction.accountId.mobileNumber && (
                  <DetailItem
                    icon={Smartphone}
                    label="Mobile Number"
                    value={transaction.accountId.mobileNumber}
                  />
                )}
                <DetailItem
                  icon={ArrowRight}
                  label="Payment Method"
                  value={transaction.paymentMethod}
                />
              </div>
            </section>
          )}

          {/* Reference Information (LC/Sale) */}
          {transaction.reference && (
            <section className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-blue-500" /> Reference
                Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  icon={Package}
                  label="Reference Type"
                  value={transaction.referenceModel}
                />
                <DetailItem
                  icon={FileText}
                  label={
                    transaction.referenceModel === "LC" ? "LC Number" : "Sale ID"
                  }
                  value={
                    transaction.referenceModel === "LC"
                      ? transaction.reference.basicInfo?.lcNumber
                      : transaction.reference.saleId
                  }
                />
                {transaction.miscReference && (
                  <DetailItem
                    icon={Info}
                    label="Misc. Reference"
                    value={transaction.miscReference}
                  />
                )}
              </div>
            </section>
          )}
        </div>
      ) : (
        <p className="p-8 text-center text-gray-500">
          No transaction details found.
        </p>
      )}
    </FormDialog>
  );
};

const DetailItem = ({ icon: Icon, label, value, valueColor = "text-gray-900" }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
      {Icon && <Icon className="h-4 w-4 mr-2 text-gray-400" />} {label}
    </p>
    <p className={`text-base font-semibold ${valueColor}`}>{value || "N/A"}</p>
  </div>
);

TransactionDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transactionId: PropTypes.string,
};

DetailItem.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  valueColor: PropTypes.string,
};

export default TransactionDetailsModal;
