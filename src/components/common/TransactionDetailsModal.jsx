import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Clock,
  Tag,
  Zap,
  ExternalLink,
  Banknote,
  ArrowRightLeft,
  ShieldCheck,
  Landmark,
  Info,
} from "lucide-react";
import Button from "../ui/Button";
import { useTransaction } from "@/api/hooks/transaction";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";
import DescriptionRenderer from "./DescriptionRenderer";
import { useNavigate } from "react-router";

// --- Helper Sub-components ---

const getPaymentMethodConfig = (method) => {
  switch (method) {
    case "Bank":
      return {
        icon: <Landmark className="w-4 h-4" />,
        color: "bg-blue-50 text-blue-600 border-blue-200",
        label: "Bank",
      };
    case "Mobile Banking":
      return {
        icon: <Smartphone className="w-4 h-4" />,
        color: "bg-purple-50 text-purple-600 border-purple-200",
        label: "Mobile Banking",
      };
    case "Cash":
      return {
        icon: <Banknote className="w-4 h-4" />,
        color: "bg-green-50 text-green-600 border-green-200",
        label: "Cash",
      };
    default:
      return {
        icon: <CreditCard className="w-4 h-4" />,
        color: "bg-gray-50 text-gray-600 border-gray-200",
        label: method || "Other",
      };
  }
};

const getSourceConfig = (source) => {
  switch (source) {
    case "Manual":
      return {
        icon: <User className="w-3.5 h-3.5" />,
        color: "bg-blue-100 text-blue-700",
        label: "Manual Entry",
      };
    case "Auto":
      return {
        icon: <Zap className="w-3.5 h-3.5" />,
        color: "bg-amber-100 text-amber-700",
        label: "Auto Generated",
      };
    case "Account":
      return {
        icon: <Building className="w-3.5 h-3.5" />,
        color: "bg-emerald-100 text-emerald-700",
        label: "Account Action",
      };
    default:
      return {
        icon: <CircleDashed className="w-3.5 h-3.5" />,
        color: "bg-gray-100 text-gray-700",
        label: source || "Unknown",
      };
  }
};

const getReferenceConfig = (referenceModel) => {
  switch (referenceModel) {
    case "Sale":
      return { label: "Sale", color: "text-indigo-600 bg-indigo-50 border-indigo-200", path: "/sales" };
    case "LC":
      return { label: "LC (Letter of Credit)", color: "text-teal-600 bg-teal-50 border-teal-200", path: "/lc-management" };
    case "Customer":
      return { label: "Customer", color: "text-orange-600 bg-orange-50 border-orange-200", path: "/customers" };
    case "AdvancePayment":
      return { label: "Advance Payment", color: "text-pink-600 bg-pink-50 border-pink-200", path: "/advance-payments" };
    default:
      return { label: "Reference", color: "text-gray-600 bg-gray-50 border-gray-200", path: null };
  }
};

const InfoCard = ({ icon, label, value, subValue, className = "" }) => (
  <div className={`bg-gray-50 rounded-xl p-3.5 border border-gray-100 ${className}`}>
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
      {icon}
      {label}
    </div>
    <div className="font-semibold text-sm text-gray-900 leading-tight">
      {value || "N/A"}
    </div>
    {subValue && (
      <div className="text-xs text-gray-500 mt-0.5">{subValue}</div>
    )}
  </div>
);

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-3 my-1">
    <div className="h-px bg-gray-200 flex-1" />
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {label}
    </span>
    <div className="h-px bg-gray-200 flex-1" />
  </div>
);

// --- Loading Skeleton ---
const DetailsSkeleton = () => (
  <div className="animate-pulse space-y-4 p-5">
    <div className="h-24 bg-gray-200 rounded-xl" />
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-xl" />
      ))}
    </div>
    <div className="h-20 bg-gray-100 rounded-xl" />
    <div className="h-12 bg-gray-100 rounded-xl" />
  </div>
);

