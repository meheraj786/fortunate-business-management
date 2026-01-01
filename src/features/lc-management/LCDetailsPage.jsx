import React, { useState, useMemo, memo } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Plus,
  Download,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  Package,
  Truck,
  User,
  Clipboard,
  PieChart,
  CreditCard,
  Calendar,
  MapPin,
  Building,
  File,
} from "lucide-react";
import { handleError } from "@/utils/handle-error";
import toast from "react-hot-toast";

// Components
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AddCostForm from "./components/AddCostForm";
import StatusBadge from "@/components/ui/StatusBadge";
import DataField from "@/components/ui/DataField";
import CostField from "@/components/ui/CostField";
import LCDetailsPageSkeleton from "./components/LCDetailsPageSkeleton";

// Custom Hooks & Utils
import { useUrl } from "@/context/UrlProvider";
import { useLC, useDeleteLC, useExportLC } from "@/api/hooks/lc";
import { formatNumber, formatDate } from "@/utils/format";

const LCdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { baseUrl } = useUrl();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    title: "",
    description: "",
  });
  const [costModal, setCostModal] = useState({ isOpen: false, category: null });

  const { data: lcQueryData, isLoading, isError, error, refetch } = useLC(id);
  const lcData = lcQueryData?.data;

  const deleteLCMutation = useDeleteLC();
  const exportLCMutation = useExportLC(id, lcData?.basicInfo?.lcNumber);

  const totalProductsValueUsd = useMemo(() => {
    if (!lcData?.productInfo) return 0;
    return lcData.productInfo.reduce(
      (total, p) => total + (p.totalValueUsd || 0),
      0
    );
  }, [lcData?.productInfo]);

  const allCosts = useMemo(() => {
    const sections = [
      "financialInfo",
      "shippingCustomsInfo",
      "agentTransportInfo",
      "otherExpenses",
    ];
    return sections.flatMap((section) => lcData?.[section]?.costs || []);
  }, [lcData]);

  const totalLcExpenses = useMemo(() => {
    return allCosts.reduce((total, cost) => total + (cost.amount || 0), 0);
  }, [allCosts]);

  const handleOpenConfirmation = (action) => {
    const actions = {
      delete: {
        title: "Confirm Deletion",
        description: `Are you sure you want to delete this Letter of Credit (${lcData?.basicInfo?.lcNumber})? This action cannot be undone.`,
      },
      export: {
        title: "Confirm Export",
        description: `Export LC details for ${lcData?.basicInfo?.lcNumber} as PDF?`,
      },
    };
    setConfirmModal({ isOpen: true, action, ...actions[action] });
  };

  const handleConfirm = async () => {
    if (confirmModal.action === "delete") {
      deleteLCMutation.mutate(id, {
        onSuccess: () => navigate("/lc-management"),
      });
    } else if (confirmModal.action === "export") {
      exportLCMutation.mutate();
    }
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleOpenAddCost = (category) =>
    setCostModal({ isOpen: true, category });
  const handleAddCostSuccess = () => refetch();

  const handleDownload = async (lcId, storedName, originalName) => {
    try {
      const cleanBaseUrl = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;
      const downloadUrl = `${cleanBaseUrl}/lc/${lcId}/documents/${storedName}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", originalName);
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Downloading started...");
    } catch (err) {
      handleError(err, "Failed to download file");
    }
  };

  if (isLoading) return <LCDetailsPageSkeleton />;

  if (isError) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading LC
          </h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => navigate("/lc-management")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to LC Management
          </button>
        </div>
      </div>
    );
  }

  if (!lcData) return null;

  const {
    basicInfo = {},
    financialInfo = {},
    shippingCustomsInfo = {},
    agentTransportInfo = {},
    productInfo = [],
    documentsNotes = {},
    otherExpenses = {},
  } = lcData;

  const AddCostButton = ({ category }) => (
    <button
      onClick={() => handleOpenAddCost(category)}
      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:ring-offset-2"
      aria-label={`Add cost to ${category}`}
    >
      <Plus size={14} aria-hidden="true" /> Add Cost
    </button>
  );

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="p-2 bg-[#003b75] rounded-lg flex-shrink-0"
                  aria-hidden="true"
                >
                  <FileText className="text-white text-xl" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {basicInfo.lcNumber || "Letter of Credit Details"}
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base ml-11">
                Comprehensive view of your Letter of Credit
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleOpenConfirmation("export")}
                disabled={exportLCMutation.isLoading}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Export LC as PDF"
              >
                <Download className="mr-2 w-4 h-4" aria-hidden="true" />
                {exportLCMutation.isLoading ? "Exporting..." : "Export"}
              </button>
              <button
                onClick={() => navigate(`/lc-form/${id}`)}
                className="flex items-center px-3 sm:px-4 py-2 bg-[#003b75] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#002855] active:bg-[#001c3a] transition-colors shadow-sm"
                aria-label="Edit LC"
              >
                <Edit className="mr-2 w-4 h-4" aria-hidden="true" /> Edit
              </button>
              <button
                onClick={() => handleOpenConfirmation("delete")}
                disabled={deleteLCMutation.isLoading}
                className="flex items-center px-3 sm:px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete LC"
              >
                <Trash2 className="mr-2 w-4 h-4" aria-hidden="true" />
                {deleteLCMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <CollapsibleCard
              title="Basic LC Information"
              icon={<FileText className="text-[#003b75]" />}
              defaultOpen={true}
              ariaLabel="Basic LC Information Section"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataField
                  label="LC Number"
                  value={basicInfo.lcNumber}
                  icon={FileText}
                />
                <DataField
                  label="LC Opening Date"
                  value={formatDate(basicInfo.lcOpeningDate)}
                  icon={Calendar}
                />
                <DataField
                  label="Supplier Name"
                  value={basicInfo.supplierName}
                  icon={User}
                />
                <DataField
                  label="Supplier Country"
                  value={basicInfo.supplierCountry}
                  icon={MapPin}
                />
                <div className="sm:col-span-2">
                  <DataField
                    label="Status"
                    value={<StatusBadge status={basicInfo.status} />}
                  />
                </div>
              </div>
              {basicInfo.accountId && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Bank Account Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DataField
                      label="Bank Name"
                      value={basicInfo.accountId?.bankName}
                      icon={Building}
                    />
                    <DataField
                      label="Branch Name"
                      value={basicInfo.accountId?.branchName}
                    />
                    <DataField
                      label="Account Holder"
                      value={basicInfo.accountId?.accountHolderName}
                    />
                    <DataField
                      label="Account Number"
                      value={basicInfo.accountId?.accountNumber}
                    />
                  </div>
                </div>
              )}
            </CollapsibleCard>
            <CollapsibleCard
              title="Financial Information"
              icon={<DollarSign className="text-[#003b75]" />}
              defaultOpen={true}
              headerActions={<AddCostButton category="financialInfo" />}
              ariaLabel="Financial Information Section"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              {financialInfo.costs?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Financial Costs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {financialInfo.costs.map((cost) => (
                      <CostField key={cost._id} cost={cost} />
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleCard>
            <CollapsibleCard
              title="Product Information"
              icon={<Package className="text-[#003b75]" />}
              defaultOpen={true}
              ariaLabel="Product Information Section"
            >
              {productInfo.map((product, index) => (
                <div
                  key={product._id || index}
                  className="pb-4 mb-4 last:pb-0 last:mb-0 border-b last:border-b-0 border-gray-200"
                >
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    Product {index + 1}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.itemName && (
                      <DataField label="Item Name" value={product.itemName} />
                    )}
                    {(product.thickness || product.width || product.length) && (
                      <DataField
                        label="Specifications"
                        value={`Thickness: ${
                          product.thickness || "-"
                        }, Width: ${product.width || "-"}, Length: ${
                          product.length || "-"
                        }`}
                      />
                    )}
                    {product.grade && (
                      <DataField label="Grade" value={product.grade} />
                    )}
                    <DataField
                      label="Quantity"
                      value={`${formatNumber(product.quantity)} ${
                        product.quantityUnit?.name
                          ? `(${product.quantityUnit.name})`
                          : ""
                      }`}
                    />
                    <DataField
                      label="Unit Price (USD)"
                      value={`$${formatNumber(product.unitPriceUsd)}`}
                    />
                    <DataField
                      label="Total Value (USD)"
                      value={`$${formatNumber(product.totalValueUsd)}`}
                    />
                  </div>
                </div>
              ))}
              {productInfo.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-700">Total Products Value</span>
                    <span className="text-[#003b75]">
                      ${formatNumber(totalProductsValueUsd)} USD
                    </span>
                  </div>
                </div>
              )}
            </CollapsibleCard>
            <CollapsibleCard
              title="Shipping & Customs Info"
              icon={<Truck className="text-[#003b75]" />}
              headerActions={<AddCostButton category="shippingCustomsInfo" />}
              ariaLabel="Shipping and Customs Information Section"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataField
                  label="Port of Shipment"
                  value={shippingCustomsInfo.portOfShipment}
                />
                <DataField
                  label="Expected Arrival Date"
                  value={formatDate(shippingCustomsInfo.expectedArrivalDate)}
                />
              </div>
              {shippingCustomsInfo.costs?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shippingCustomsInfo.costs.map((cost) => (
                      <CostField key={cost._id} cost={cost} />
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleCard>
            <CollapsibleCard
              title="Agent & Transport Info"
              icon={<User className="text-[#003b75]" />}
              headerActions={<AddCostButton category="agentTransportInfo" />}
              ariaLabel="Agent and Transport Information Section"
            >
              {agentTransportInfo.costs?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {agentTransportInfo.costs.map((cost) => (
                    <CostField key={cost._id} cost={cost} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No agent & transport costs added</p>
                </div>
              )}
            </CollapsibleCard>
            <CollapsibleCard
              title="Other Expenses"
              icon={<DollarSign className="text-[#003b75]" />}
              headerActions={<AddCostButton category="otherExpenses" />}
              ariaLabel="Other Expenses Section"
            >
              {otherExpenses.costs?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {otherExpenses.costs.map((cost) => (
                    <CostField key={cost._id} cost={cost} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No other expenses added</p>
                </div>
              )}
            </CollapsibleCard>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <CollapsibleCard
              title="Cost Summary"
              icon={<PieChart className="text-[#003b75]" />}
              defaultOpen={true}
              ariaLabel="Cost Summary Section"
            >
              <div className="space-y-3">
                {allCosts.length > 0 ? (
                  <>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {allCosts.map((cost) => (
                        <div
                          key={cost._id}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-sm text-gray-600 truncate pr-2 flex-1">
                            {cost.name}
                          </span>
                          <span className="text-sm font-medium whitespace-nowrap">
                            ৳{formatNumber(cost.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-gray-200">
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
                  <div className="text-center py-6 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No costs added yet</p>
                  </div>
                )}
              </div>
            </CollapsibleCard>
            <CollapsibleCard
              title="Documents & Notes"
              icon={<Clipboard className="text-[#003b75]" />}
              ariaLabel="Documents and Notes Section"
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
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white transition-colors"
                        >
                          <div className="flex items-center min-w-0">
                            <File className="text-gray-400 mr-3 flex-shrink-0" />
                            <div className="text-sm font-medium text-gray-700 truncate">
                              {doc.originalName}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDownload(
                                lcData._id,
                                doc.storedName,
                                doc.originalName
                              )
                            }
                            className="p-2 text-[#003b75] hover:bg-blue-50 rounded-full transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
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
            <CollapsibleCard
              title="Payment History"
              icon={<CreditCard className="text-[#003b75]" />}
              defaultOpen={true}
              ariaLabel="Payment History Section"
            >
              <div className="space-y-3">
                {allCosts.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {allCosts.map((cost) => (
                      <div
                        key={cost._id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-800 text-sm truncate pr-2 flex-1">
                            {cost.name}
                          </span>
                          <span className="font-bold text-gray-800 whitespace-nowrap">
                            ৳{formatNumber(cost.amount)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {formatDate(cost.date)}
                        </div>
                        {cost.paymentMethod && (
                          <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                            {cost.paymentMethod === "Cash"
                              ? "Cash"
                              : cost.accountId
                              ? `${cost.paymentMethod}: ${
                                  cost.accountId.accountHolderName
                                } (${
                                  cost.accountId.accountNumber ||
                                  cost.accountId.mobileNumber
                                })`
                              : cost.paymentMethod}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No payment history available</p>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          </div>
        </div>
      </div>
      <AddCostForm
        open={costModal.isOpen}
        onClose={() => setCostModal({ isOpen: false, category: null })}
        lcId={id}
        category={costModal.category}
        onSuccess={handleAddCostSuccess}
      />
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.action === "delete" ? "Delete" : "Export"}
        cancelText="Cancel"
        isConfirming={
          confirmModal.action === "delete"
            ? deleteLCMutation.isLoading
            : exportLCMutation.isLoading
        }
        confirmingText={
          confirmModal.action === "delete" ? "Deleting..." : "Exporting..."
        }
        icon={confirmModal.action === "delete" ? Trash2 : Download}
        iconBgColor={
          confirmModal.action === "delete" ? "bg-red-100" : "bg-blue-100"
        }
        iconTextColor={
          confirmModal.action === "delete" ? "text-red-600" : "text-blue-600"
        }
        confirmButtonBgColor={
          confirmModal.action === "delete" ? "bg-red-600" : "bg-blue-600"
        }
        confirmButtonHoverBgColor={
          confirmModal.action === "delete"
            ? "hover:bg-red-500"
            : "hover:bg-blue-500"
        }
      />
    </div>
  );
};

export default memo(LCdetails);
