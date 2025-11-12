import React, { useState } from "react";
import { Printer, Download, ArrowLeft } from "lucide-react";

// Sales data from the dashboard
const salesData = [
  {
    id: 1,
    productName: "Mild Steel Rod",
    quantity: 25,
    price: 2805,
    date: "2024-09-21",
    customer: "Rahman Steel Works",
    unit: "pieces",
    description: "12mm x 12m Mild Steel Rod",
  },
  {
    id: 2,
    productName: "Galvanized Steel Sheet",
    quantity: 10,
    price: 4950,
    date: "2024-09-22",
    customer: "Metro Construction",
    unit: "sheets",
    description: "4ft x 8ft x 2mm Galvanized Steel Sheet",
  },
  {
    id: 3,
    productName: "Steel Angle Bar",
    quantity: 8,
    price: 2063,
    date: "2024-09-20",
    customer: "Building Solutions Ltd",
    unit: "pieces",
    description: "50mm x 50mm x 6m Steel Angle Bar",
  },
  {
    id: 4,
    productName: "Stainless Steel Plate",
    quantity: 2,
    price: 13750,
    date: "2024-09-19",
    customer: "Industrial Fabricators",
    unit: "plates",
    description: "3ft x 6ft x 5mm Stainless Steel Plate",
  },
  {
    id: 5,
    productName: "Steel Pipe",
    quantity: 5,
    price: 7205,
    date: "2024-09-18",
    customer: "Pipe & Fittings Co",
    unit: "pieces",
    description: "6 inch diameter x 6m Steel Pipe",
  },
];

// Company information
const companyInfo = {
  name: "Bangladesh Steel Trading Co.",
  address: "123 Commercial Area, Dhaka-1205, Bangladesh",
  phone: "+880 1712-345678",
  email: "info@steeltrading.com",
  bin: "123456789012",
  vatReg: "VAT-BD-456789",
};

const InvoiceGenerator = () => {
  const [selectedSale, setSelectedSale] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNumber] = useState(`INV-${Date.now()}`);
  const [invoiceDate] = useState(new Date().toLocaleDateString("en-GB"));

  const handleGenerateInvoice = (sale) => {
    setSelectedSale(sale);
    setShowInvoice(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateTotals = (sale) => {
    const subtotal = sale.quantity * sale.price;
    const vatAmount = subtotal * 0.15; // 15% VAT
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  if (!showInvoice) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Generate Invoice
          </h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Select a Sale to Generate Invoice
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {salesData.map((sale) => {
                  const totals = calculateTotals(sale);
                  return (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {sale.productName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Customer: {sale.customer}
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {sale.date}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {sale.quantity} {sale.unit} × ৳
                              {sale.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              Total: ৳{totals.total.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Subtotal: ৳{totals.subtotal.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              VAT (15%): ৳{totals.vatAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleGenerateInvoice(sale)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Generate Invoice
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals(selectedSale);

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-gray-50 p-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setShowInvoice(false)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </button>
          <div className="space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </button>
          </div>
        </div>
      </div>

      {/* A4 Invoice Layout */}
      <div
        className="max-w-4xl mx-auto p-8 bg-white"
        style={{ minHeight: "297mm", width: "210mm" }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {companyInfo.name}
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{companyInfo.address}</p>
                <p>Phone: {companyInfo.phone}</p>
                <p>Email: {companyInfo.email}</p>
                <p>
                  BIN: {companyInfo.bin} | VAT Reg: {companyInfo.vatReg}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-semibold">Invoice No:</span>{" "}
                  {invoiceNumber}
                </p>
                <p>
                  <span className="font-semibold">Date:</span> {invoiceDate}
                </p>
                <p>
                  <span className="font-semibold">Sale Date:</span>{" "}
                  {selectedSale.date}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-900">
              {selectedSale.customer}
            </p>
            <p className="text-gray-600">Customer Address</p>
            <p className="text-gray-600">Contact Information</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Unit
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Quantity
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">
                  Unit Price
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-4">
                  <div>
                    <p className="font-semibold">{selectedSale.productName}</p>
                    <p className="text-sm text-gray-600">
                      {selectedSale.description}
                    </p>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-4 text-center">
                  {selectedSale.unit}
                </td>
                <td className="border border-gray-300 px-4 py-4 text-center">
                  {selectedSale.quantity}
                </td>
                <td className="border border-gray-300 px-4 py-4 text-right">
                  ৳{selectedSale.price.toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-4 text-right font-semibold">
                  ৳{totals.subtotal.toLocaleString()}
                </td>
              </tr>
              {/* Empty rows for spacing */}
              {[...Array(3)].map((_, i) => (
                <tr key={i} className="h-12">
                  <td className="border border-gray-300 px-4 py-4"></td>
                  <td className="border border-gray-300 px-4 py-4"></td>
                  <td className="border border-gray-300 px-4 py-4"></td>
                  <td className="border border-gray-300 px-4 py-4"></td>
                  <td className="border border-gray-300 px-4 py-4"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (15%):</span>
                  <span>৳{totals.vatAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>৳{totals.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        {/* <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Terms & Notes:</h3>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li>Payment is due within 30 days of invoice date</li>
              <li>Late payments may incur additional charges</li>
              <li>Please include invoice number in payment reference</li>
              <li>All goods sold are subject to our standard terms and conditions</li>
            </ul>
          </div>
        </div> */}

        {/* Amount in Words */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Amount in Words:
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold">
              Taka {numberToWords(Math.round(totals.total))} Only
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-600">
                Thank you for your business!
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This is a computer-generated invoice.
              </p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 w-48 mb-2"></div>
              <p className="text-sm font-semibold">Authorized Signature</p>
              <p className="text-xs text-gray-600">{companyInfo.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert numbers to words (simplified version)
const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  if (num === 0) return "Zero";

  let words = "";

  // Millions
  if (num >= 1000000) {
    words += numberToWords(Math.floor(num / 1000000)) + " Million ";
    num %= 1000000;
  }

  // Thousands
  if (num >= 1000) {
    words += numberToWords(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }

  // Hundreds
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }

  // Tens and ones
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  } else if (num >= 10) {
    words += teens[num - 10] + " ";
    num = 0;
  }

  if (num > 0) {
    words += ones[num] + " ";
  }

  return words.trim();
};

export default InvoiceGenerator;
