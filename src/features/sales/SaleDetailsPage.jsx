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
} from "lucide-react";
import { showErrorToast } from "@/utils/notifications";
import Button from "@/components/ui/Button";
import {
  useSale,
  useDeleteSale,
  useCancelSale,
  useAddPartialPayment,
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
import AddSalesForm from "./AddSalesForm";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AuditInfoSection from "@/components/ui/AuditInfoSection";

// Sub-components
import SaleInfo from "./components/SaleDetails/SaleInfo";
import SaleFinancialSummary from "./components/SaleDetails/SaleFinancialSummary";
import SaleInvoiceHistory from "./components/SaleDetails/SaleInvoiceHistory";
import SaleMobileActions from "./components/SaleDetails/SaleMobileActions";

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { formatCurrency, formatDate } = useSettings();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "Cash",
    account: "",
  });
  const [paymentError, setPaymentError] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: null });

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

  const handleAddPayment = () => {
    const amount = Number(paymentData.amount);

    if (amount > balanceDue) {
      showErrorToast(`Amount cannot exceed the balance due (${formatCurrency(balanceDue)})`);
      return;
    }

    addPaymentMutation.mutate(
      {
        amount,
        date: new Date().toISOString(),
        paymentMethod: paymentData.method,
        ...(paymentData.method !== "Customer Credit" && paymentData.account
          ? { accountId: paymentData.account }
          : {}),
      },
      {
        onSuccess: () => {
          refetch();
          setIsPaymentDialogOpen(false);
          setPaymentData({ amount: "", method: "Cash", account: "" });
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
        ) : (
          `Sale #${sale?.saleId || ""}`
        ),
      },
    ],
    [sale, isLoading],
  );

  if (isError && !isLoading) return <div>Error: {error.message}</div>;
  if (!sale && !isLoading) return <div>Sale not found</div>;

  const totalPayments = sale?.paymentsMade ?? (sale?.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0);
  const balanceDue = sale?.balanceDue ?? ((sale?.totalAmountToBePaid || 0) - totalPayments);
  const isCancelled = sale?.invoiceStatus === "Cancelled";
  const canAddPayment =
    !isCancelled && ["Due", "Due payment", "Partial"].includes(sale?.paymentStatus) && balanceDue > 0;
  const customerId = sale?.customer?.customerId?._id || sale?.customer?.customerId;
  const isRegisteredCustomer = !!customerId;
  const validPayments = sale?.payments?.filter((p) => p.amount) || [];

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
                  {hasPermission("SALE_UPDATE") && (
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
                  {hasPermission("SALE_CANCEL") && (
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
                  {hasPermission("SALE_DELETE") && (
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
              />
              <SaleFinancialSummary
                sale={sale}
                totalPayments={totalPayments}
                balanceDue={balanceDue}
                canAddPayment={canAddPayment}
                hasPermission={hasPermission}
                onAddPaymentClick={() => setIsPaymentDialogOpen(true)}
                loading={isLoading}
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
                        ) : (
                          sale?.customer?.phone || "N/A"
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
                              sale?.customer?.address
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

              {/* Additional Details (Notes & History) - Kept Inline for now as they are small */}
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Details
                </h3>
                <div className="space-y-4">
                  {validPayments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Payment History
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        <AnimatePresence initial={false}>
                          {validPayments.map((p, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.12 }}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(p.date, {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {p.method}{" "}
                                  {p.accountId
                                    ? `(${formatAccountLabel(p.accountId)})`
                                    : ""}
                                </p>
                              </div>
                              <span className="text-sm font-medium text-[var(--color-success)]">
                                {formatCurrency(p.amount)}
                              </span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {sale?.notes || "No additional notes"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {sale?.invoiceStatus === "Invoiced" && !isCancelled && (
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
        <AuditInfoSection
          createdBy={sale?.createdBy}
          createdAt={sale?.createdAt}
          modifiedBy={sale?.modifiedBy}
          updatedAt={sale?.updatedAt}
          deletedBy={sale?.deletedBy}
          deletedAt={sale?.deletedAt}
          isDeleted={sale?.isDeleted}
        />
      </div>


      <FormDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        title="Add New Payment"
        primaryButtonText={
          addPaymentMutation.isLoading ? "Adding..." : "Add Payment"
        }
        isPrimaryButtonDisabled={!!paymentError || !paymentData.amount}
        secondaryButtonText="Cancel"
        onSubmit={handleAddPayment}
        isSubmitting={addPaymentMutation.isLoading}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="flex-grow">
              <InputField
                label="Amount"
                name="amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setPaymentData((p) => ({ ...p, amount: val }));
                  if (Number(val) > balanceDue) {
                    setPaymentError(`Max allowed: ${formatCurrency(balanceDue)}`);
                  } else {
                    setPaymentError("");
                  }
                }}
                placeholder={`Balance Due: ${formatCurrency(balanceDue)}`}
                error={paymentError}
                max={
                  paymentData.method === "Customer Credit"
                    ? Math.min(balanceDue, sale?.customer?.customerId?.creditBalance || 0)
                    : balanceDue
                }
                required
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-6" // Align with input field (skipping label height)
              onClick={() => {
                setPaymentData((p) => ({ ...p, amount: balanceDue }));
                setPaymentError(""); // Clear any previous errors
              }}
            >
              Full
            </Button>
          </div>
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
            <SelectField
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
                }))}
              required
            />
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
