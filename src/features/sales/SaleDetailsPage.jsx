import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft,
  ShoppingCart,
  Calendar,
  Edit,
  Trash2,
  XCircle,
  Menu,
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

    addPaymentMutation.mutate(
      {
        amount,
        date: new Date().toISOString(),
        paymentMethod: paymentData.method,
        accountId: paymentData.account,
      },
      {
        onSuccess: () => {
          refetch();
          setIsPaymentDialogOpen(false);
          setPaymentData({ amount: "", method: "Cash", account: "" });
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

  const totalPayments =
    sale?.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const balanceDue = (sale?.totalAmountToBePaid || 0) - totalPayments;
  const isCancelled = sale?.invoiceStatus === "Cancelled";
  const canAddPayment =
    !isCancelled && sale?.paymentStatus === "Due payment" && balanceDue > 0;
  const isRegisteredCustomer = !!sale?.customer?.customerId?._id;
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
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-[var(--color-primary-light)]">
                  <ShoppingCart className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {isLoading ? (
                      <ValueSkeleton width="w-24" height="h-7" />
                    ) : (
                      `#${sale.saleId}`
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {isLoading ? (
                      <ValueSkeleton width="w-32" height="h-3" />
                    ) : (
                      `Sold on ${formatDate(sale.saleDate)}`
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCancelled
                      ? "bg-[var(--color-danger-light)] text-[var(--color-danger)]"
                      : balanceDue > 0
                        ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                        : "bg-[var(--color-success-light)] text-[var(--color-success)]"
                  }`}
                >
                  {isCancelled
                    ? "Cancelled"
                    : balanceDue > 0
                      ? "Due Payment"
                      : "Paid"}
                </span>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <ValueSkeleton width="w-24" height="h-7" />
                  ) : (
                    formatCurrency(sale?.totalAmountToBePaid)
                  )}
                </p>
              </div>
              {/* Desktop Actions */}
              <div className="hidden md:flex flex-shrink-0 flex-wrap gap-2">
                {hasPermission("SALE_UPDATE") && (
                  <Button
                    onClick={() => setIsUpdateModalOpen(true)}
                    disabled={
                      isCancelled ||
                      deleteSaleMutation.isLoading ||
                      cancelSaleMutation.isLoading
                    }
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
                    disabled={
                      isCancelled ||
                      deleteSaleMutation.isLoading ||
                      cancelSaleMutation.isLoading
                    }
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
                    disabled={
                      deleteSaleMutation.isLoading ||
                      cancelSaleMutation.isLoading
                    }
                    variant="danger"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Sale</span>
                  </Button>
                )}
              </div>
              {/* Mobile Actions Button */}
              <Button
                onClick={() => setIsMobileMenuOpen(true)}
                variant="primary"
                className="md:hidden w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 font-medium text-sm shadow-sm"
              >
                <Menu className="w-4 h-4" />
                <span>Actions</span>
              </Button>
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
                                  {p.accountId?.accountName
                                    ? `(${p.accountId.accountName})`
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
        secondaryButtonText="Cancel"
        onSubmit={handleAddPayment}
        isSubmitting={addPaymentMutation.isLoading}
      >
        <div className="space-y-4">
          <InputField
            label="Amount"
            name="amount"
            type="number"
            value={paymentData.amount}
            onChange={(e) =>
              setPaymentData((p) => ({ ...p, amount: e.target.value }))
            }
            placeholder={`Balance Due: ${formatCurrency(balanceDue)}`}
            max={balanceDue}
            required
          />
          <SelectField
            label="Payment Method"
            name="method"
            value={paymentData.method}
            onChange={(e) => {
              const newMethod = e.target.value;
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
            ]}
            required
          />
          {["Bank", "Mobile Banking", "Cash"].includes(paymentData.method) && (
            <SelectField
              label="Account"
              name="account"
              value={paymentData.account}
              onChange={(e) =>
                setPaymentData((p) => ({ ...p, account: e.target.value }))
              }
              options={accounts
                .filter((acc) => acc.accountType === paymentData.method)
                .map((acc) => ({
                  value: acc._id,
                  label: `${acc.accountName} (${acc.bankName || acc.serviceName || "N/A"})`,
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
