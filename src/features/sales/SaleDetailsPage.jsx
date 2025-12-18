import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
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
  Loader2,
  Edit,
  Trash2,
  XCircle,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/apiService";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AddSalesForm from "./AddSalesForm";

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Main states
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // Payment dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "cash",
    account: "",
  });

  // Modal states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: null });
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  // Helper functions
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const formatShortDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  // Fetch all data at once
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [saleResponse, invoiceResponse, accountsResponse] =
        await Promise.all([
          api.get(`/sales/get-sales/${id}`),
          api.get(`/invoice/sale/${id}`),
          api.get(`/account/get-all-accounts`),
        ]);

      // Process sale data
      if (saleResponse.data.success) {
        let saleData = saleResponse.data.data;

        // Fetch unit details if unit is an ID string
        if (saleData.unit && typeof saleData.unit === "string") {
          try {
            const unitResponse = await api.get(`/unit/get/${saleData.unit}`);
            if (unitResponse.data.success) {
              saleData = { ...saleData, unit: unitResponse.data.data };
            }
          } catch (unitError) {
            console.warn("Could not fetch unit details:", unitError);
          }
        }

        setSale(saleData);
      } else {
        throw new Error(
          saleResponse.data.message || "Failed to fetch sale details"
        );
      }

      // Process invoice history
      if (invoiceResponse.data.success) {
        setInvoiceHistory(invoiceResponse.data.data || []);
      }

      // Process accounts
      if (accountsResponse.data.success) {
        setAccounts(accountsResponse.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching sale details:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch sale details"
      );
      toast.error("Failed to load sale details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [id, fetchAllData]);

  // Action handlers
  const handleDeleteClick = () => {
    setConfirmAction({ type: "delete" });
    setIsConfirmModalOpen(true);
  };

  const handleCancelClick = () => {
    setConfirmAction({ type: "cancel" });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    const { type } = confirmAction;
    if (!type) return;

    setIsSubmittingConfirm(true);
    const toastId = toast.loading(
      type === "delete" ? "Deleting sale..." : "Cancelling sale..."
    );

    try {
      if (type === "delete") {
        const response = await api.delete(`/sales/delete-sale/${id}`);
        if (response.data.success) {
          toast.success("Sale deleted successfully", { id: toastId });
          navigate("/sales");
        } else {
          throw new Error(response.data.message);
        }
      } else if (type === "cancel") {
        const response = await api.patch(`/sales/cancel-sale/${id}`);
        if (response.data.success) {
          toast.success("Sale cancelled successfully", { id: toastId });
          setSale(response.data.data);
        } else {
          throw new Error(response.data.message);
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Action failed",
        { id: toastId }
      );
    } finally {
      setIsSubmittingConfirm(false);
      setIsConfirmModalOpen(false);
      setConfirmAction({ type: null });
    }
  };

  const onSaleUpdated = useCallback(
    (updatedSale) => {
      setSale(updatedSale);
      setIsUpdateModalOpen(false);
      // Refresh invoice history
      api.get(`/invoice/sale/${id}`).then((response) => {
        if (response.data.success) {
          setInvoiceHistory(response.data.data || []);
        }
      });
    },
    [id]
  );

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post(`/invoice/generate`, { saleId: id });
      if (response.data.success) {
        toast.success("Invoice generated successfully!");
        navigate(`/sales/${id}/invoice/${response.data.data._id}`);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate invoice"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Payment handlers
  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "method") {
        newState.account = "";
      }
      return newState;
    });
  };

  const handleAddPayment = async () => {
    const amount = Number(paymentData.amount);
    const isCancelled = sale?.invoiceStatus === "Cancelled";

    // Calculations
    const totalPayments =
      sale?.payments?.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      ) || 0;
    const netAmount = sale?.totalAmountToBePaid || 0;
    const balanceDue = netAmount - totalPayments;

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > balanceDue) {
      toast.error(
        `Payment cannot exceed balance due of ${formatCurrency(balanceDue)}`
      );
      return;
    }

    if (isCancelled) {
      toast.error("Cannot add payment to a cancelled sale");
      return;
    }

    const payload = {
      amount: amount,
      date: paymentData.date,
      method: paymentData.method,
    };

    if (paymentData.method !== "cash" && !paymentData.account) {
      toast.error("Please select an account for this payment method");
      return;
    }

    if (paymentData.method !== "cash") {
      payload.account = paymentData.account;
    }

    setIsSubmittingPayment(true);
    try {
      const response = await api.post(`/sales/${id}/payments`, payload);
      if (response.data.success) {
        toast.success("Payment added successfully!");
        setIsPaymentDialogOpen(false);
        setPaymentData({
          amount: "",
          date: new Date().toISOString().split("T")[0],
          method: "cash",
          account: "",
        });
        await fetchAllData();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add payment"
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading sale details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !sale) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Sale
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </button>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sale Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The requested sale could not be found
          </p>
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </button>
        </div>
      </div>
    );
  }

  // Calculations
  const totalOtherCharges =
    sale?.otherCharges?.reduce(
      (sum, charge) => sum + (charge.amount || 0),
      0
    ) || 0;

  const totalPayments =
    sale?.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) ||
    0;

  const netAmount = sale?.totalAmountToBePaid || 0;
  const balanceDue = netAmount - totalPayments;
  const isCancelled = sale.invoiceStatus === "Cancelled";
  const canAddPayment =
    !isCancelled && sale.paymentStatus === "Due payment" && balanceDue > 0;
  const isRegisteredCustomer = !!sale.customer?.customerId?._id;

  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: `Sale #${sale._id.slice(-6)}` },
  ];

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Main Content */}
        <div className="mt-6 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Sale #{sale._id.slice(-6)}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Sold on {formatDate(sale.saleDate)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCancelled
                      ? "bg-red-100 text-red-800"
                      : balanceDue > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isCancelled
                    ? "Cancelled"
                    : balanceDue > 0
                    ? "Due Payment"
                    : "Paid"}
                </span>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(netAmount)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  disabled={isCancelled}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Update Sale
                </button>

                <button
                  onClick={handleCancelClick}
                  disabled={isCancelled}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Sale
                </button>

                <button
                  onClick={handleDeleteClick}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Sale
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Sale Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sale Information */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
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
                      {sale.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Financial Summary
                  </h2>
                  {canAddPayment && (
                    <button
                      onClick={() => setIsPaymentDialogOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CreditCard className="h-4 w-4" />
                      Add Payment
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-gray-400" />
                      Delivery Charge
                    </span>
                    <span className="font-medium">
                      {formatCurrency(sale.deliveryCharge)}
                    </span>
                  </div>

                  {totalOtherCharges > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Other Charges</span>
                      <span className="font-medium">
                        {formatCurrency(totalOtherCharges)}
                      </span>
                    </div>
                  )}

                  {sale.discount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(sale.discount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
                    <span className="text-gray-900">Net Amount</span>
                    <span className="text-gray-900">
                      {formatCurrency(netAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Payments Made</span>
                    <span className="font-medium">
                      {formatCurrency(totalPayments)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-lg font-semibold">
                    <span
                      className={
                        balanceDue > 0 ? "text-red-600" : "text-green-600"
                      }
                    >
                      {balanceDue > 0 ? "Balance Due" : "Overpayment"}
                    </span>
                    <span
                      className={
                        balanceDue > 0 ? "text-red-600" : "text-green-600"
                      }
                    >
                      {formatCurrency(Math.abs(balanceDue))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer & Details */}
            <div className="space-y-6">
              {/* Customer Information */}
              {sale.customer && (
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    Customer Information
                  </h2>

                  <div className="space-y-4">
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
                      <p className="text-gray-900">{sale.customer.phone}</p>
                    </div>

                    {!isRegisteredCustomer && sale.customer.address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Address
                        </label>
                        <p className="text-gray-900">{sale.customer.address}</p>
                      </div>
                    )}

                    {isRegisteredCustomer && (
                      <Link
                        to={`/customer-details/${sale.customer.customerId._id}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Customer Details
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Details
                </h3>

                <div className="space-y-4">
                  {/* Other Charges */}
                  {sale.otherCharges && sale.otherCharges.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Other Charges
                      </h4>
                      <div className="space-y-2">
                        {sale.otherCharges.map((charge, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-600">{charge.name}</span>
                            <span className="font-medium">
                              {formatCurrency(charge.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  {sale.payments && sale.payments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Payment History
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {sale.payments.map((payment, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {formatShortDate(payment.date)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.method}{" "}
                                {payment.account?.accountName
                                  ? `(${payment.account.accountName})`
                                  : ""}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
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

          {/* Invoice Section */}
          {sale.invoiceStatus === "Invoiced" && !isCancelled && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Invoice History
                </h2>
                <button
                  onClick={handleGenerateInvoice}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate New Invoice"}
                </button>
              </div>

              {invoiceHistory.length > 0 ? (
                <div className="space-y-3">
                  {invoiceHistory.map((invoice) => (
                    <div
                      key={invoice._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Invoice #{invoice._id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Generated:{" "}
                          {new Date(
                            invoice.invoiceGeneratedDate
                          ).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/sales/${sale._id}/invoice/${invoice._id}`)
                        }
                        className="mt-2 sm:mt-0 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Invoice
                      </button>
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

      {/* Payment Dialog */}
      <FormDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        title="Add New Payment"
        primaryButtonText={isSubmittingPayment ? "Adding..." : "Add Payment"}
        secondaryButtonText="Cancel"
        onSubmit={handleAddPayment}
        isPrimaryButtonDisabled={isSubmittingPayment}
      >
        <div className="space-y-4">
          <InputField
            label="Amount"
            name="amount"
            type="number"
            value={paymentData.amount}
            onChange={handlePaymentFormChange}
            placeholder={`Balance Due: ${formatCurrency(balanceDue)}`}
            max={balanceDue}
            required
          />

          <InputField
            label="Date"
            name="date"
            type="date"
            value={paymentData.date}
            onChange={handlePaymentFormChange}
            required
          />

          <SelectField
            label="Payment Method"
            name="method"
            value={paymentData.method}
            onChange={handlePaymentFormChange}
            options={[
              { value: "cash", label: "Cash" },
              { value: "bank", label: "Bank Transfer" },
              { value: "mobile-banking", label: "Mobile Banking" },
            ]}
            required
          />

          {(paymentData.method === "bank" ||
            paymentData.method === "mobile-banking") && (
            <SelectField
              label="Account"
              name="account"
              value={paymentData.account}
              onChange={handlePaymentFormChange}
              options={accounts
                .filter((acc) =>
                  paymentData.method === "bank"
                    ? acc.accountType === "Bank"
                    : acc.accountType === "Mobile Banking"
                )
                .map((acc) => ({
                  value: acc._id,
                  label: `${acc.accountName} (${
                    acc.bankName || acc.serviceName
                  })`,
                }))}
              required
            />
          )}
        </div>
      </FormDialog>

      {/* Update Sale Modal */}
      {isUpdateModalOpen && (
        <AddSalesForm
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          editData={sale}
          onSaleAdded={onSaleUpdated}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmAction.type === "delete" ? "Delete Sale" : "Cancel Sale"}
        description={`Are you sure you want to ${confirmAction.type} this sale? This action cannot be undone.`}
        confirmText={
          confirmAction.type === "delete" ? "Delete" : "Confirm Cancel"
        }
        isConfirming={isSubmittingConfirm}
        confirmingText={
          confirmAction.type === "delete" ? "Deleting..." : "Cancelling..."
        }
        icon={confirmAction.type === "delete" ? Trash2 : XCircle}
        iconBgColor={
          confirmAction.type === "delete" ? "bg-red-100" : "bg-amber-100"
        }
        iconTextColor={
          confirmAction.type === "delete" ? "text-red-600" : "text-amber-600"
        }
        confirmButtonBgColor={
          confirmAction.type === "delete" ? "bg-red-600" : "bg-amber-500"
        }
        confirmButtonHoverBgColor={
          confirmAction.type === "delete"
            ? "hover:bg-red-700"
            : "hover:bg-amber-600"
        }
      />
    </div>
  );
};

export default SaleDetails;
