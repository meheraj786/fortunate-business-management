import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
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
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UrlContext } from "../../context/UrlContext";
import FormDialog from "../../components/common/FormDialog";
import InputField from "../../components/forms/InputField";
import SelectField from "../../components/forms/SelectField";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import AddSales from "./AddSales";

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { baseUrl } = useContext(UrlContext);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // State for Add Payment Dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "cash",
    bankAccount: "",
  });

  // State for Update Sale Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // State for Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: null }); // type can be 'delete' or 'cancel'
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  const fetchSaleDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}sales/get-sales/${id}`);
      if (response.data.success) {
        setSale(response.data.data);
      } else {
        setError(response.data.message);
        toast.error(response.data.message || "Failed to fetch sale details.");
      }
    } catch (err) {
      setError("Failed to fetch sale details.");
      toast.error("An unexpected error occurred while fetching sale details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${baseUrl}bank/get-all-accounts`);
      if (response.data.success) {
        setAccounts(response.data.data || []);
      } else {
        toast.error("Failed to fetch accounts.");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("An unexpected error occurred while fetching accounts.");
    }
  };

  const fetchInvoiceHistory = async () => {
    try {
      const response = await axios.get(`${baseUrl}invoice/sale/${id}`);
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

  useEffect(() => {
    if (baseUrl && id) {
      fetchSaleDetails();
      fetchInvoiceHistory();
      fetchAccounts();
    }
  }, [id, baseUrl]);

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
        const response = await axios.delete(
          `${baseUrl}sales/delete-sale/${id}`
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
        const response = await axios.patch(`${baseUrl}sales/cancel-sale/${id}`);
        if (response.data.success) {
          toast.success(
            response.data.message || "Sale cancelled successfully",
            { id: toastId }
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
    fetchInvoiceHistory(); // Refresh invoice history as well
  };

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

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post(`${baseUrl}invoice/generate`, {
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

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => {
      const newState = { ...prev, [name]: value };
      // Reset bank account if method changes
      if (name === "method") {
        newState.bankAccount = "";
      }
      return newState;
    });
  };

  const handleAddPayment = async () => {
    const amount = Number(paymentData.amount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    if (amount > balanceDue) {
      toast.error(
        `Payment cannot be greater than the balance due of $${balanceDue.toFixed(
          2
        )}.`
      );
      return;
    }

    // Prepare the payload
    const payload = {
      ...paymentData,
      amount: amount,
    };

    if (paymentData.method === "cash") {
      // For cash payments, explicitly set bankAccount to null
      payload.bankAccount = null;
    } else if (!paymentData.bankAccount) {
      // For bank/mobile-banking, if bankAccount is missing, show error
      toast.error("Please select an account for this payment method.");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const response = await axios.post(
        `${baseUrl}sales/${id}/payments`,
        payload
      );
      if (response.data.success) {
        toast.success(response.data.message || "Payment added successfully!");
        setIsPaymentDialogOpen(false);
        setPaymentData({
          amount: "",
          date: new Date().toISOString().split("T")[0],
          method: "cash",
          bankAccount: "",
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

  const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;

  // Loading and Error States
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
          <p className="text-2xl font-bold mt-4">Loading Sale Details...</p>
        </div>
      </div>
    );
  }

  if (error && !sale) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600 mb-4">Error</p>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center text-blue-500 hover:text-blue-700 hover:underline transition-colors mt-4"
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Sale Not Found</p>
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center text-blue-500 hover:text-blue-700 hover:underline transition-colors mt-4"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Sales
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: `Sale #${sale._id.slice(-6)}` },
  ];

  const isCancelled = sale.invoiceStatus === "Cancelled";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Sale #{sale._id.slice(-6)}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Sold on{" "}
                  {new Date(sale.saleDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isCancelled
                    ? "bg-red-100 text-red-800"
                    : sale.paymentStatus === "Paid Payment"
                    ? "bg-green-100 text-green-800"
                    : sale.paymentStatus === "Due payment"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {isCancelled ? "Cancelled" : sale.paymentStatus}
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${netAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              disabled={isCancelled}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#003b75] text-white rounded-lg hover:bg-[#002a5c] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Edit size={16} />
              Update
            </button>
            <button
              onClick={handleCancelClick}
              disabled={isCancelled}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <XCircle size={16} />
              Cancel
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sale Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Info size={20} className="mr-2 text-blue-500" />
                Sale Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Product</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Package size={16} className="mr-2 text-gray-400" />
                    {sale.product?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quantity</p>
                  <p className="font-medium text-gray-900">
                    {sale.quantity} {sale.unit?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price Per Unit</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(sale.pricePerUnit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(sale.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Invoice Status</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    {sale.invoiceStatus}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <DollarSign size={16} className="mr-2 text-gray-400" />
                    {isCancelled ? "N/A" : sale.paymentStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Financial Summary
                </h3>
                {sale.paymentStatus === "Due payment" &&
                  balanceDue > 0 &&
                  !isCancelled && (
                    <button
                      onClick={() => setIsPaymentDialogOpen(true)}
                      className="px-3 py-1 text-sm bg-[#003b75] text-white rounded-lg hover:bg-[#002a5c] transition-colors"
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
                    <Truck size={16} className="mr-1 text-gray-400" />
                    Delivery Charge
                  </span>
                  <span className="font-medium">
                    {formatCurrency(sale.deliveryCharge)}
                  </span>
                </div>

                {sale.otherCharges && sale.otherCharges.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Other Charges</span>
                    <span className="font-medium">
                      {formatCurrency(totalOtherCharges)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(sale.discount)}
                  </span>
                </div>

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

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold text-lg">
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
          <div className="space-y-6">
            {/* Customer Information */}
            {sale.customer && (
              <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <User size={20} className="mr-2 text-blue-500" />
                  Customer Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-900">
                      {sale.customer.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">
                      {sale.customer.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Billing Address
                    </p>
                    <p className="font-medium text-gray-900">
                      {sale.customer.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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
                          <span className="text-gray-600">{charge.name}</span>
                          <span className="font-medium">
                            ${charge.amount?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sale.invoiceStatus === "Invoiced" &&
                  sale.payments &&
                  sale.payments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Payment History
                      </p>
                      <div className="space-y-2">
                        {sale.payments.map((payment, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-600">
                              {new Date(payment.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            <span className="font-medium text-green-600">
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
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {sale.notes || "No additional notes for this sale."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Section */}
        {sale.invoiceStatus === "Invoiced" && !isCancelled && (
          <div className="bg-white rounded-lg shadow-sm mt-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Invoice History
              </h2>
            </div>
            <div className="p-6">
              <button
                onClick={handleGenerateInvoice}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a5c] transition-colors mb-4 disabled:bg-blue-400"
              >
                <Printer size={16} />
                {isGenerating ? "Generating..." : "Generate New Invoice"}
              </button>
              <div className="space-y-2">
                {invoiceHistory.length > 0 ? (
                  invoiceHistory.map((invoice) => (
                    <div
                      key={invoice._id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          Invoice #{invoice._id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-500">
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
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Invoice
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
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
                name="bankAccount"
                value={paymentData.bankAccount}
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
          <AddSales
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            editData={sale}
            onSaleAdded={onSaleUpdated}
          />
        )}

        {/* Confirmation Modal for Delete and Cancel */}
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
            confirmAction.type === "delete" ? "bg-red-100" : "bg-yellow-100"
          }
          iconTextColor={
            confirmAction.type === "delete" ? "text-red-600" : "text-yellow-600"
          }
          confirmButtonBgColor={
            confirmAction.type === "delete" ? "bg-red-600" : "bg-yellow-500"
          }
          confirmButtonHoverBgColor={
            confirmAction.type === "delete"
              ? "hover:bg-red-700"
              : "hover:bg-yellow-600"
          }
        />
      </div>
    </div>
  );
};

export default SaleDetails;
