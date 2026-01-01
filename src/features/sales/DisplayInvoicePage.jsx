import React from "react";
import { useNavigate, useParams } from "react-router";
import { Printer, ArrowLeft, Download, Mail, Share2 } from "lucide-react";
import { useInvoice } from "@/api/hooks/invoice";
import DisplayInvoiceSkeleton from "./components/DisplayInvoiceSkeleton";

const DisplayInvoice = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();

  const {
    data: invoiceData,
    isLoading,
    isError,
    error,
  } = useInvoice(invoiceId);
  const invoice = invoiceData?.data;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <DisplayInvoiceSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600 mb-4">Error</p>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-primary hover:text-primary-hover hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Invoice Data Not Found</p>
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center text-primary hover:text-primary-hover hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Sales
          </button>
        </div>
      </div>
    );
  }

  const {
    productDetails,
    customerDetails,
    paymentAndAmountInfo,
    salesId,
    salesDate,
    invoiceGeneratedDate,
    notes,
    _id: fetchedInvoiceId,
  } = invoice;
  const totalPayments = paymentAndAmountInfo.payments.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const balanceDue = paymentAndAmountInfo.totalAmountToBePaid - totalPayments;

  return (
    <div className="">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-grow p-4 sm:p-8 print-area">
          <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-lg">
            <div className="flex justify-between items-start pb-8 border-b">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-gray-500">#{fetchedInvoiceId.slice(-6)}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Your Company
                </h2>
                <p className="text-gray-600">123 Business Rd, Dhaka</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 py-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
                <p className="font-medium text-gray-900">
                  {customerDetails.name}
                </p>
                <p className="text-gray-600">{customerDetails.phone}</p>
                <p className="text-gray-600">{customerDetails.address}</p>
              </div>
              <div className="text-right">
                <p>
                  <span className="font-semibold">Sale ID:</span> #
                  {salesId.slice(-6)}
                </p>
                <p>
                  <span className="font-semibold">Sale Date:</span>{" "}
                  {new Date(salesDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Generated:</span>{" "}
                  {new Date(invoiceGeneratedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <table className="w-full mb-8">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">
                    Product
                  </th>
                  <th className="text-center p-3 font-medium text-gray-600">
                    Quantity
                  </th>
                  <th className="text-right p-3 font-medium text-gray-600">
                    Unit Price
                  </th>
                  <th className="text-right p-3 font-medium text-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">{productDetails.name}</td>
                  <td className="text-center p-3">
                    {productDetails.quantity}{" "}
                    {productDetails.unit?.name || productDetails.unit}
                  </td>
                  <td className="text-right p-3">
                    ${productDetails.pricePerUnit.toFixed(2)}
                  </td>
                  <td className="text-right p-3">
                    $
                    {(
                      productDetails.pricePerUnit * productDetails.quantity
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${paymentAndAmountInfo.totalAmount.toFixed(2)}</span>
                </div>
                {paymentAndAmountInfo.otherCharges.map((charge, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-600">{charge.name}:</span>
                    <span>${charge.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-green-600">
                    -${paymentAndAmountInfo.discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span className="text-gray-900">Net Amount:</span>
                  <span className="text-gray-900">
                    ${paymentAndAmountInfo.totalAmountToBePaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payments Made:</span>
                  <span>${totalPayments.toFixed(2)}</span>
                </div>
                <div
                  className={`flex justify-between font-bold text-lg pt-2 border-t ${
                    balanceDue > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  <span>
                    {balanceDue > 0 ? "Balance Due:" : "Overpayment:"}
                  </span>
                  <span>${Math.abs(balanceDue).toFixed(2)}</span>
                </div>
              </div>
            </div>
            {notes && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="font-semibold text-gray-700 mb-2">Notes:</h3>
                <p className="text-gray-600 text-sm">{notes}</p>
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:w-80 bg-white lg:h-screen p-6 no-print">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Actions</h3>
            <button
              onClick={() => navigate(`/sales/${salesId}`)}
              className="w-full inline-flex items-center justify-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Sale Details
            </button>
            <button
              onClick={handlePrint}
              className="w-full inline-flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover"
            >
              <Printer size={16} className="mr-2" />
              Print / Save as PDF
            </button>
            <button className="w-full inline-flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
              <Download size={16} className="mr-2" />
              Download
            </button>
            <button className="w-full inline-flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
              <Mail size={16} className="mr-2" />
              Send via Email
            </button>
            <button className="w-full inline-flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
              <Share2 size={16} className="mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>
      <style>{`@media print { .no-print { display: none; } .print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; padding: 0; margin: 0; } body { -webkit-print-color-adjust: exact; } }`}</style>
    </div>
  );
};

export default DisplayInvoice;
