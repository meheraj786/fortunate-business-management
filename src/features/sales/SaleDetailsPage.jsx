import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router";
import {
  ChevronLeft,
  ShoppingCart,
  Calendar,
  Edit,
  Trash2,
  XCircle,
  Menu,
  User,
  MapPin,
  ExternalLink,
  Tag,
  Undo2,
} from "lucide-react";
import { showErrorToast } from "@/utils/notifications";
import Button from "@/components/ui/Button";
import {
  useSale,
  useDeleteSale,
  useCancelSale,
  useAddPartialPayment,
  useReversePayment,
} from "@/api/hooks/sales";
import { useInvoicesBySale, useGenerateInvoice } from "@/api/hooks/invoice";
import { useAccounts } from "@/api/hooks/account";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";
import AddSalesForm from "./AddSalesForm";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import EntityAuditLog from "@/components/ui/EntityAuditLog";

// Sub-components
import SaleInfo from "./components/SaleDetails/SaleInfo";
import SaleFinancialSummary from "./components/SaleDetails/SaleFinancialSummary";
import SaleInvoiceHistory from "./components/SaleDetails/SaleInvoiceHistory";
import SaleMobileActions from "./components/SaleDetails/SaleMobileActions";

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canViewSensitive = hasPermission("CUSTOMER_VIEW_SENSITIVE") || hasPermission("CUSTOMER_UPDATE");
  const { formatCurrency, formatDate } = useSettings();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    discount: "",
    method: "Cash",
    account: "",
  });
  const [paymentError, setPaymentError] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: null });
  const [reversePaymentConfirm, setReversePaymentConfirm] = useState(null);

  useEffect(() => {
    if (!hasPermission("SALE_VIEW_DETAILS")) {
      showErrorToast("You don't have permission to view sale details.");
      navigate("/sales");
    }
  }, [hasPermission, navigate]);

  const { data: saleData, isLoading, isError, error, refetch } = useSale(id);
  const { data: invoiceData } = useInvoicesBySale(id);
  const { data: accountsData } = useAccounts();

  const sale = saleData?.data;
  const invoiceHistory = invoiceData?.data || [];
  const accounts = useMemo(() => accountsData?.data || [], [accountsData]);

  const deleteSaleMutation = useDeleteSale();
  const cancelSaleMutation = useCancelSale();
  const generateInvoiceMutation = useGenerateInvoice();
  const addPaymentMutation = useAddPartialPayment(id);
  const reversePaymentMutation = useReversePayment(id);

  const handleConfirmAction = () => {
    const { type } = confirmAction;
    if (!type) return;

    const mutation =
      type === "delete" ? deleteSaleMutation : cancelSaleMutation;
    mutation.mutate(id, {
      onSuccess: () => {
        if (type === "delete") navigate("/sales");
        else refetch();
        setConfirmAction({ type: null });
      },
    });
  };

  const handleGenerateInvoice = () => {
    generateInvoiceMutation.mutate(
      { saleId: id },
      {
        onSuccess: (axiosResponse) =>
          navigate(`/sales/${id}/invoice/${axiosResponse.data.data._id}`),
      },
    );
  };

  const handleReversePayment = () => {
    if (!reversePaymentConfirm || reversePaymentMutation.isPending) return;
    reversePaymentMutation.mutate(reversePaymentConfirm._id, {
      onSuccess: () => {
        refetch();
        setReversePaymentConfirm(null);
      },
    });
  };

  const handleAddPayment = () => {
    // Re-entry guard — prevents double-click from firing two mutations
    if (addPaymentMutation.isPending) return;

    const amount = Number(paymentData.amount) || 0;
    const discount = Number(paymentData.discount) || 0;

    if (amount + discount > balanceDue + 0.01) {
      showErrorToast(`Amount + Discount cannot exceed the balance due (${formatCurrency(balanceDue)})`);
      return;
    }

    if (!amount && !discount) {
      showErrorToast("Please enter an amount or discount.");
      return;
    }

    const mutationPayload = {
      amount,
      discount,
      date: new Date().toISOString(),
    };

    // Only include payment method and account when there's an actual payment
    if (amount > 0) {
      mutationPayload.paymentMethod = paymentData.method;
      if (paymentData.method !== "Customer Credit" && paymentData.account) {
        mutationPayload.accountId = paymentData.account;
      }
    }

    addPaymentMutation.mutate(
      mutationPayload,
      {
        onSuccess: () => {
          refetch();
          setIsPaymentDialogOpen(false);
          setPaymentData({ amount: "", discount: "", method: "Cash", account: "" });
          setPaymentError("");
        },
      },
    );
  };

  useEffect(() => {
    if (isPaymentDialogOpen) {
      const availableAccounts = accounts.filter(
        (acc) => acc.accountType === paymentData.method,
      );
      if (availableAccounts.length > 0 && !paymentData.account) {
        setPaymentData((p) => ({ ...p, account: availableAccounts[0]._id }));
      }
    }
  }, [isPaymentDialogOpen, accounts, paymentData.method, paymentData.account]);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Sales", path: "/sales" },
      {
        label: isLoading ? (
          <ValueSkeleton width="w-24" height="h-3" />
        ) : sale?.saleId?.startsWith("OPEN-BAL-") ? (
          "Opening Balance"
        ) : (
          `Sale #${sale?.saleId || ""}`
        ),
      },
    ],
    [sale, isLoading],
  );

  if (isError && !isLoading) return <div>Error: {error.message}</div>;
  if (!sale && !isLoading) return <div>Sale not found</div>;

  const totalPayments = sale?.paymentsMade ?? (sale?.payments?.filter(p => !p.isReversed).reduce((sum, p) => sum + (p.amount || 0), 0) || 0);
  const balanceDue = sale?.balanceDue ?? ((sale?.totalAmountToBePaid || 0) - totalPayments);
  const isCancelled = sale?.invoiceStatus === "Cancelled";
  const canAddPayment =
    !isCancelled && ["Due", "Due payment", "Partial"].includes(sale?.paymentStatus) && balanceDue > 0;
  const customerId = sale?.customer?.customerId?._id || sale?.customer?.customerId;
  const isRegisteredCustomer = !!customerId;
  const validPayments = sale?.payments?.filter((p) => p.amount || p.discount) || [];
  const isOpeningBalance = sale?.saleId?.startsWith("OPEN-BAL-");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-6 space-y-6">

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              {/* Row 1: Identity & Actions */}
              <div className="flex justify-between items-center sm:items-start">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 sm:p-3 rounded-lg bg-[var(--color-primary-light)] flex-shrink-0">
                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-2xl font-bold text-gray-900 truncate">
                      {isLoading ? (
                        <ValueSkeleton width="w-24" height="h-6 sm:h-7" />
                      ) : isOpeningBalance ? (
                        "Opening Balance Record"
                      ) : (
                        `#${sale.saleId}`
                      )}
                    </h1>
                    <p className="text-[10px] sm:text-sm text-gray-600 mt-0.5 flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      {isLoading ? (
                        <ValueSkeleton width="w-24 sm:w-32" height="h-3" />
                      ) : (
                        <span className="truncate">
                          Sold on {formatDate(sale.saleDate)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Mobile Actions - Compact */}
                <Button
                  onClick={() => setIsMobileMenuOpen(true)}
                  variant="primary"
                  size="sm"
                  className="md:hidden flex items-center justify-center gap-1 px-3 py-1.5 font-medium shadow-sm transition-transform active:scale-95"
                >
                  <Menu className="w-3.5 h-3.5" />
                  <span>Actions</span>
                </Button>

                {/* Desktop Actions */}
                <div className="hidden md:flex flex-shrink-0 flex-wrap gap-2">
                  {hasPermission("SALE_UPDATE") && !isOpeningBalance && (
                    <Button
                      onClick={() => setIsUpdateModalOpen(true)}
                      disabled={isCancelled || deleteSaleMutation.isLoading || cancelSaleMutation.isLoading}
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Update Sale</span>
                    </Button>
                  )}
                  {hasPermission("SALE_CANCEL") && !isOpeningBalance && (
                    <Button
                      onClick={() => setConfirmAction({ type: "cancel" })}
                      disabled={isCancelled || deleteSaleMutation.isLoading || cancelSaleMutation.isLoading}
                      variant="warning"
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Sale</span>
                    </Button>
                  )}
                  {hasPermission("SALE_DELETE") && !isOpeningBalance && (
                    <Button
                      onClick={() => setConfirmAction({ type: "delete" })}
                      disabled={deleteSaleMutation.isLoading || cancelSaleMutation.isLoading}
                      variant="danger"
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Sale</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Row 2 (Mobile only border): Status & Amount */}
              <div className="flex flex-row justify-between items-end sm:items-center border-t border-gray-50 pt-3 sm:pt-0 sm:border-0 sm:flex-col sm:items-end sm:gap-1">
                <span
                  className={`px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium whitespace-nowrap ${sale?.invoiceStatus === "Cancelled"
                    ? "bg-[var(--color-danger-light)] text-[var(--color-danger)]"
                    : sale?.paymentStatus === "Paid" || sale?.paymentStatus === "Paid payment"
                      ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                      : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                    }`}
                >
                  {sale?.invoiceStatus === "Cancelled"
                    ? "Cancelled"
                    : sale?.paymentStatus === "Paid" || sale?.paymentStatus === "Paid payment"
                      ? "Paid"
                      : "Due Payment"}
                </span>
                <p className="text-base sm:text-2xl font-bold text-gray-900 whitespace-nowrap">
                  {isLoading ? (
                    <ValueSkeleton width="w-20 sm:w-24" height="h-6 sm:h-7" />
                  ) : (
                    formatCurrency(sale?.totalAmountToBePaid)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SaleInfo
                sale={sale}
                isRegisteredCustomer={isRegisteredCustomer}
                hasPermission={hasPermission}
                loading={isLoading}
                isOpeningBalance={isOpeningBalance}
              />
              <SaleFinancialSummary
                sale={sale}
                totalPayments={totalPayments}
                balanceDue={balanceDue}
                canAddPayment={canAddPayment}
                hasPermission={hasPermission}
                onAddPaymentClick={() => setIsPaymentDialogOpen(true)}
                loading={isLoading}
                isOpeningBalance={isOpeningBalance}
              />
            </div>

            <div className="space-y-6">
              {/* Customer Information (Moved to Sidebar) */}
              {sale?.customer && (
                <div className="bg-white rounded-lg shadow-sm p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-[var(--color-primary)]" />
                    Customer Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Name
                      </label>
                      <p className="text-sm font-medium text-gray-900">
                        {isLoading ? (
                          <ValueSkeleton width="w-32" height="h-4" />
                        ) : (
                          sale?.customer?.name
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Phone
                      </label>
                      <p className="text-sm text-gray-900">
                        {isLoading ? (
                          <ValueSkeleton width="w-28" height="h-4" />
                        ) : sale?.customer?.phone ? (
                          canViewSensitive ? (
                            <a
                              href={`tel:${sale.customer.phone}`}
                              className="hover:text-[var(--color-primary)] transition-colors"
                            >
                              {sale.customer.phone}
                            </a>
                          ) : (
                            "***-****"
                          )
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                    {sale?.customer?.address && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Address
                        </label>
                        <div className="flex items-start text-sm text-gray-900">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span>
                            {isLoading ? (
                              <ValueSkeleton width="w-full" height="h-4" />
                            ) : (
                              canViewSensitive ? sale?.customer?.address : "Restricted View"
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    {isRegisteredCustomer && (
                      <div className="pt-2">
                        <Link
                          to={`/customer-details/${customerId}`}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-[var(--color-primary)] text-sm font-medium rounded-lg text-[var(--color-primary)] bg-white hover:bg-[var(--color-primary-light)] transition-colors"
                        >
                          View Customer Profile
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Details (History) */}
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Payment History
                    </h4>
                    {validPayments.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        <AnimatePresence initial={false}>
                          {validPayments.map((p, i) => (
                            <motion.div
                              key={p._id || i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.12 }}
                              className={`flex justify-between items-center p-2 rounded group ${p.isReversed ? "bg-red-50/50" : "bg-gray-50"}`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-medium ${p.isReversed ? "text-gray-500 line-through" : "text-gray-900"}`}>
                                    {formatDate(p.date, {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                  </p>
                                  {p.isReversed && (
                                    <span className="text-[10px] font-semibold tracking-wider uppercase bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                      Reversed
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {p.method === "Discount" ? "Discount Adjustment" : p.method}{" "}
                                  {p.accountId && p.method !== "Discount"
                                    ? `(${formatAccountLabel(p.accountId)})`
                                    : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  {p.amount > 0 && (
                                    <span className="text-sm font-medium text-[var(--color-success)]">
                                      {formatCurrency(p.amount)}
                                    </span>
                                  )}
                                  {p.discount > 0 && (
                                    <span className="block text-xs font-medium text-[var(--color-primary)] bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                                      Discount: {formatCurrency(p.discount)}
                                    </span>
                                  )}
                                </div>
                                {hasPermission("SALE_REVERSE_PAYMENT") && !isCancelled && !p.isReversed && p._id && (
                                  <button
                                    type="button"
                                    onClick={() => setReversePaymentConfirm(p)}
                                    disabled={reversePaymentMutation.isPending}
                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                                    title="Reverse this payment"
                                  >
                                    <Undo2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded border border-gray-100">
                        No payments have been made yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {sale?.invoiceStatus === "Invoiced" && !isCancelled && !isOpeningBalance && (
            <SaleInvoiceHistory
              invoiceHistory={invoiceHistory}
              hasPermission={hasPermission}
              generateInvoiceLoading={generateInvoiceMutation.isLoading}
              isCancelled={isCancelled}
              onGenerateInvoiceClick={handleGenerateInvoice}
              onViewInvoiceClick={(invoiceId) =>
                navigate(`/sales/${sale?._id}/invoice/${invoiceId}`)
              }
            />
          )}
        </div>

        {hasPermission("AUDIT_VIEW") && (
          <div className="mt-6">
            <EntityAuditLog moduleId={id} moduleName="Sale" />
          </div>
        )}
      </div>

      <FormDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        title={isOpeningBalance ? "Repay Balance" : "Add New Payment"}
        primaryButtonText={
          addPaymentMutation.isLoading ? "Adding..." : "Add Payment"
        }
        isPrimaryButtonDisabled={!!paymentError || (!paymentData.amount && !paymentData.discount)}
        secondaryButtonText="Cancel"
        onSubmit={handleAddPayment}
        isSubmitting={addPaymentMutation.isLoading}
      >
        <div className="space-y-4">
          {/* Balance Due Info Banner */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <span className="text-sm text-gray-600">Balance Due</span>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(balanceDue)}</span>
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-grow">
              <InputField
                label="Payment Amount"
                name="amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setPaymentData((p) => ({ ...p, amount: val }));
                  const totalSettlement = (Number(val) || 0) + (Number(paymentData.discount) || 0);
                  if (totalSettlement > balanceDue + 0.01) {
                    setPaymentError(`Amount + Discount cannot exceed ${formatCurrency(balanceDue)}`);
                  } else {
                    setPaymentError("");
                  }
                }}
                placeholder="0"
                error={paymentError}
                min={0}
                max={
                  paymentData.method === "Customer Credit"
                    ? Math.min(balanceDue - (Number(paymentData.discount) || 0), sale?.customer?.customerId?.creditBalance || 0)
                    : balanceDue - (Number(paymentData.discount) || 0)
                }
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => {
                const discountVal = Number(paymentData.discount) || 0;
                const maxPayment = Math.max(0, balanceDue - discountVal);
                setPaymentData((p) => ({ ...p, amount: maxPayment }));
                setPaymentError("");
              }}
            >
              Full
            </Button>
          </div>

          {/* Discount Field */}
          <div className="flex items-start gap-2">
            <div className="flex-grow">
              <InputField
                label={
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Discount
                  </span>
                }
                name="discount"
                type="number"
                value={paymentData.discount}
                onChange={(e) => {
                  const val = e.target.value;
                  setPaymentData((p) => ({ ...p, discount: val }));
                  const totalSettlement = (Number(paymentData.amount) || 0) + (Number(val) || 0);
                  if (totalSettlement > balanceDue + 0.01) {
                    setPaymentError(`Amount + Discount cannot exceed ${formatCurrency(balanceDue)}`);
                  } else {
                    setPaymentError("");
                  }
                }}
                placeholder="0"
                min={0}
                max={balanceDue - (Number(paymentData.amount) || 0)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => {
                const amountVal = Number(paymentData.amount) || 0;
                const maxDiscount = Math.max(0, balanceDue - amountVal);
                setPaymentData((p) => ({ ...p, discount: maxDiscount }));
                setPaymentError("");
              }}
            >
              Rest
            </Button>
          </div>

          {/* Settlement Summary */}
          {((Number(paymentData.amount) || 0) > 0 || (Number(paymentData.discount) || 0) > 0) && (
            <div className="bg-blue-50 rounded-lg p-3 space-y-1 border border-blue-100">
              {(Number(paymentData.amount) || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment</span>
                  <span className="font-medium text-gray-900">{formatCurrency(Number(paymentData.amount) || 0)}</span>
                </div>
              )}
              {(Number(paymentData.discount) || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-[var(--color-success)]">-{formatCurrency(Number(paymentData.discount) || 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold border-t border-blue-200 pt-1 mt-1">
                <span className="text-gray-700">Remaining Due</span>
                <span className={`${
                  balanceDue - (Number(paymentData.amount) || 0) - (Number(paymentData.discount) || 0) <= 0
                    ? 'text-[var(--color-success)]'
                    : 'text-[var(--color-danger)]'
                }`}>
                  {formatCurrency(Math.max(0, balanceDue - (Number(paymentData.amount) || 0) - (Number(paymentData.discount) || 0)))}
                </span>
              </div>
            </div>
          )}
          {/* Payment Method & Account */}
          <>
            <SelectField
              label="Payment Method"
              name="method"
              value={paymentData.method}
              onChange={(val) => {
                const newMethod = val;
                const availableAccounts = accounts.filter(
                  (acc) => acc.accountType === newMethod,
                );
                setPaymentData((p) => ({
                  ...p,
                  method: newMethod,
                  account:
                    availableAccounts.length > 0 ? availableAccounts[0]._id : "",
                }));
              }}
              options={[
                { value: "Cash", label: "Cash" },
                { value: "Bank", label: "Bank Transfer" },
                { value: "Mobile Banking", label: "Mobile Banking" },
                {
                  value: "Customer Credit",
                  label: `Customer Credit (${formatCurrency(sale?.customer?.customerId?.creditBalance || 0)})`,
                  disabled: (sale?.customer?.customerId?.creditBalance || 0) <= 0
                }
              ]}
              required
            />
            {paymentData.method === "Customer Credit" && (
              <div className="text-sm text-[var(--color-primary)] bg-blue-50 p-2 rounded">
                Available Credit:{" "}
                <span className="font-bold">
                  {formatCurrency(sale?.customer?.customerId?.creditBalance || 0)}
                </span>
              </div>
            )}
            {["Bank", "Mobile Banking", "Cash"].includes(paymentData.method) && (
              <ComboboxField
                label="Account"
                name="account"
                value={paymentData.account}
                onChange={(val) =>
                  setPaymentData((p) => ({ ...p, account: val }))
                }
                options={accounts
                  .filter((acc) => acc.accountType === paymentData.method)
                  .map((acc) => ({
                    value: acc._id,
                    label: formatAccountLabel(acc),
                  }))
                  .sort((a, b) => a.label.localeCompare(b.label))}
                required
                placeholder="Search account..."
              />
            )}
          </>
          {/* Discount-only info */}
          {(Number(paymentData.amount) || 0) === 0 && (Number(paymentData.discount) || 0) > 0 && (
            <div className="text-sm text-gray-600 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span>This is a <strong>discount-only</strong> adjustment. No payment method or account is required.</span>
            </div>
          )}
        </div>
      </FormDialog>

      {isUpdateModalOpen && (
        <AddSalesForm
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          editData={sale}
          onSaleAdded={() => {
            refetch();
            setIsUpdateModalOpen(false);
          }}
        />
      )}

      {/* Payment Reversal Confirmation */}
      {reversePaymentConfirm && (
        <ConfirmationModal
          isOpen={!!reversePaymentConfirm}
          onClose={() => setReversePaymentConfirm(null)}
          onConfirm={handleReversePayment}
          title="Reverse Payment"
          description={`Are you sure you want to reverse this ${reversePaymentConfirm.method} payment of ${formatCurrency(reversePaymentConfirm.amount)}?${reversePaymentConfirm.discount > 0 ? ` This will also reverse the discount of ${formatCurrency(reversePaymentConfirm.discount)}.` : ""} The account balance will be adjusted and a reversal transaction will be recorded. This action cannot be undone.`}
          confirmText={reversePaymentMutation.isPending ? "Reversing..." : "Yes, Reverse Payment"}
          isConfirming={reversePaymentMutation.isPending}
          icon={Undo2}
        />
      )}

      {confirmAction.type && (
        <ConfirmationModal
          isOpen={!!confirmAction.type}
          onClose={() => setConfirmAction({ type: null })}
          onConfirm={handleConfirmAction}
          title={
            confirmAction.type === "delete" ? "Delete Sale" : "Cancel Sale"
          }
          description={`Are you sure you want to ${confirmAction.type} this sale? This action cannot be undone.`}
          confirmText={
            confirmAction.type === "delete" ? "Delete" : "Confirm Cancel"
          }
          isConfirming={
            deleteSaleMutation.isLoading || cancelSaleMutation.isLoading
          }
          icon={confirmAction.type === "delete" ? Trash2 : XCircle}
        />
      )}
      <SaleMobileActions
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        hasPermission={hasPermission}
        sale={sale}
        isCancelled={isCancelled}
        canAddPayment={canAddPayment}
        isOpeningBalance={isOpeningBalance}
        onUpdateClick={() => setIsUpdateModalOpen(true)}
        onCancelClick={() => setConfirmAction({ type: "cancel" })}
        onDeleteClick={() => setConfirmAction({ type: "delete" })}
        onGenerateInvoiceClick={handleGenerateInvoice}
        onAddPaymentClick={() => setIsPaymentDialogOpen(true)}
        deleteLoading={deleteSaleMutation.isLoading}
        cancelLoading={cancelSaleMutation.isLoading}
        generateInvoiceLoading={generateInvoiceMutation.isLoading}
      />
    </motion.div>
  );
};

export default SaleDetails;