// --- Main Component ---
const TransactionDetailsModal = ({ isOpen, onClose, transactionId }) => {
  const { data: response, isLoading, isError } = useTransaction(transactionId);
  const transaction = response?.data;
  const { formatCurrency, formatDate, formatTime } = useSettings();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isIncome = transaction?.transactionType === "Income";
  const sourceConfig = transaction ? getSourceConfig(transaction.source) : null;
  const paymentConfig = transaction
    ? getPaymentMethodConfig(transaction.paymentMethod)
    : null;

  const account = transaction?.accountId;

  // Reference handling
  const hasReference = transaction?.reference && transaction?.referenceModel;
  const refConfig = hasReference
    ? getReferenceConfig(transaction.referenceModel)
    : null;

  // Transfer-specific data
  const isTransfer =
    transaction?.category === "Transfer In" ||
    transaction?.category === "Transfer Out";

  // Determine reference display info
  const getReferenceDisplayInfo = () => {
    if (!hasReference) return null;
    const ref = transaction.reference;
    switch (transaction.referenceModel) {
      case "Sale":
        return {
          id: ref.saleId,
          subtitle: ref.customer?.name ? `Customer: ${ref.customer.name}` : null,
          detail: ref.totalAmountToBePaid != null
            ? `Total: ${formatCurrency(ref.totalAmountToBePaid)}`
            : null,
          status: ref.paymentStatus,
          navigateTo: `/sales/${ref._id}`,
        };
      case "LC":
        return {
          id: ref.basicInfo?.lcNumber,
          subtitle: ref.basicInfo?.supplierName
            ? `Supplier: ${ref.basicInfo.supplierName}`
            : null,
          detail: ref.financialInfo?.lcAmountBdt != null
            ? `Amount: ${formatCurrency(ref.financialInfo.lcAmountBdt)}`
            : null,
          status: ref.basicInfo?.status,
          navigateTo: `/lc-management/${ref._id}`,
        };
      case "Customer":
        return {
          id: ref.customerId || ref.name,
          subtitle: ref.name || null,
          detail: null,
          status: null,
          navigateTo: ref._id ? `/customers/${ref._id}` : null,
        };
      case "AdvancePayment":
        return {
          id: ref.advanceId,
          subtitle: ref.supplierName
            ? `Supplier: ${ref.supplierName}`
            : null,
          detail: ref.amount != null
            ? `Amount: ${formatCurrency(ref.amount)}`
            : null,
          status: ref.status,
          navigateTo: ref._id ? `/advance-payments/${ref._id}` : null,
        };
      default:
        return null;
    }
  };

  const refDisplayInfo = hasReference ? getReferenceDisplayInfo() : null;

  // Account display
  const getAccountDetails = () => {
    if (!account) return { primary: "N/A", secondary: null };
    const label = formatAccountLabel(account);
    return {
      primary: label,
      secondary: account.accountType,
    };
  };

  const accountDetails = getAccountDetails();

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={onClose} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
              <DialogPanel as="div" className="relative w-full sm:my-8 sm:max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ type: "spring", damping: 28, stiffness: 350, mass: 0.8 }}
                  className="relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
                >
            {/* Loading State */}
            {isLoading && <DetailsSkeleton />}

            {/* Error State */}
            {isError && !isLoading && (
              <div className="text-center py-12 px-6">
                <XCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
                <p className="text-sm text-red-600 font-medium">
                  Failed to load transaction details.
                </p>
                <Button
                  onClick={onClose}
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                >
                  Close
                </Button>
              </div>
            )}

            {/* Content */}
            {transaction && !isLoading && !isError && (
              <>
                {/* --- Header --- */}
                <div className="flex items-start justify-between p-5 pb-0">
                  <div className="flex-1 min-w-0 mr-4">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">
                      {transaction.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {sourceConfig && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sourceConfig.color}`}
                        >
                          {sourceConfig.icon}
                          {sourceConfig.label}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDate(transaction.date)} · {formatTime(transaction.date)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* --- Amount Banner --- */}
                <div className="px-5 pt-4">
                  <div
                    className={`p-4 rounded-xl border ${
                      isIncome
                        ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                        : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl ${
                            isIncome
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium uppercase tracking-wide ${
                              isIncome ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {transaction.transactionType}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                            isIncome ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {isIncome ? "+" : "−"}{" "}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Details Grid --- */}
                <div className="px-5 pt-4">
                  <SectionDivider label="Details" />
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <InfoCard
                      icon={<Calendar className="w-3.5 h-3.5" />}
                      label="Date"
                      value={formatDate(transaction.date)}
                      subValue={formatTime(transaction.date)}
                    />
                    <InfoCard
                      icon={<Tag className="w-3.5 h-3.5" />}
                      label="Category"
                      value={transaction.category}
                    />

                    {/* Payment Method */}
                    <InfoCard
                      icon={paymentConfig?.icon || <CreditCard className="w-3.5 h-3.5" />}
                      label="Payment"
                      value={
                        <span className="flex items-center gap-1.5">
                          {paymentConfig?.label}
                        </span>
                      }
                    />

                    {/* Account */}
                    <InfoCard
                      icon={<Wallet className="w-3.5 h-3.5" />}
                      label="Account"
                      value={
                        <span className="truncate block" title={accountDetails.primary}>
                          {accountDetails.primary}
                        </span>
                      }
                      subValue={accountDetails.secondary}
                    />
                  </div>
                </div>

                {/* --- Reference Section --- */}
                {hasReference && refDisplayInfo && (
                  <div className="px-5 pt-4">
                    <SectionDivider label="Linked Reference" />
                    <div
                      className={`mt-3 rounded-xl border p-3.5 ${refConfig.color} cursor-pointer hover:shadow-sm transition-shadow`}
                      onClick={() => {
                        if (refDisplayInfo.navigateTo) {
                          onClose();
                          navigate(refDisplayInfo.navigateTo);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                              {refConfig.label}
                            </span>
                            {refDisplayInfo.status && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/60 border border-current/10">
                                {refDisplayInfo.status}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold mt-1">
                            {refDisplayInfo.id}
                          </p>
                          {refDisplayInfo.subtitle && (
                            <p className="text-xs mt-0.5 opacity-80">
                              {refDisplayInfo.subtitle}
                            </p>
                          )}
                          {refDisplayInfo.detail && (
                            <p className="text-xs mt-0.5 font-medium">
                              {refDisplayInfo.detail}
                            </p>
                          )}
                        </div>
                        {refDisplayInfo.navigateTo && (
                          <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Transfer Info --- */}
                {isTransfer && transaction.miscReference && (
                  <div className="px-5 pt-4">
                    <SectionDivider label="Transfer Info" />
                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <ArrowRightLeft className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">
                          {transaction.category === "Transfer Out"
                            ? "Funds sent to another account"
                            : "Funds received from another account"}
                        </span>
                      </div>
                      {transaction.miscReference.referenceNote && (
                        <p className="text-xs text-blue-600 mt-2 pl-6">
                          <span className="font-medium">Reference:</span>{" "}
                          {transaction.miscReference.referenceNote}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* --- Description --- */}
                {transaction.description && (
                  <div className="px-5 pt-4">
                    <SectionDivider label="Description" />
                    <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <DescriptionRenderer
                          description={transaction.description}
                          account={account}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Audit Trail --- */}
                <div className="px-5 pt-4 pb-5">
                  <SectionDivider label="Audit Trail" />
                  <div className="mt-3 space-y-2">
                    {transaction.createdBy && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>
                          Created by{" "}
                          <span className="font-medium text-gray-700">
                            {transaction.createdBy.name || transaction.createdBy.email}
                          </span>
                        </span>
                        {transaction.createdAt && (
                          <span className="text-gray-400">
                            · {formatDate(transaction.createdAt)},{" "}
                            {formatTime(transaction.createdAt)}
                          </span>
                        )}
                      </div>
                    )}
                    {transaction.modifiedBy && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>
                          Last modified by{" "}
                          <span className="font-medium text-gray-700">
                            {transaction.modifiedBy.name || transaction.modifiedBy.email}
                          </span>
                        </span>
                        {transaction.updatedAt && (
                          <span className="text-gray-400">
                            · {formatDate(transaction.updatedAt)},{" "}
                            {formatTime(transaction.updatedAt)}
                          </span>
                        )}
                      </div>
                    )}
                    {!transaction.createdBy && !transaction.modifiedBy && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Info className="w-3.5 h-3.5" />
                        <span>No audit information available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- Footer --- */}
                <div className="border-t border-gray-100 px-5 py-3.5 bg-gray-50/50 flex justify-end">

                </div>
              </>
            )}
                </motion.div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

TransactionDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transactionId: PropTypes.string,
};

export default TransactionDetailsModal;
