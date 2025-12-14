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
  FiCreditCard,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router";
import CollapsibleCard from "@/components/ui/CollapsibleCard";

import api from "@/services/apiService";
import { UrlContext } from "../../context/UrlContext";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";

const StatusBadge = ({ status }) => {
  if (!status) return null;

  let bgColor, icon;

  switch (status.toLowerCase()) {
    case "draft":
      bgColor = "bg-gray-100 text-gray-800";
      icon = <FiClock className="mr-1" />;
      break;
    case "active":
      bgColor = "bg-blue-100 text-blue-800";
      icon = <FiClock className="mr-1" />;
      break;
    case "completed":
      bgColor = "bg-green-100 text-green-800";
      icon = <FiCheckCircle className="mr-1" />;
      break;
    case "cancelled":
      bgColor = "bg-red-100 text-red-800";
      icon = <FiXCircle className="mr-1" />;
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
  if (hidden || value === null || value === undefined || value === "")
    return null;

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

const CostField = ({ cost }) => {
  if (!cost) return null;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center text-sm text-gray-500 mb-1">
        <FiDollarSign className="mr-2" />
        {cost.name} (BDT)
      </div>
      <div className="text-gray-900 font-medium">
        {cost.amount ? `${Number(cost.amount).toLocaleString("en-IN")}` : "-"}
      </div>
    </div>
  );
};

const LCdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lcData, setLcData] = useState(null);
  const { baseUrl } = useContext(UrlContext);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const openConfirmationModal = (action) => {
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);

    if (confirmAction === "delete") {
      try {
        await api.delete(`/lc/delete-lc/${id}`);
        toast.success("LC deleted successfully");
        navigate("/lc-management");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete LC");
        console.error(error);
      }
    } else if (confirmAction === "export") {
      try {
        const lcNumber = lcData?.basicInfo?.lcNumber || "LC";
        const response = await api.get(`/lc/export-lc/${id}`, {
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
    api
      .get(`/lc/get-lc/${id}`)
      .then((res) => {
        setLcData(res.data.data);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "-";
    return Number(value).toLocaleString("en-IN");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPaymentMethodDisplay = (cost) => {
    if (!cost.paymentMethod) return "";

    if (cost.paymentMethod === "Cash") {
      return "Cash";
    } else if (cost.accountId) {
      const { accountHolderName, accountName, bankName, serviceName } =
        cost.accountId;
      const institutionName =
        cost.paymentMethod === "Bank" ? bankName : serviceName;
      const accountDisplay = `${accountHolderName} (${accountName})`;

      return `${cost.paymentMethod}: ${accountDisplay} - ${institutionName}`;
    }

    return cost.paymentMethod;
  };

  if (!lcData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003b75]"></div>
      </div>
    );
  }

  const {
    basicInfo = {},
    financialInfo = {},
    shippingCustomsInfo = {},
    agentTransportInfo = {},
    productInfo = [],
    documentsNotes = {},
    otherExpenses = {},
  } = lcData;

  // Calculate totals
  const totalProductsValueUsd = productInfo.reduce(
    (total, p) => total + (p.totalValueUsd || 0),
    0
  );
  const allCosts = [
    ...(financialInfo.costs || []),
    ...(shippingCustomsInfo.costs || []),
    ...(agentTransportInfo.costs || []),
    ...(otherExpenses.costs || []),
  ];
  const totalLcExpenses = allCosts.reduce(
    (total, cost) => total + (cost.amount || 0),
    0
  );

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-5 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#003b75] rounded-lg">
                  <FiFile className="text-white text-xl" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {basicInfo.lcNumber || "Letter of Credit Details"}
                </h1>
              </div>
              <p className="text-gray-600 ml-12">
                Comprehensive view of your Letter of Credit
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <button
                onClick={() => openConfirmationModal("export")}
                className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow"
              >
                <FiDownload className="mr-2" />
                Export
              </button>
              <button
                onClick={() => navigate(`/lc-form/${id}`)}
                className="flex items-center px-4 py-2.5 bg-[#003b75] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#002855] transition-colors duration-200 shadow-sm hover:shadow"
              >
                <FiEdit className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => openConfirmationModal("delete")}
                className="flex items-center px-4 py-2.5 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow"
              >
                <FiTrash className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic LC Information */}
            <CollapsibleCard
              title="Basic LC Information"
              icon={<FiFile className="text-[#003b75]" />}
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <DataField
                  label="LC Number"
                  value={basicInfo.lcNumber}
                  icon={<FiFile />}
                />
                <DataField
                  label="LC Opening Date"
                  value={formatDate(basicInfo.lcOpeningDate)}
                  icon={<FiClock />}
                />
                <DataField
                  label="Supplier Name"
                  value={basicInfo.supplierName}
                  icon={<FiUser />}
                />
                <DataField
                  label="Supplier Country"
                  value={basicInfo.supplierCountry}
                  icon={<FiTruck />}
                />
                <div className="sm:col-span-2">
                  <DataField
                    label="Status"
                    value={<StatusBadge status={basicInfo.status} />}
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <DataField
                    label="Bank Name"
                    value={basicInfo.accountId?.bankName}
                  />
                  <DataField
                    label="Branch Name"
                    value={basicInfo.accountId?.branchName}
                  />
                  <DataField
                    label="Account Holder"
                    value={`${basicInfo.accountId?.accountHolderName} (${basicInfo.accountId?.accountName})`}
                  />
                  <DataField
                    label="Account Number"
                    value={basicInfo.accountId?.accountNumber}
                  />
                </div>
              </div>
            </CollapsibleCard>

            {/* Financial Information */}
            <CollapsibleCard
              title="Financial Information"
              icon={<FiDollarSign className="text-[#003b75]" />}
              defaultOpen={true}
              className=""
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <DataField
                  label="LC Amount (USD)"
                  value={`$${formatNumber(financialInfo.lcAmountUsd)}`}
                />
                <DataField
                  label="Exchange Rate"
                  value={formatNumber(financialInfo.exchangeRate)}
                />
                <DataField
                  label="LC Amount (BDT)"
                  value={`৳${formatNumber(financialInfo.lcAmountBdt)}`}
                />
              </div>

              {financialInfo.costs && financialInfo.costs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 mt-4 gap-2">
                  {financialInfo.costs.map((cost) => (
                    <CostField key={cost._id} cost={cost} />
                  ))}
                </div>
              )}
            </CollapsibleCard>

            {/* Product Information */}
            <CollapsibleCard
              title="Product Information"
              icon={<FiBox className="text-[#003b75]" />}
              defaultOpen={true}
            >
              {productInfo.map((p, index) => (
                <div
                  key={p._id || index}
                  className="pb-6 mb-6 last:pb-0 last:mb-0 border-b last:border-b-0 border-gray-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {p.itemName && (
                      <DataField label="Item Name" value={p.itemName} />
                    )}

                    <DataField
                      label="Specifications"
                      value={
                        `Thickness: ${p.thickness || "-"}, ` +
                        `Width: ${p.width || "-"}, ` +
                        `Length: ${p.length || "-"}`
                      }
                    />

                    {p.grade && <DataField label="Grade" value={p.grade} />}

                    <DataField
                      label="Quantity"
                      value={`${formatNumber(p.quantity)} ${
                        p.quantityUnit?.name ? `(${p.quantityUnit.name})` : ""
                      }`}
                    />

                    <DataField
                      label="Unit Price (USD)"
                      value={`$${formatNumber(p.unitPriceUsd)}`}
                    />
                    <DataField
                      label="Total Value (USD)"
                      value={`$${formatNumber(p.totalValueUsd)}`}
                    />
                  </div>
                </div>
              ))}

              {productInfo.length > 0 && (
                <div className="mt-6 bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span className="text-gray-700">Total Products Value</span>
                    <span className="text-[#003b75]">
                      ${formatNumber(totalProductsValueUsd)} USD
                    </span>
                  </div>
                </div>
              )}
            </CollapsibleCard>

            {/* Shipping & Customs Information */}

            <CollapsibleCard
              title="Shipping & Customs Info"
              icon={<FiTruck className="text-[#003b75]" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <DataField
                  label="Port of Shipment"
                  value={shippingCustomsInfo.portOfShipment}
                />
                <DataField
                  label="Expected Arrival Date"
                  value={formatDate(shippingCustomsInfo.expectedArrivalDate)}
                />
              </div>

              {shippingCustomsInfo.costs &&
                shippingCustomsInfo.costs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 mt-4 gap-2">
                    {shippingCustomsInfo.costs.map((cost) => (
                      <CostField key={cost._id} cost={cost} />
                    ))}
                  </div>
                )}
            </CollapsibleCard>

            {/* Agent & Transport Information */}
            <CollapsibleCard
              title="Agent & Transport Info"
              icon={<FiUser className="text-[#003b75]" />}
            >
              {agentTransportInfo.costs &&
              agentTransportInfo.costs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 mt-4 gap-2">
                  {agentTransportInfo.costs.map((cost) => (
                    <CostField key={cost._id} cost={cost} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <FiUser className="text-3xl mx-auto" />
                  </div>
                  <p className="text-gray-500">
                    No agent & transport costs added
                  </p>
                </div>
              )}
            </CollapsibleCard>

            {/* Other Expenses */}
            {otherExpenses.costs && otherExpenses.costs.length > 0 && (
              <CollapsibleCard
                title="Other Expenses"
                icon={<FiAlertCircle className="text-[#003b75]" />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {otherExpenses.costs.map((cost) => (
                    <CostField key={cost._id} cost={cost} />
                  ))}
                </div>
              </CollapsibleCard>
            )}
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <CollapsibleCard
              title="Cost Summary"
              icon={<FiPieChart className="text-[#003b75]" />}
              defaultOpen={true}
            >
              <div className="space-y-4">
                {allCosts.length > 0 ? (
                  <>
                    <div className="space-y-3 pr-2">
                      {allCosts.map((cost) => (
                        <div
                          key={cost._id}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-sm text-gray-600 truncate pr-2">
                            {cost.name}
                          </span>
                          <span className="text-sm font-medium whitespace-nowrap">
                            ৳{formatNumber(cost.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                        <span className="font-bold text-gray-800">
                          Total LC Expenses
                        </span>
                        <span className="font-bold text-lg text-[#003b75]">
                          ৳{formatNumber(totalLcExpenses)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-400 mb-2">
                      <FiDollarSign className="text-3xl mx-auto" />
                    </div>
                    <p className="text-gray-500">No costs added yet</p>
                  </div>
                )}
              </div>
            </CollapsibleCard>

            {/* Documents & Notes */}
            <CollapsibleCard
              title="Documents & Notes"
              icon={<FiClipboard className="text-[#003b75]" />}
            >
              <div className="space-y-4">
                {documentsNotes.uploadedDocuments?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Uploaded Documents
                    </h3>
                    <div className="space-y-2">
                      {documentsNotes.uploadedDocuments.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white transition-colors duration-200"
                        >
                          <FiFile className="text-gray-400 mr-3 flex-shrink-0" />
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
                            className="ml-2 text-[#003b75] hover:text-blue-800 transition-colors duration-200"
                            title="Download"
                          >
                            <FiDownload />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {documentsNotes.note &&
                  documentsNotes.note !== "No notes given" && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Notes
                      </h3>
                      <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {documentsNotes.note}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </CollapsibleCard>

            {/* Payment History */}
            <CollapsibleCard
              title="Payment History"
              icon={<FiCreditCard className="text-[#003b75]" />}
              defaultOpen={true}
            >
              <div className="space-y-4">
                {allCosts.length > 0 ? (
                  <div className="space-y-3 max-h-[900px] overflow-y-auto pr-2">
                    {allCosts.map((cost) => (
                      <div
                        key={cost._id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white transition-colors duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-800 text-sm truncate pr-2">
                            {cost.name}
                          </span>
                          <span className="font-bold text-gray-800 whitespace-nowrap">
                            ৳{formatNumber(cost.amount)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {formatDate(cost.date)}
                        </div>
                        <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                          {getPaymentMethodDisplay(cost)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-400 mb-2">
                      <FiCreditCard className="text-3xl mx-auto" />
                    </div>
                    <p className="text-gray-500">
                      No payment history available
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirm}
        title={
          confirmAction === "delete" ? "Confirm Deletion" : "Confirm Export"
        }
        description={`Are you sure you want to ${confirmAction} this Letter of Credit (${basicInfo.lcNumber})?`}
        confirmText={confirmAction === "delete" ? "Delete" : "Export"}
        isConfirming={isConfirming}
      />
    </div>
  );
};

export default LCdetails;
