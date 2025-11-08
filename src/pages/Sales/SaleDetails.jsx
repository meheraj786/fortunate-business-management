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
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UrlContext } from "../../context/UrlContext";
import FormDialog from "../../components/common/FormDialog";
import InputField from "../../components/forms/InputField";
import SelectField from "../../components/forms/SelectField";

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { baseUrl } = useContext(UrlContext);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for Add Payment Dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "cash",
  });

  const fetchSaleDetails = async () => {
    try {
      const response = await fetch(`${baseUrl}sales/get-sales/${id}`);
      const result = await response.json();

      if (result.success) {
        setSale(result.data);
      } else {
        setError(result.message);
        toast.error(result.message || "Failed to fetch sale details.");
      }
    } catch (err) {
      setError("Failed to fetch sale details.");
      toast.error("An unexpected error occurred while fetching sale details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceHistory = async () => {
    try {
      const response = await fetch(`${baseUrl}invoice/sale/${id}`);
      const result = await response.json();
      if (result.success) {
        setInvoiceHistory(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch invoice history:", error);
    }
  };

  useEffect(() => {
    if (baseUrl && id) {
      fetchSaleDetails();
      fetchInvoiceHistory();
    }
  }, [id, baseUrl]);

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
      const response = await fetch(`${baseUrl}invoice/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleId: id }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Invoice generated successfully!");
        navigate(`/sales/${id}/invoice/${result.data._id}`);
      } else {
        toast.error(result.message || "Failed to generate invoice.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while generating the invoice.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handlePaymentFormChange = (e) => {
  //   console.log("Change event:", e.target.name, e.target.value); // Debug line
  //   const { name, value } = e.target;
  //   setPaymentData((prev) => ({ ...prev, [name]: value }));
  // };

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

    setIsSubmittingPayment(true);
    try {
      const response = await fetch(`${baseUrl}sales/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentData,
          amount: amount,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Payment added successfully!");
        setIsPaymentDialogOpen(false);
        setPaymentData({
          amount: "",
          date: new Date().toISOString().split("T")[0],
          method: "cash",
        });
        await fetchSaleDetails();
      } else {
        toast.error(result.message || "Failed to add payment.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while adding the payment.");
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
                  sale.paymentStatus === "Paid Payment"
                    ? "bg-green-100 text-green-800"
                    : sale.paymentStatus === "Due payment"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {sale.paymentStatus}
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${netAmount.toFixed(2)}
              </p>
            </div>
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
                    {sale.quantity} {sale.unit}
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
                    {sale.paymentStatus}
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
                {sale.paymentStatus === "Due payment" && balanceDue > 0 && (
                  <button
                    onClick={() => setIsPaymentDialogOpen(true)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        {sale.invoiceStatus === "Invoiced" && (
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4 disabled:bg-blue-400"
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
              name="amount" // ← This is crucial
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
                { value: "bank", label: "Bank" },
                { value: "card", label: "Card" },
                { value: "other", label: "Other" },
              ]}
              required
            />
          </div>
        </FormDialog>
      </div>
    </div>
  );
};

export default SaleDetails;
