import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, Printer } from "lucide-react";

import Button from "@/components/ui/Button";
import { useSettings } from "@/context/SettingsContext";
import { getInvoiceAsPDF } from "@/api/invoice.api";
import { showErrorToast } from "@/utils/notifications";

const SaleInvoiceHistory = ({
  invoiceHistory,
  hasPermission,
  generateInvoiceLoading,
  onGenerateInvoiceClick,
  onViewInvoiceClick,
}) => {
  const { formatDateTime } = useSettings();
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPDF = async (inv) => {
    setDownloadingId(inv._id);
    try {
      const response = await getInvoiceAsPDF(inv._id);
      if (response.headers["content-type"] === "application/pdf") {
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice-${inv.invoiceId || inv._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        showErrorToast("Could not download the invoice PDF.");
      }
    } catch (err) {
      console.error("PDF download error:", err);
      showErrorToast("Failed to download invoice PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
        {hasPermission("SALE_GENERATE_INVOICE") && (
          <Button
            onClick={onGenerateInvoiceClick}
            disabled={generateInvoiceLoading}
            isLoading={generateInvoiceLoading}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>Generate New Invoice</span>
          </Button>
        )}
      </div>
      {invoiceHistory?.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {invoiceHistory.map((inv) => (
              <motion.div
                key={inv._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">
                      {inv.invoiceId || `Invoice #${inv._id.slice(-6)}`}
                    </p>
                    {inv.paymentAndAmountInfo?.paymentStatus && (
                      <span
                        className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                          inv.paymentAndAmountInfo.paymentStatus === "Paid payment" ||
                          inv.paymentAndAmountInfo.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : inv.paymentAndAmountInfo.paymentStatus === "Partial"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {inv.paymentAndAmountInfo.paymentStatus === "Paid payment" ||
                        inv.paymentAndAmountInfo.paymentStatus === "Paid"
                          ? "PAID"
                          : inv.paymentAndAmountInfo.paymentStatus === "Partial"
                          ? "PARTIAL"
                          : "DUE"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>Generated on {formatDateTime(inv.invoiceGeneratedDate)}</span>
                    {inv.warehouseName && inv.warehouseName !== "N/A" && (
                      <span>&bull; Warehouse: <strong className="text-gray-700">{inv.warehouseName}</strong></span>
                    )}
                    {inv.createdBy?.name && inv.createdBy?.name !== "N/A" && (
                      <span>&bull; Invoiced by: <strong className="text-gray-700">{inv.createdBy.name}</strong></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {hasPermission("SALE_DOWNLOAD_INVOICE") && (
                    <Button
                      onClick={() => handleDownloadPDF(inv)}
                      disabled={downloadingId === inv._id}
                      isLoading={downloadingId === inv._id}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1.5 text-xs"
                      title="Download PDF"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">PDF</span>
                    </Button>
                  )}
                  {hasPermission("SALE_VIEW_INVOICE") && (
                    <Button
                      onClick={() => onViewInvoiceClick(inv._id)}
                      variant="subtle"
                      size="sm"
                      className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:underline"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">
          No invoices generated yet
        </p>
      )}
    </div>
  );
};

export default SaleInvoiceHistory;
