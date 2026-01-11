import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  FileText,
  User,
  Calendar,
  DollarSign,
  Truck,
  Info,
  ShoppingCart,
  Package,
  Printer,
  Edit,
  Trash2,
  XCircle,
  ExternalLink,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import {
  useSale,
  useDeleteSale,
  useCancelSale,
  useAddPartialPayment,
} from "@/api/hooks/sales";
import { useInvoicesBySale, useGenerateInvoice } from "@/api/hooks/invoice";
import { useAccounts } from "@/api/hooks/account";
import { useAuth } from "@/context/AuthContext";
// import { useHover } from "@/hooks/useHover"; // Removed as MotionButton is removed

import Breadcrumb from "@/components/ui/Breadcrumb";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AddSalesForm from "./AddSalesForm";
import SaleDetailsSkeleton from "./components/SaleDetailsSkeleton";

// Removed MotionButton as it is replaced by Button
// const MotionButton = ({ children, ...props }) => {
//   const canHover = useHover();
//   return (
//     <motion.button
//       whileHover={canHover ? { scale: 1.01 } : {}}
//       whileTap={{ scale: 0.98 }}
//       transition={{ type: "spring", stiffness: 200, damping: 6 }}
//       {...props}
//     >
//       {children}
//     </motion.button>
//   );
// };

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(amount || 0);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatShortDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

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
      toast.error("You don't have permission to view sale details.");
      navigate("/sales");
    }
  }, [hasPermission, navigate]);

  const { data: saleData, isLoading, isError, error, refetch } = useSale(id);
  const { data: invoiceData } = useInvoicesBySale(id);
  const { data: accountsData } = useAccounts();

  const sale = saleData?.data;
  const invoiceHistory = invoiceData?.data || [];
  const accounts = accountsData?.data || [];

  const deleteSaleMutation = useDeleteSale();
  const cancelSaleMutation = useCancelSale();
  const generateInvoiceMutation = useGenerateInvoice();
  const addPaymentMutation = useAddPartialPayment(id);
  
  const handleConfirmAction = async () => {
    const { type } = confirmAction;
    if (!type) return;

    const mutation =
      type === "delete" ? deleteSaleMutation : cancelSaleMutation;
    mutation.mutate(id, {
      onSuccess: () => {
        toast.success(
          `Sale ${type === "delete" ? "deleted" : "cancelled"} successfully`
        );
        if (type === "delete") navigate("/sales");
        else refetch();
        setConfirmAction({ type: null });
      },
    });
  };

  const handleGenerateInvoice = async () => {
    generateInvoiceMutation.mutate(
      { saleId: id },
      {
        onSuccess: (axiosResponse) => navigate(`/sales/${id}/invoice/${axiosResponse.data.data._id}`),
      }
    );
  };

  const handleAddPayment = async () => {
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
          toast.success("Payment added successfully");
          refetch();
          setIsPaymentDialogOpen(false);
          setPaymentData({
            amount: "",
            method: "Cash",
            account: "",
          });
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message || "Failed to add payment.";
          toast.error(errorMessage);
        },
      }
    );
  };

  useEffect(() => {
    // When the payment dialog opens, pre-select the first available account if none is selected
    if (isPaymentDialogOpen) {
      const availableAccounts = accounts.filter(
        (acc) => acc.accountType === paymentData.method
      );
      if (availableAccounts.length > 0 && !paymentData.account) {
        setPaymentData((p) => ({
          ...p,
          account: availableAccounts[0]._id,
        }));
      }
    }
  }, [isPaymentDialogOpen, accounts, paymentData.method, paymentData.account]);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Sales", path: "/sales" },
      { label: `Sale #${sale?._id.slice(-6) || ""}` },
    ],
    [sale]
  );

  if (isLoading) return <SaleDetailsSkeleton />;
  if (isError) return <div>Error: {error.message}</div>;
  if (!sale) return <div>Sale not found</div>;

  const totalPayments =
    sale.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const balanceDue = (sale.totalAmountToBePaid || 0) - totalPayments;
  const isCancelled = sale.invoiceStatus === "Cancelled";
  const canAddPayment =
    !isCancelled && sale.paymentStatus === "Due payment" && balanceDue > 0;
    const isRegisteredCustomer = !!sale.customer?.customerId?._id;
  
    const validPayments = sale.payments?.filter(p => p.amount) || [];
  
    const MobileActionsMenu = () => (
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-gray-900/50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-900">
                  Sale Actions
                </h3>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
  
              <div className="space-y-2.5">
                {hasPermission("SALE_UPDATE") && (
                  <Button
                    onClick={() => {
                      setIsUpdateModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={
                      isCancelled ||
                      deleteSaleMutation.isLoading ||
                      cancelSaleMutation.isLoading
                    }
                    variant="primary"
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Update Sale</span>
                  </Button>
                )}
                {hasPermission("SALE_CANCEL") && (
                  <Button
                    onClick={() => {
                      setConfirmAction({ type: "cancel" });
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={
                      isCancelled ||
                      deleteSaleMutation.isLoading ||
                      cancelSaleMutation.isLoading
                    }
                    variant="warning"
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Sale</span>
                  </Button>
                )}
                {hasPermission("SALE_DELETE") && (
                  <Button
                    onClick={() => {
                      setConfirmAction({ type: "delete" });
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={
                      deleteSaleMutation.isLoading ||
                      cancelSaleMutation.isLoading
                    }
                    variant="danger"
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Sale</span>
                  </Button>
                )}
                {hasPermission("SALE_GENERATE_INVOICE") &&
                  sale.invoiceStatus !== "Invoiced" &&
                  !isCancelled && (
                    <Button
                      onClick={() => {
                        handleGenerateInvoice();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={
                        generateInvoiceMutation.isLoading || isCancelled
                      }
                      isLoading={generateInvoiceMutation.isLoading}
                      variant="success"
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Generate Invoice</span>
                    </Button>
                  )}
                {hasPermission("SALE_ADD_PAYMENT") && canAddPayment && (
                  <Button
                    onClick={() => {
                      setIsPaymentDialogOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    variant="primary" // Mapped purple to primary
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Add Payment</span>
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  
    return (
      <div>
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
                      Sale #{sale._id.slice(-6)}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Sold on {formatDate(sale.saleDate)}
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
                    {formatCurrency(sale.totalAmountToBePaid)}</p>
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
                </Button>              </div>
            </div>
  
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Sale Info, Financial Summary */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-[var(--color-primary)]" />
                    Sale Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Product
                      </label>
                      <div className="flex items-center text-gray-900">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        {sale.product?.name || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Quantity
                      </label>
                      <p className="text-gray-900">
                        {sale.quantity?.toLocaleString()}{" "}
                        {sale.unit?.name || "units"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Unit Price
                      </label>
                      <p className="text-gray-900">
                        {formatCurrency(sale.pricePerUnit)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Total Amount
                      </label>
                      <p className="text-gray-900">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Invoice Status
                      </label>
                      <div className="flex items-center text-gray-900">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        {sale.invoiceStatus}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Payment Status
                      </label>
                      <div className="flex items-center text-gray-900">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        {sale.paymentStatus || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Financial Summary
                    </h2>
                    {hasPermission("SALE_ADD_PAYMENT") && canAddPayment && (
                      <Button
                        onClick={() => setIsPaymentDialogOpen(true)}
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
                        {formatCurrency(sale.totalAmount)}
                      </span>
                    </div>
                    {sale.charges?.map((charge, i) => (
                      <div
                        key={`charge-${i}`}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-gray-600 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          {charge.name}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(charge.amount)}
                        </span>
                      </div>
                    ))}
                    {sale.costs?.map((cost, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-gray-600 flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-gray-400" />
                          {cost.name}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(cost.amount)}
                        </span>
                      </div>
                    ))}
                    {sale.discount > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-[var(--color-success)]">
                          -{formatCurrency(sale.discount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
                      <span className="text-gray-900">Net Amount</span>
                      <span className="text-gray-900">
                        {formatCurrency(sale.totalAmountToBePaid)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Payments Made</span>
                      <span className="font-medium">
                        {formatCurrency(totalPayments)}
                      </span>
                    </div>
                    <div
                      className={`border-t border-gray-200 pt-3 flex justify-between items-center text-lg font-semibold ${
                        balanceDue > 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"
                      }`}
                    >
                      <span>
                        {balanceDue > 0 ? "Balance Due" : "Overpayment"}
                      </span>
                      <span>{formatCurrency(Math.abs(balanceDue))}</span>
                    </div>
                  </div>
                </div>
              </div>
  
              <div className="space-y-6">
                {/* Customer & Other Details */}
                {sale.customer && (
                  <div className="bg-white rounded-lg shadow-sm p-5">
                                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="h-5 w-5 mr-2 text-[var(--color-primary)]" />
                                        Customer Information
                                      </h2>                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Name
                        </label>
                        <p className="text-gray-900">{sale.customer.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Phone
                        </label>
                        <p className="text-gray-900">
                          {sale.customer.phone || "N/A"}
                        </p>
                      </div>
                      {!isRegisteredCustomer && sale.customer.address && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Address
                          </label>
                          <p className="text-gray-900">{sale.customer.address}</p>
                        </div>
                      )}
                      {isRegisteredCustomer &&
                        hasPermission("CUSTOMER_VIEW_DETAILS") && (
                          <Link
                            to={`/customer-details/${sale.customer.customerId._id}`}
                            className="inline-flex items-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
                          >
                            View Customer Details
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </Link>
                        )}
                    </div>
                  </div>
                )}
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
                          {validPayments.map((p, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatShortDate(p.date)}
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
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {sale.notes || "No additional notes"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {sale.invoiceStatus === "Invoiced" && !isCancelled && (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Invoice History
                  </h2>
                  {hasPermission("SALE_GENERATE_INVOICE") && (
                    <Button
                      onClick={handleGenerateInvoice}
                      disabled={generateInvoiceMutation.isLoading}
                      isLoading={generateInvoiceMutation.isLoading}
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
                    {invoiceHistory.map((inv) => (
                      <div
                        key={inv._id}
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
                            onClick={() =>
                              navigate(`/sales/${sale._id}/invoice/${inv._id}`)
                            }
                            variant="subtle"
                            size="sm"
                            className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
                          >
                            View Invoice
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No invoices generated yet
                  </p>
                )}
              </div>
            )}
          </div>
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
                  (acc) => acc.accountType === newMethod
                );
                setPaymentData((p) => ({
                  ...p,
                  method: newMethod,
                  account:
                    availableAccounts.length > 0
                      ? availableAccounts[0]._id
                      : "",
                }));
              }}
              options={[
                { value: "Cash", label: "Cash" },
                { value: "Bank", label: "Bank Transfer" },
                { value: "Mobile Banking", label: "Mobile Banking" },
              ]}
              required
            />
            {(paymentData.method === "Bank" ||
              paymentData.method === "Mobile Banking" ||
              paymentData.method === "Cash") && (
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
                    label: `${acc.accountName} (${
                      acc.bankName || acc.serviceName || "N/A"
                    })`,
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
        <MobileActionsMenu />
      </div>
    );
  };

export default SaleDetails;
