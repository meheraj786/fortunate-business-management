import React, { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  salesData,
  invoiceHistory as allInvoiceHistory,
} from "../../data/data";
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
} from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UrlContext } from "../../context/UrlContext";
import axios from "axios";

const SaleDetails = () => {
  const { id } = useParams();
  const { baseUrl } = useContext(UrlContext);
  const navigate = useNavigate();
  const [sale, setSale] = useState(
    salesData.find((s) => s.id.toString() === id)
  );
  
  useEffect(() => {
    axios
      .get(`${baseUrl}sales/get-sales/${id}`)
      .then((res) => setSale(res.data.data))
      .catch((err) => console.error(err));
  }, [id, baseUrl]);

  console.log(sale);

  if (!sale) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Sale Not Found</p>
          <Link
            to="/sales"
            className="inline-flex items-center text-blue-500 hover:text-blue-700 hover:underline transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Sales
          </Link>
        </div>
      </div>
    );
  }

  const customer = sale.customer;
  const product = sale.product;
  const invoiceHistory = sale?.invoiceHistory?.map((id) =>
    allInvoiceHistory.find((inv) => inv.invoiceId === id)
  );

  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: `Sale #${sale._id?.slice(0, 4) || sale.id}` },
  ];

  const totalOtherCharges = sale?.otherCharges?.reduce(
    (sum, charge) => sum + charge.amount,
    0
  ) || 0;
  
  const totalPayments = sale?.payments?.reduce(
    (sum, payment) => sum + payment.amount,
    0
  ) || 0;
  
  const deliveryCharge = sale?.deliveryCharge || 0;
  const discount = sale?.discount || 0;
  
  const netAmount = sale.totalAmount + deliveryCharge + totalOtherCharges - discount;
  const balanceDue = netAmount - totalPayments;

  // Payment status calculation
  const paymentStatus = sale.due > 0 ? "Due Payment" : "Paid Payment";

  const handleGenerateInvoice = () => {
    const invoiceSnapshot = {
      invoiceId: `INV-${sale._id}-${(invoiceHistory?.length || 0) + 1}`,
      generationDate: new Date().toISOString(),
      saleId: sale._id,
      saleDate: sale.date,
      customer: customer,
      product: {
        productName: product?.name || sale.productName,
        quantity: sale.quantity,
        unit: sale.unit,
        size: sale.size,
        pricePerUnit: sale.price,
        totalAmount: sale.totalAmount,
      },
      financials: {
        totalAmount: sale.totalAmount,
        deliveryCharge: deliveryCharge,
        otherCharges: sale.otherCharges || [],
        discount: discount,
        netAmount: netAmount,
        totalPayments: totalPayments,
        balanceDue: balanceDue,
      },
      lcNumber: sale.lcNumber,
      category: sale.category,
      notes: sale.notes,
    };

    const updatedSale = {
      ...sale,
      invoiceHistory: [...(sale.invoiceHistory || []), invoiceSnapshot.invoiceId],
    };
    setSale(updatedSale);

    allInvoiceHistory.push(invoiceSnapshot);

    navigate(`/sales/${sale._id}/invoice/${invoiceSnapshot.invoiceId}`, {
      state: { invoice: invoiceSnapshot },
    });
  };

  const additionalDetailsCard = (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Additional Details
      </h3>

      <div className="space-y-4">
        {sale?.lcNumber && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">LC Number</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {sale.lcNumber}
            </p>
          </div>
        )}

        {sale?.category && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Category</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {sale.category}
            </p>
          </div>
        )}

        {sale?.otherCharges?.length > 0 && (
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
                    ${charge.amount?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sale?.invoiceStatus === "yes" && sale?.payments?.length > 0 && (
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
                    {new Date(payment.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-medium text-green-600">
                    ${payment.amount?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
            {sale.notes || "No additional notes for this sale."}
          </p>
        </div>
      </div>
    </div>
  );

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
                  Sale #{sale._id?.slice(0, 6) || sale.id}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Sold on{" "}
                  {new Date(sale.date).toLocaleDateString("en-US", {
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
                  paymentStatus === "Paid Payment"
                    ? "bg-green-100 text-green-800"
                    : paymentStatus === "Due Payment"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {paymentStatus}
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${netAmount?.toFixed(2)}
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
                    {product?.name || sale.productName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quantity</p>
                  <p className="font-medium text-gray-900">
                    {sale.quantity} {sale.unit}
                  </p>
                </div>
                {sale.size && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Size</p>
                    <p className="font-medium text-gray-900">{sale.size}</p>
                  </div>
                )}
                {product?.size && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product Size</p>
                    <p className="font-medium text-gray-900">{product.size}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price Per Unit</p>
                  <p className="font-medium text-gray-900">
                    ${sale.price?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="font-medium text-gray-900">
                    ${sale.totalAmount?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Invoice Status</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    {sale.invoiceStatus === "yes" ? "Invoiced" : "Not Invoiced"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <DollarSign size={16} className="mr-2 text-gray-400" />
                    {paymentStatus}
                  </p>
                </div>
                {sale.due !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Due Amount</p>
                    <p className="font-medium text-gray-900">
                      ${sale.due?.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Details */}
            {sale.invoiceStatus === "yes" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Financial Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ${sale.totalAmount?.toFixed(2)}
                    </span>
                  </div>

                  {deliveryCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center">
                        <Truck size={16} className="mr-1 text-gray-400" />
                        Delivery Charge
                      </span>
                      <span className="font-medium">
                        ${deliveryCharge?.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {sale?.otherCharges?.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Other Charges</span>
                      <span className="font-medium">
                        ${totalOtherCharges?.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -${discount?.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
                    <span className="text-gray-800">Net Amount</span>
                    <span className="text-gray-800">
                      ${netAmount?.toFixed(2)}
                    </span>
                  </div>

                  {totalPayments > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payments Made</span>
                      <span className="font-medium">
                        ${totalPayments?.toFixed(2)}
                      </span>
                    </div>
                  )}

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
                      ${Math.abs(balanceDue)?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Additional Details (Mobile) */}
            <div className="lg:hidden">{additionalDetailsCard}</div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            {customer && (
              <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <User size={20} className="mr-2 text-blue-500" />
                  Customer Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                  </div>
                  {customer.phone && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-900">
                        {customer.phone}
                      </p>
                    </div>
                  )}
                  {customer.email && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900 break-all">
                        {customer.email}
                      </p>
                    </div>
                  )}
                  {customer.location && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-medium text-gray-900 text-sm leading-relaxed">
                        {customer.location}
                      </p>
                    </div>
                  )}
                  {customer.billingAddress && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Billing Address
                      </p>
                      <p className="font-medium text-gray-900 text-sm leading-relaxed">
                        {customer.billingAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Details (Desktop) */}
            <div className="hidden lg:block">{additionalDetailsCard}</div>
          </div>
        </div>

        {/* Invoice Section */}
        {sale.invoiceStatus === "yes" && (
          <div className="bg-white rounded-lg shadow-sm mt-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Invoice History
              </h2>
            </div>
            <div className="p-6">
              <button
                onClick={handleGenerateInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
              >
                <Printer size={16} />
                Generate New Invoice
              </button>
              <div className="space-y-2">
                {invoiceHistory?.length > 0 ? (
                  invoiceHistory.map((invoice) => (
                    <div
                      key={invoice.invoiceId}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {invoice.invoiceId}
                        </p>
                        <p className="text-sm text-gray-500">
                          Generated:{" "}
                          {new Date(invoice.generationDate).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(
                            `/sales/${sale._id}/invoice/${invoice.invoiceId}`,
                            { state: { invoice } }
                          )
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
      </div>
    </div>
  );
};

export default SaleDetails;