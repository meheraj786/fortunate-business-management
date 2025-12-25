import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import FormDialog from "@/components/ui/FormDialog";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Banknote, 
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
  ExternalLink,
  XCircle
} from "lucide-react";
import api from "@/services/apiService";
import toast from "react-hot-toast";

const TransactionDetailsModal = ({ isOpen, onClose, transactionId }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchTransactionDetails();
    } else {
      setTransaction(null);
    }
  }, [isOpen, transactionId]);

  const fetchTransactionDetails = async () => {
    if (!transactionId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/transactions/get-transaction-details/${transactionId}`);
      if (response.data.success) {
        setTransaction(response.data.data);
      } else {
        toast.error("Failed to fetch transaction details");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load transaction details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Bank': return <Building className="w-4 h-4" />;
      case 'Mobile Banking': return <Smartphone className="w-4 h-4" />;
      case 'Cash': return <Wallet className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getReferenceTypeIcon = (type) => {
    return <ExternalLink className="w-4 h-4" />;
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
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {/* Transaction Details */}
        {transaction && !loading && (
          <div className="space-y-4">
            {/* Amount & Type Banner */}
            <div className={`rounded-xl p-4 ${
              transaction.transactionType === 'Income' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.transactionType === 'Income' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.transactionType === 'Income' 
                      ? <ArrowUpRight className="w-5 h-5" />
                      : <ArrowDownRight className="w-5 h-5" />
                    }
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Transaction Type</div>
                    <div className={`text-lg font-bold ${
                      transaction.transactionType === 'Income' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {transaction.transactionType}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">Amount</div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>Date</span>
                </div>
                <div className="font-medium text-gray-900">{formatDate(transaction.date)}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  {getPaymentMethodIcon(transaction.paymentMethod)}
                  <span>Payment Method</span>
                </div>
                <div className="font-medium text-gray-900">{transaction.paymentMethod}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <CircleDashed className="w-3 h-3" />
                  <span>Category</span>
                </div>
                <div className="font-medium text-gray-900">{transaction.category}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <User className="w-3 h-3" />
                  <span>Account</span>
                </div>
                <div className="font-medium text-gray-900 truncate">{transaction.accountId?.accountName}</div>
              </div>
            </div>

            {/* DESCRIPTION - PRIORITY SECTION */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Description</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {transaction.description ? (
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {transaction.description}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <XCircle className="w-8 h-8 mb-2" />
                    <p className="text-sm">No description provided</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reference & Additional Info */}
            {(transaction.reference || transaction.miscReference) && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                
                {/* Linked Reference */}
                {transaction.reference && (
                  <div className="mb-3 last:mb-0">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      {getReferenceTypeIcon(transaction.referenceModel)}
                      <span>Linked {transaction.referenceModel}</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {transaction.reference._id}
                      </div>
                    </div>
                  </div>
                )}

                {/* Misc Reference */}
                {transaction.miscReference && Object.keys(transaction.miscReference).length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Reference Details</div>
                    <div className="space-y-2">
                      {Object.entries(transaction.miscReference).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm font-medium text-gray-900 truncate ml-2">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transaction ID Footer */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Hash className="w-3 h-3" />
                <span className="font-mono truncate">ID: {transaction._id}</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!transaction && !loading && (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Select a transaction to view details</p>
          </div>
        )}
      </div>
    </FormDialog>
  );
};

TransactionDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transactionId: PropTypes.string,
};

export default TransactionDetailsModal;