import { useNavigate, useParams } from "react-router";
import { getInvoiceAsPNG, getInvoiceAsPDF } from "@/api/invoice.api.js";
import DisplayInvoiceSkeleton from "./components/DisplayInvoiceSkeleton";
import { useSettings } from "@/context/SettingsContext";
import { useInvoice } from "@/api/hooks/invoice";
import { AlertTriangle, ArrowLeft, FileX, Printer, Share2 } from "lucide-react";
import React from "react";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { showErrorToast } from "@/utils/notifications";

const DisplayInvoice = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const { settings, formatCurrency, formatDate } = useSettings();
  const [isSharing, setIsSharing] = React.useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = React.useState(false);

  const {
    data: invoiceData,
    isLoading,
    isError,
    error,
  } = useInvoice(invoiceId);
  const invoice = invoiceData?.data;

  // Credit balance is now included in the getInvoiceById aggregation response
  const creditBalance = invoice?.customerDetails?.creditBalance;

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      const response = await getInvoiceAsPDF(invoiceId);

      // Check if the response is a PDF
      if (response.headers["content-type"] === "application/pdf") {
        const pdfBlob = new Blob([response.data], {
          type: "application/pdf",
        });
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice-${invoice.invoiceId}.pdf`);
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // If not a PDF, it might be a JSON error from our API
        // Try to parse it as text first to see what it is
        const responseText = await new Response(response.data).text();
        try {
          const errorJson = JSON.parse(responseText);
          showErrorToast(
            `Failed to generate PDF: ${errorJson.message || "Unknown error"}`,
          );
        } catch {
          // If it's not JSON, it might be an HTML error page from the server
          console.error("Received non-PDF, non-JSON response:", responseText);
          showErrorToast(
            "Failed to generate PDF. The server returned an unexpected response.",
          );
        }
      }
    } catch (err) {
      console.error("PDF Download request failed:", err);
      showErrorToast("Could not download the PDF. Please try again.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const shareInvoice = async () => {
    if (!navigator.share) {
      showErrorToast(
        "Web Share is not supported on your browser. Try on a mobile device.",
      );
      return;
    }

    setIsSharing(true);
    try {
      // Use the centralized API function which returns a blob
      const response = await getInvoiceAsPNG(invoiceId);
      const imageBlob = response.data; // Axios wraps the blob in the 'data' property

      const imageFile = new File(
        [imageBlob],
        `invoice-${invoice.invoiceId}.png`,
        { type: "image/png" },
      );

      if (!navigator.canShare || !navigator.canShare({ files: [imageFile] })) {
        throw new Error("Your browser doesn't support sharing this file type.");
      }

      await navigator.share({
        files: [imageFile],
        title: `Invoice ${invoice.invoiceId}`,
        text: `Invoice for ${invoice.customerDetails.name}`,
      });
    } catch (err) {
      console.error("Share failed:", err);
      showErrorToast(`Could not share invoice: ${err.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  // --- Render States ---
  if (isLoading) {
    return <DisplayInvoiceSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Error Loading Invoice
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          {error?.message ||
            "Something went wrong while fetching the invoice data."}
        </p>
        <Button onClick={() => navigate(-1)} variant="primary">
          <ArrowLeft size={16} className="mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <FileX className="w-16 h-16 text-gray-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Invoice Not Found
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          The invoice you are looking for does not exist or could not be loaded.
        </p>
        <Button onClick={() => navigate("/sales")} variant="primary">
          <ArrowLeft size={16} className="mr-2" /> Back to Sales
        </Button>
      </div>
    );
  }

  // --- Data Destructuring ---
  const {
    customerDetails,
    paymentAndAmountInfo,
    salesId,
    salesDate,
    invoiceGeneratedDate,
    notes,
    invoiceId: invoiceNumber,
  } = invoice;

  const {
    totalAmount,
    charges = [],
    costs = [],
    discount = 0,
    totalAmountToBePaid,
    payments = [],
  } = paymentAndAmountInfo;

  const totalPayments = payments.filter(p => !p.isReversed).reduce((sum, p) => sum + p.amount, 0);
  const rawBalanceDue = totalAmountToBePaid - totalPayments;
  const balanceDue = Math.max(0, rawBalanceDue);
  const creditedToWallet = rawBalanceDue < 0 ? Math.abs(rawBalanceDue) : 0;

  // --- JSX ---
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* --- Actions Bar (No Print) --- */}
      <div className="py-4 px-4 sm:px-6 lg:px-8 bg-white border-b print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="subtle"
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-700 hover:text-black"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back
            </Button>
            <p className="text-lg font-bold">Invoice {invoiceNumber}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              onClick={handleDownloadPDF}
              isLoading={isDownloadingPDF}
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </Button>
            <Button
              variant="secondary"
              onClick={shareInvoice}
              isLoading={isSharing}
            >
              <Share2 size={14} />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Breadcrumb --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 print:hidden">
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Sales", path: "/sales" },
            {
              label: `Invoice ${invoiceNumber}`,
              path: `/sales/invoice/${invoiceId}`,
            },
          ]}
        />
      </div>

      {/* --- Invoice Paper --- */}
      <main className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div
          className="max-w-5xl mx-auto bg-white shadow-lg"
          id="invoice-paper"
        >
          <article className="p-6 sm:p-12 text-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start pb-4 border-b-2 border-black mb-7">
              <div className="flex flex-col mb-4 sm:mb-0">
                <h1 className="text-[22px] font-bold text-black tracking-wide">
                  {settings?.businessName || "Fortunate Business Management"}
                </h1>
                <div className="text-[11px] text-gray-500 leading-relaxed">
                  {settings?.businessAddress && <span>{settings.businessAddress}<br /></span>}
                  {settings?.businessEmail && <span>{settings.businessEmail}</span>}
                  {settings?.businessPhone && <span> &bull; {settings.businessPhone}</span>}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[28px] font-bold text-black tracking-[2px]">
                  INVOICE
                </div>
                <p className="text-[13px] text-gray-500 mt-0.5"># {invoiceNumber}</p>
                {paymentAndAmountInfo.paymentStatus && (
                  <span
                    className={`inline-block mt-2 px-3.5 py-0.5 text-[11px] font-bold tracking-wider uppercase border-2 border-black ${paymentAndAmountInfo.paymentStatus === "Paid payment"
                        ? "bg-black text-white"
                        : "bg-white text-black"
                      }`}
                  >
                    {paymentAndAmountInfo.paymentStatus === "Paid payment" ? "PAID" : "DUE"}
                  </span>
                )}
              </div>
            </div>

            {/* Bill To & Invoice Details */}
            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Bill To</h3>
                <p className="font-bold text-black">{customerDetails.name}</p>
                <p className="text-gray-600">{customerDetails.address}</p>
                <p className="text-gray-600">{customerDetails.phone}</p>
                {creditBalance != null && (
                  <p className="text-gray-600 font-medium mt-1">
                    Credit Balance: {formatCurrency(creditBalance)}
                  </p>
                )}
              </div>
              <div className="text-left sm:text-right">
                <div>
                  <p>
                    <span className="font-semibold text-gray-800">
                      Invoice Date:
                    </span>{" "}
                    {formatDate(invoiceGeneratedDate)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">
                      Sale Date:
                    </span>{" "}
                    {formatDate(salesDate)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">
                      Sale ID:
                    </span>{" "}
                    #{salesId.slice(-6)}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto mb-12">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="p-2 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ width: '40px' }}>
                      Sl.
                    </th>
                    <th className="p-2 text-left text-[11px] font-semibold uppercase tracking-wider">
                      Item
                    </th>
                    <th className="p-2 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ width: '100px' }}>
                      Qty
                    </th>
                    <th className="p-2 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ width: '120px' }}>
                      Unit Price
                    </th>
                    <th className="p-2 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ width: '120px' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items && invoice.items.length > 0) ? (
                    invoice.items.map((item, index) => (
                      <tr key={index} className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : ''}`}>
                        <td className="p-2 text-center align-top text-[12px]">
                          {index + 1}
                        </td>
                        <td className="p-2 align-top">
                          <p className="font-semibold text-black text-[12px]">
                            {item.name || item.product?.name || "N/A"}
                          </p>
                          <p className="text-gray-400 text-[11px]">{item.category || item.product?.category?.name || ""}</p>
                          {item.remark && (
                            <p className="text-gray-500 text-[11px] italic">{item.remark}</p>
                          )}
                        </td>
                        <td className="p-2 text-center align-top text-[12px]">
                          {item.quantity} {item.unitName || item.unit?.name || ""}
                        </td>
                        <td className="p-2 text-right align-top text-[12px]">
                          {formatCurrency(item.pricePerUnit)}
                        </td>
                        <td className="p-2 text-right align-top text-[12px]">
                          {formatCurrency(item.total || (item.quantity * item.pricePerUnit))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Fallback for legacy invoices (if productDetails exists)
                    invoice.productDetails && (
                      <tr className="border-b border-gray-200">
                        <td className="p-1 sm:p-2 align-top">
                          <p className="font-semibold text-black">
                            {invoice.productDetails.name}
                          </p>
                          <p className="text-gray-600">{invoice.productDetails.category}</p>
                        </td>
                        <td className="p-1 sm:p-2 text-center align-top">
                          {invoice.productDetails.quantity} {invoice.productDetails.unit?.name}
                        </td>
                        <td className="p-1 sm:p-2 text-right align-top">
                          {formatCurrency(invoice.productDetails.pricePerUnit)}
                        </td>
                        <td className="p-1 sm:p-2 text-right align-top">
                          {formatCurrency(
                            invoice.productDetails.pricePerUnit * invoice.productDetails.quantity,
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-x-12 sm:gap-y-8 mb-12">
              {/* Payments Section */}
              <div>
                {payments.length > 0 && (
                  <>
                    <h3 className="font-semibold text-gray-800 mb-3 border-b pb-1">
                      Payments Received
                    </h3>
                    <div className="space-y-2">
                      {payments.map((p) => (
                        <div
                          key={p._id}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center"
                        >
                          <p className="text-gray-600">
                            {formatDate(p.date)} - {p.method}{" "}
                            {p.accountDetails && `(${p.accountDetails.accountName})`}
                          </p>
                          <p className="font-semibold text-black text-left sm:text-right">
                            {formatCurrency(p.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Totals Section */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal:</p>
                  <p className="font-semibold text-black">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                {[...charges, ...costs].map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <p className="text-gray-600">{item.name}:</p>
                    <p className="font-semibold text-black">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
                {discount > 0 && (
                  <div className="flex justify-between">
                    <p className="text-gray-600">Discount:</p>
                    <p className="font-semibold text-black">
                      -{formatCurrency(discount)}
                    </p>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t-2 border-black">
                  <p className="font-bold text-black text-base">Net Amount:</p>
                  <p className="font-bold text-black text-base">
                    {formatCurrency(totalAmountToBePaid)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Total Paid:</p>
                  <p className="font-semibold text-black">
                    {formatCurrency(totalPayments)}
                  </p>
                </div>
                <div className="flex justify-between bg-gray-100 p-2 rounded-md">
                  <p className="font-bold text-black text-base">Balance Due:</p>
                  <p className="font-bold text-black text-base">
                    {formatCurrency(balanceDue)}
                  </p>
                </div>
                {creditedToWallet > 0 && (
                  <div className="flex justify-between bg-blue-50 p-2 rounded-md text-blue-800">
                    <p className="font-bold text-base">Credited to Wallet:</p>
                    <p className="font-bold text-base">
                      {formatCurrency(creditedToWallet)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mb-12">
                <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                <p className="text-gray-600 whitespace-pre-line">{notes}</p>
              </div>
            )}

            {/* Footer */}
            <footer className="text-center pt-8 border-t">
              <p className="text-gray-600">Thank you for your business.</p>
            </footer>
          </article>
        </div>
      </main>

      {/* --- Print Styles --- */}
      <style>{`
        @media print {
          body {
            background-color: #fff;
          }
          #invoice-paper {
            max-width: 100%;
            margin: 0;
            box-shadow: none;
            border: none;
          }
          article {
             padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DisplayInvoice;
