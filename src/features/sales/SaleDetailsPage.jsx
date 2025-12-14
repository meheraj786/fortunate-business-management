import React, { useState, useEffect, useContext } from "react";
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
  const [isRegisteredCustomer, setIsRegisteredCustomer] = useState(false);

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
  const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid payment":
        return "bg-green-100 text-green-800";
      case "Due payment":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch data functions
  const fetchSaleDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/sales/get-sales/${id}`);
      if (response.data.success) {
        let saleData = response.data.data;

        // If saleData.unit is an ID string, fetch the unit details
        if (saleData.unit && typeof saleData.unit === "string") {
          try {
            const unitResponse = await api.get(
              `/unit/get/${saleData.unit}`
            );
            if (unitResponse.data.success) {
              saleData = { ...saleData, unit: unitResponse.data.data };
            } else {
              console.warn(
                "Failed to fetch unit details for ID:",
                saleData.unit,
                unitResponse.data.message
              );
              toast.error("Could not fetch unit details for the sale.");
            }
          } catch (unitError) {
            console.error(
              "Error fetching unit details for ID:",
              saleData.unit,
              unitError
            );
            toast.error("An unexpected error occurred while fetching unit details.");
          }
        }

        setSale(saleData);
        // Check if customer is registered (has customerId object)
        setIsRegisteredCustomer(!!saleData.customer?.customerId?._id);
      } else {
        setError(response.data.message);
        toast.error(response.data.message || "Failed to fetch sale details.");
      }
    } catch (err) {
      setError("Failed to fetch sale details.");
      toast.error("An unexpected error occurred while fetching sale details.");
      console.error("Error fetching sale details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get(`/account/get-all-accounts`);
      if (response.data.success) {
        setAccounts(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch accounts.");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("An unexpected error occurred while fetching accounts.");
    }
  };

  const fetchInvoiceHistory = async () => {
    try {
      const response = await api.get(`/invoice/sale/${id}`);
      if (response.data.success) {
        setInvoiceHistory(response.data.data || []);
      } else {
        toast.error(
          response.data.message || "Failed to fetch invoice history."
        );
      }
    } catch (error) {
      console.error("Failed to fetch invoice history:", error);
      toast.error(
        "An unexpected error occurred while fetching invoice history."
      );
    }
  };

  // Effect hook
  useEffect(() => {
    if (id) {
      fetchSaleDetails();
      fetchInvoiceHistory();
      fetchAccounts();
    }
  }, [id]);

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
      `${type === "delete" ? "Deleting" : "Cancelling"} sale...`
    );

    try {
      if (type === "delete") {
        const response = await api.delete(
          `/sales/delete-sale/${id}`
        );
        if (response.data.success) {
          toast.success(response.data.message || "Sale deleted successfully", {
            id: toastId,
          });
          navigate("/sales");
        } else {
          toast.error(response.data.message || "Failed to delete sale.", {
            id: toastId,
          });
        }
      } else if (type === "cancel") {
        const response = await api.patch(`/sales/cancel-sale/${id}`);
        if (response.data.success) {
          toast.success(
            response.data.message || "Sale cancelled successfully",
            {
              id: toastId,
            }
          );
          setSale(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to cancel sale.", {
            id: toastId,
          });
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred.",
        { id: toastId }
      );
    } finally {
      setIsSubmittingConfirm(false);
      setIsConfirmModalOpen(false);
      setConfirmAction({ type: null });
    }
  };

  const onSaleUpdated = (updatedSale) => {
    setSale(updatedSale);
    setIsUpdateModalOpen(false);
    fetchInvoiceHistory();
  };

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post(`/invoice/generate`, {
        saleId: id,
      });
      if (response.data.success) {
        toast.success(
          response.data.message || "Invoice generated successfully!"
        );
        navigate(`/sales/${id}/invoice/${response.data.data._id}`);
      } else {
        toast.error(response.data.message || "Failed to generate invoice.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred while generating the invoice."
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
      toast.error("Please enter a valid payment amount.");
      return;
    }

    if (amount > balanceDue) {
      toast.error(
        `Payment cannot be greater than the balance due of ${formatCurrency(
          balanceDue
        )}.`
      );
      return;
    }

    if (isCancelled) {
      toast.error("Cannot add payment to a cancelled sale.");
      return;
    }

    const payload = {
      ...paymentData,
      amount: amount,
    };

    if (paymentData.method === "cash") {
      payload.account = null;
    } else if (!paymentData.account) {
      toast.error("Please select an account for this payment method.");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const response = await api.post(
        `/sales/${id}/payments`,
        payload
      );
      if (response.data.success) {
        toast.success(response.data.message || "Payment added successfully!");
        setIsPaymentDialogOpen(false);
        setPaymentData({
          amount: "",
          date: new Date().toISOString().split("T")[0],
          method: "cash",
          account: "",
        });
        await fetchSaleDetails();
      } else {
        toast.error(response.data.message || "Failed to add payment.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred while adding the payment."
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
          <p className="text-lg sm:text-xl font-semibold mt-4 text-gray-700">
            Loading Sale Details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !sale) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <p className="text-xl font-bold text-red-600 mb-4">Error</p>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center text-blue-500 hover:text-blue-700 hover:underline transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Sales
          </button>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <p className="text-xl font-bold text-gray-800 mb-4">Sale Not Found</p>
          <p className="text-gray-600 mb-6">
            The requested sale could not be found.
          </p>
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center text-blue-500 hover:text-blue-700 hover:underline transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
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

  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: `Sale #${sale._id.slice(-6)}` },
  ];

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
          {/* TOP */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* LEFT */}
            <div className="flex items-start sm:items-center gap-3">
              {/* ICON */}
              <div className="p-2 sm:p-3 bg-blue-100/60 rounded-lg shrink-0">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700" />
              </div>

              {/* TITLE */}
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                  Sale #{sale._id.slice(-6)}
                </h1>

                <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Calendar size={14} className="text-blue-600/70" />
                  Sold on {formatDate(sale.saleDate)}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex justify-between lg:flex-col lg:items-end items-center gap-2">
              {/* STATUS */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium
        ${
          isCancelled
            ? "bg-red-100/70 text-red-700"
            : "bg-emerald-100/70 text-emerald-700"
        }`}
              >
                {isCancelled ? "Cancelled" : sale.paymentStatus}
              </span>

              {/* AMOUNT */}
              <p className="text-lg sm:text-xl font-bold text-blue-800">
                {formatCurrency(netAmount)}
              </p>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              disabled={isCancelled}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
      bg-blue-700 hover:bg-blue-800 text-white transition disabled:bg-gray-400"
            >
              <Edit size={16} />
              Update
            </button>

            <button
              onClick={handleCancelClick}
              disabled={isCancelled}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
      bg-yellow-700 hover:bg-yellow-800 text-white transition disabled:bg-gray-400"
            >
              <XCircle size={16} />
              Cancel
            </button>

            <button
              onClick={handleDeleteClick}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
      bg-red-700 hover:bg-red-800 text-white transition"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Sale Information Card */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <Info size={18} className="mr-2 text-blue-500 flex-shrink-0" />
                Sale Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Product
                  </p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Package
                      size={16}
                      className="mr-2 text-gray-400 flex-shrink-0"
                    />
                    <span className="truncate">
                      {sale.product?.name || "N/A"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Quantity
                  </p>
                  <p className="font-medium text-gray-900">
                    {sale.quantity} {sale.unit?.name || "units"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Price Per Unit
                  </p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(sale.pricePerUnit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Total Amount
                  </p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(sale.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Invoice Status
                  </p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <FileText
                      size={16}
                      className="mr-2 text-gray-400 flex-shrink-0"
                    />
                    {sale.invoiceStatus}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Payment Status
                  </p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <DollarSign
                      size={16}
                      className="mr-2 text-gray-400 flex-shrink-0"
                    />
                    {isCancelled ? "N/A" : sale.paymentStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Financial Summary
                </h3>
                {canAddPayment && (
                  <button
                    onClick={() => setIsPaymentDialogOpen(true)}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  >
                    Add Payment
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <Truck
                      size={16}
                      className="mr-1.5 text-gray-400 flex-shrink-0"
                    />
                    Delivery Charge
                  </span>
                  <span className="font-medium">
                    {formatCurrency(sale.deliveryCharge)}
                  </span>
                </div>

                {totalOtherCharges > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Other Charges</span>
                    <span className="font-medium">
                      {formatCurrency(totalOtherCharges)}
                    </span>
                  </div>
                )}

                {sale.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(sale.discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
                  <span className="text-gray-800">Net Amount</span>
                  <span className="text-gray-800">
                    {formatCurrency(netAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payments Made</span>
                  <span className="font-medium">
                    {formatCurrency(totalPayments)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold text-base sm:text-lg">
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

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Customer Information Card */}
            {sale.customer && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                    <User
                      size={18}
                      className="mr-2 text-blue-500 flex-shrink-0"
                    />
                    Customer Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      Name
                    </p>
                    <p className="font-medium text-gray-900 truncate">
                      {sale.customer.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      Phone
                    </p>
                    <p className="font-medium text-gray-900">
                      {sale.customer.phone}
                    </p>
                  </div>
                  {!isRegisteredCustomer && sale.customer.address && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        Billing Address
                      </p>
                      <p className="font-medium text-gray-900">
                        {sale.customer.address}
                      </p>
                    </div>
                  )}
                  {isRegisteredCustomer && (
                    <Link
                      to={`/customer-details/${sale.customer.customerId._id}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      View Details
                      <ExternalLink size={14} />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Additional Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Additional Details
              </h3>

              <div className="space-y-4">
                {sale.otherCharges && sale.otherCharges.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Other Charges
                    </p>
                    <div className="space-y-2">
                      {sale.otherCharges.map((charge, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-600 truncate">
                            {charge.name}
                          </span>
                          <span className="font-medium whitespace-nowrap">
                            ${charge.amount?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sale.payments && sale.payments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Payment History
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {sale.payments.map((payment, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                        >
                          <div className="min-w-0">
                            <p className="text-gray-600 truncate">
                              {formatDate(payment.date)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {payment.method}{" "}
                              {payment.account?.accountName &&
                                `(${payment.account.accountName})`}
                            </p>
                          </div>
                          <span className="font-medium text-green-600 whitespace-nowrap ml-2">
                            ${payment.amount?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                    {sale.notes || "No additional notes for this sale."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Section */}
        {sale.invoiceStatus === "Invoiced" && !isCancelled && (
          <div className="bg-white rounded-xl shadow-sm mt-6">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Invoice History
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <button
                onClick={handleGenerateInvoice}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4 disabled:bg-blue-400 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Printer size={16} />
                {isGenerating ? "Generating..." : "Generate New Invoice"}
              </button>
              <div className="space-y-2">
                {invoiceHistory.length > 0 ? (
                  invoiceHistory.map((invoice) => (
                    <div
                      key={invoice._id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          Invoice #{invoice._id.slice(-6)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
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
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline text-left sm:text-right"
                      >
                        View Invoice
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No invoices generated yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
          title={
            confirmAction.type === "delete" ? "Delete Sale" : "Cancel Sale"
          }
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
    </div>
  );
};

export default SaleDetails;
