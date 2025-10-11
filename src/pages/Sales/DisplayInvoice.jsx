import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Printer, ArrowLeft } from 'lucide-react';

const DisplayInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { invoice } = location.state || {};

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Invoice Data Not Found</p>
          <button 
            onClick={() => navigate(`/sales/${id}`)} 
            className="inline-flex items-center text-blue-500 hover:text-blue-700 hover:underline transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Sale Details
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <button 
            onClick={() => navigate(`/sales/${id}`)} 
            className="inline-flex items-center bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Sale Details
          </button>
          <button 
            onClick={handlePrint} 
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Printer size={16} className="mr-2" />
            Print Invoice
          </button>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg print-area">
          {/* Invoice Header */}
          <div className="flex justify-between items-start pb-8 border-b">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-gray-500">Invoice #: {invoice.invoiceId}</p>
              <p className="text-gray-500">Generated: {new Date(invoice.generationDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-semibold text-gray-800">Your Company</h2>
              <p className="text-gray-600">123 Business Rd, Dhaka</p>
            </div>
          </div>

          {/* Customer & Sale Info */}
          <div className="grid grid-cols-2 gap-8 py-8">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
              <p className="font-medium text-gray-900">{invoice.customer.name}</p>
              <p className="text-gray-600">{invoice.customer.contactInfo.billingAddress}</p>
              <p className="text-gray-600">{invoice.customer.contactInfo.email}</p>
              <p className="text-gray-600">{invoice.customer.phone}</p>
            </div>
            <div className="text-right">
              <p><span className="font-semibold">Sale ID:</span> #{invoice.saleId}</p>
              <p><span className="font-semibold">Sale Date:</span> {new Date(invoice.saleDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Product</th>
                <th className="text-center p-3 font-medium text-gray-600">Quantity</th>
                <th className="text-right p-3 font-medium text-gray-600">Unit Price</th>
                <th className="text-right p-3 font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">{invoice.product.productName}</td>
                <td className="text-center p-3">{invoice.product.quantity} {invoice.product.unit}</td>
                <td className="text-right p-3">${invoice.product.pricePerUnit.toFixed(2)}</td>
                <td className="text-right p-3">${invoice.product.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Financial Summary */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>${invoice.financials.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charge:</span>
                <span>${invoice.financials.deliveryCharge.toFixed(2)}</span>
              </div>
              {invoice.financials.otherCharges.map((charge, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-600">{charge.name}:</span>
                  <span>${charge.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="text-green-600">-${invoice.financials.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span className="text-gray-900">Net Amount:</span>
                <span className="text-gray-900">${invoice.financials.netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payments Made:</span>
                <span>${invoice.financials.totalPayments.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-bold text-lg pt-2 border-t ${invoice.financials.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                <span>{invoice.financials.balanceDue > 0 ? 'Balance Due:' : 'Overpayment:'}</span>
                <span>${Math.abs(invoice.financials.balanceDue).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="font-semibold text-gray-700 mb-2">Notes:</h3>
              <p className="text-gray-600 text-sm">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @media print {
            .no-print { display: none; }
            .print-area { 
              box-shadow: none; 
              border: none;
              margin: 0;
              padding: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DisplayInvoice;
