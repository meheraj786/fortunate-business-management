import React, { useState, useEffect, useContext } from "react";
import {
  FiFile,
  FiDollarSign,
  FiTruck,
  FiBox,
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiUser,
  FiPieChart,
  FiDownload,
  FiEdit,
  FiTrash,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router";
import CollapsibleCard from "../../components/common/CollapsibleCard";
import { UrlContext } from "../../context/UrlContext";
import axios from "axios";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import toast from "react-hot-toast";

const StatusBadge = ({ status }) => {
  if (!status) return null;

  let bgColor, icon;

  switch (status.toLowerCase()) {
    case "open":
      bgColor = "bg-blue-100 text-blue-800";
      icon = <FiClock className="mr-1" />;
      break;
    case "partially used":
      bgColor = "bg-yellow-100 text-yellow-800";
      icon = <FiAlertCircle className="mr-1" />;
      break;
    case "closed":
    case "completed":
      bgColor = "bg-green-100 text-green-800";
      icon = <FiCheckCircle className="mr-1" />;
      break;
    case "cancelled":
      bgColor = "bg-red-100 text-red-800";
      icon = <FiXCircle className="mr-1" />;
      break;
    case "documents submitted":
      bgColor = "bg-purple-100 text-purple-800";
      icon = <FiClipboard className="mr-1" />;
      break;
    case "pending":
      bgColor = "bg-orange-100 text-orange-800";
      icon = <FiClock className="mr-1" />;
      break;
    default:
      bgColor = "bg-gray-100 text-gray-800";
      icon = <FiClock className="mr-1" />;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor}`}
    >
      {icon}
      {status}
    </span>
  );
};

const DataField = ({ label, value, icon, hidden = false }) => {
  if (hidden || !value) return null;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center text-sm text-gray-500 mb-1">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
};

const LCdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lcData, setLcData] = useState(null);
  const { baseUrl } = useContext(UrlContext);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'delete' or 'export'
  const [isConfirming, setIsConfirming] = useState(false);

  const openConfirmationModal = (action) => {
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);

    if (confirmAction === "delete") {
      try {
        await axios.delete(`${baseUrl}lc/delete-lc/${id}`);
        toast.success("LC deleted successfully");
        navigate("/lc-management");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete LC");
        console.error(error);
      }
    } else if (confirmAction === "export") {
      try {
        const lcNumber = lcData?.basicInfo?.lcNumber || "LC";
        const response = await axios.get(`${baseUrl}lc/export-lc/${id}`, {
          responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `LC-Details-${lcNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("PDF exported successfully!");
      } catch (error) {
        console.error("PDF export error:", error);
        toast.error(error.response?.data?.message || "Failed to export PDF.");
      }
    }

    setIsConfirming(false);
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  };

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${baseUrl}lc/get-lc/${id}`)
      .then((res) => {
        setLcData(res.data.data);
      })
      .catch((err) => console.error(err));
  }, [id, baseUrl]);

  // Helper function to safely format numbers
  const formatNumber = (value) => {
    return value != null ? value.toLocaleString() : "-";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!lcData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading LC Details...
      </div>
    );
  }

  // Safely extract data with fallbacks
  const financialInfo = lcData?.financialInfo || {};
  const shippingCustomsInfo = lcData?.shippingCustomsInfo || {};
  const agentTransportInfo = lcData?.agentTransportInfo || {};
  const productInfo = lcData?.productInfo || [];
  const basicInfo = lcData?.basicInfo || {};
  const documentsNotes = lcData?.documentsNotes || {};

  const sumOtherExpenses = (expenses) => {
    if (!expenses || !Array.isArray(expenses)) return 0;
    return expenses.reduce(
      (total, expense) => total + (expense.amount || 0),
      0
    );
  };

  const otherFinancialExpenses = sumOtherExpenses(financialInfo.otherExpenses);
  const otherShippingExpenses = sumOtherExpenses(
    shippingCustomsInfo.otherExpenses
  );
  const otherAgentExpenses = sumOtherExpenses(agentTransportInfo.otherExpenses);
  const customsTotalBdt =
    (shippingCustomsInfo.customsDutyBdt || 0) +
    (shippingCustomsInfo.vatBdt || 0) +
    (shippingCustomsInfo.aitBdt || 0) +
    otherShippingExpenses;

  const transportOtherBdt =
    (agentTransportInfo.transportCostBdt || 0) + otherAgentExpenses;

  const totalLcCostBdt =
    (financialInfo.lcAmountBdt || 0) +
    (financialInfo.bankChargesBdt || 0) +
    (financialInfo.insuranceCostBdt || 0) +
    customsTotalBdt +
    (agentTransportInfo.cnfAgentCommissionBdt || 0) +
    (agentTransportInfo.indentingAgentCommissionBdt || 0) +
    transportOtherBdt +
    otherFinancialExpenses;

  const totalQuantityValue = productInfo.reduce(
    (total, p) => total + (p.quantityValue || 0),
    0
  );

  const perUnitLandingCostBdt = totalQuantityValue
    ? totalLcCostBdt / totalQuantityValue
    : 0;
  const costSummary = {
    lcAmountBdt: financialInfo.lcAmountBdt || 0,
    bankChargesBdt: financialInfo.bankChargesBdt || 0,
    insuranceCostBdt: financialInfo.insuranceCostBdt || 0,
    customsTotalBdt,
    agentCommissionBdt:
      (agentTransportInfo.cnfAgentCommissionBdt || 0) +
      (agentTransportInfo.indentingAgentCommissionBdt || 0),
    transportOtherBdt,
    totalLcCostBdt,
    perUnitLandingCostBdt,
    otherFinancialExpenses,
  };

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <motion.div
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Letter of Credit Details
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Comprehensive view of your Letter of Credit
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={() => openConfirmationModal("export")}
              className="cursor-pointer flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiDownload className="mr-2" />
              Export
            </button>
            <button
              onClick={() => navigate(`/lc-form/${id}`)}
              className="cursor-pointer flex items-center px-4 py-2 bg-[#003b75] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#002855]"
            >
              <FiEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={() => openConfirmationModal("delete")}
              className="cursor-pointer flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700"
            >
              <FiTrash className="mr-2" />
              Delete
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <CollapsibleCard title="Basic LC Information" icon={<FiFile />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="LC Number" value={basicInfo.lcNumber} />
                <DataField
                  label="LC Opening Date"
                  value={formatDate(basicInfo.lcOpeningDate)}
                />
                <DataField label="Bank Name" value={basicInfo.bankName} />
                <DataField
                  label="Status"
                  value={<StatusBadge status={basicInfo.status} />}
                />
                <DataField
                  label="Supplier Name"
                  value={basicInfo.supplierName}
                />
                <DataField
                  label="Supplier Country"
                  value={basicInfo.supplierCountry}
                />
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Financial Information"
              icon={<FiDollarSign />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="LC Amount (USD)"
                  value={formatNumber(financialInfo.lcAmountUsd)}
                />
                <DataField
                  label="Exchange Rate"
                  value={financialInfo.exchangeRate || "-"}
                />
                <DataField
                  label="LC Amount (BDT)"
                  value={formatNumber(financialInfo.lcAmountBdt)}
                />
                <DataField
                  label="LC Margin Paid (BDT)"
                  value={formatNumber(financialInfo.lcMarginPaidBdt)}
                />
                <DataField
                  label="Bank Charges (BDT)"
                  value={formatNumber(financialInfo.bankChargesBdt)}
                />
                <DataField
                  label="Insurance Cost (BDT)"
                  value={formatNumber(financialInfo.insuranceCostBdt)}
                />
              </div>
              {financialInfo.otherExpenses?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h3 className="text-md font-semibold mb-2">Other Expenses</h3>
                  <div className="space-y-2">
                    {financialInfo.otherExpenses.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{expense.name}</span>
                        <span className="font-medium">
                          {formatNumber(expense.amount)} BDT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleCard>

            <CollapsibleCard title="Product Information" icon={<FiBox />}>
              {productInfo.map((p, index) => (
                <div
                  key={p._id || index}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b  border-gray-300 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"
                >
                  <DataField label="Item Name" value={p.itemName} />
                  <DataField
                    label="Unit Price (USD)"
                    value={formatNumber(p.unitPriceUsd)}
                  />
                  {p.specification && (
                    <DataField
                      label="Specification"
                      value={[
                        p.specification.thickness_mm &&
                          `Thickness: ${p.specification.thickness_mm}mm`,
                        p.specification.width_mm &&
                          `Width: ${p.specification.width_mm}mm`,
                        p.specification.length_mm &&
                          `Length: ${p.specification.length_mm}mm`,
                        p.specification.grade &&
                          `Grade: ${p.specification.grade}`,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    />
                  )}
                  <DataField
                    label="Total Value (USD)"
                    value={formatNumber(p.totalValueUsd)}
                  />
                  <DataField
                    label="Quantity Unit"
                    value={p.quantityUnit?.name || "-"}
                  />
                  <DataField
                    label={`Quantity (${p.quantityUnit?.name || "N/A"})`}
                    value={p.quantityValue || "-"}
                  />
                </div>
              ))}
            </CollapsibleCard>

            <CollapsibleCard
              title="Shipping & Customs Information"
              icon={<FiTruck />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="Port of Shipment"
                  value={shippingCustomsInfo.portOfShipment}
                />
                <DataField
                  label="Expected Arrival Date"
                  value={formatDate(shippingCustomsInfo.expectedArrivalDate)}
                />
                <DataField
                  label="Customs Duty (BDT)"
                  value={formatNumber(shippingCustomsInfo.customsDutyBdt)}
                />
                <DataField
                  label="VAT (BDT)"
                  value={formatNumber(shippingCustomsInfo.vatBdt)}
                />
                <DataField
                  label="AIT (BDT)"
                  value={formatNumber(shippingCustomsInfo.aitBdt)}
                />
              </div>
              {shippingCustomsInfo.otherExpenses?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h3 className="text-md font-semibold mb-2">Other Expenses</h3>
                  <div className="space-y-2">
                    {shippingCustomsInfo.otherExpenses.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{expense.name}</span>
                        <span className="font-medium">
                          {formatNumber(expense.amount)} BDT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleCard>

            <CollapsibleCard
              title="Agent & Transport Information"
              icon={<FiUser />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="C&F Agent Name"
                  value={agentTransportInfo.cnfAgentName}
                />
                <DataField
                  label="C&F Agent Commission (BDT)"
                  value={formatNumber(agentTransportInfo.cnfAgentCommissionBdt)}
                />
                <DataField
                  label="Indenting Agent Commission (BDT)"
                  value={formatNumber(
                    agentTransportInfo.indentingAgentCommissionBdt
                  )}
                />
                <DataField
                  label="Transport Cost (BDT)"
                  value={formatNumber(agentTransportInfo.transportCostBdt)}
                />
              </div>
              {agentTransportInfo.otherExpenses?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h3 className="text-md font-semibold mb-2">Other Expenses</h3>
                  <div className="space-y-2">
                    {agentTransportInfo.otherExpenses.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{expense.name}</span>
                        <span className="font-medium">
                          {formatNumber(expense.amount)} BDT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleCard>
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-4">
            <CollapsibleCard title="Cost Summary" icon={<FiPieChart />}>
              <div className="space-y-3">
                <DataField
                  label="LC Amount (BDT)"
                  value={formatNumber(costSummary.lcAmountBdt)}
                />
                <DataField
                  label="Bank Charges (BDT)"
                  value={formatNumber(costSummary.bankChargesBdt)}
                />
                <DataField
                  label="Insurance Cost (BDT)"
                  value={formatNumber(costSummary.insuranceCostBdt)}
                />
                <DataField
                  label="Other Financial Expenses"
                  value={formatNumber(costSummary.otherFinancialExpenses)}
                />
                <DataField
                  label="Customs Total (BDT)"
                  value={formatNumber(costSummary.customsTotalBdt)}
                />
                <DataField
                  label="Agent Commission (BDT)"
                  value={formatNumber(costSummary.agentCommissionBdt)}
                />
                <DataField
                  label="Transport & Other (BDT)"
                  value={formatNumber(costSummary.transportOtherBdt)}
                />
                <hr className="my-4 border-gray-200" />
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Cost (BDT)</p>
                  <p className="font-bold text-lg">
                    {formatNumber(costSummary.totalLcCostBdt)}
                  </p>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Documents & Notes" icon={<FiClipboard />}>
              <div className="space-y-4">
                {documentsNotes.uploadedDocuments &&
                  documentsNotes.uploadedDocuments.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">
                        Uploaded Documents
                      </div>
                      <div className="space-y-2">
                        {documentsNotes.uploadedDocuments.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex items-center p-2 bg-gray-50 rounded-md"
                          >
                            <FiFile className="text-gray-400 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-700 truncate">
                                {doc.originalName}
                              </div>
                            </div>
                            <a
                              href={`${baseUrl}lc/${lcData._id}/documents/${doc.storedName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="ml-2 text-[#003b75] hover:text-blue-800"
                            >
                              <FiDownload />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                <DataField label="Remarks" value={documentsNotes.remarks} />
              </div>
            </CollapsibleCard>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirm}
        title={
          confirmAction === "delete" ? "Confirm Deletion" : "Confirm Export"
        }
        description={
          confirmAction === "delete"
            ? `Are you sure you want to delete this Letter of Credit (${lcData?.basicInfo?.lcNumber})? This action cannot be undone.`
            : "Do you want to download the LC details as a PDF file?"
        }
        confirmText={confirmAction === "delete" ? "Delete" : "Export"}
        isConfirming={isConfirming}
        confirmingText={
          confirmAction === "delete" ? "Deleting..." : "Exporting..."
        }
        icon={confirmAction === "delete" ? FiTrash : FiDownload}
        iconBgColor={confirmAction === "delete" ? "bg-red-100" : "bg-blue-100"}
        iconTextColor={
          confirmAction === "delete" ? "text-red-600" : "text-blue-600"
        }
        confirmButtonBgColor={
          confirmAction === "delete" ? "bg-red-600" : "bg-blue-600"
        }
        confirmButtonHoverBgColor={
          confirmAction === "delete" ? "hover:bg-red-700" : "hover:bg-blue-700"
        }
      />
    </div>
  );
};

export default LCdetails;
