import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import PropTypes from "prop-types";
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
import toast from "react-hot-toast";
import api from "@/services/apiService";

// Components
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AddCostForm from "./components/AddCostForm";
import StatusBadge from "@/components/ui/StatusBadge";
import DataField from "@/components/ui/DataField";
import CostField from "@/components/ui/CostField";

// Custom Hooks
import { useUrl } from "@/context/UrlProvider";
import { useLCData, useExportLC, useDeleteLC } from "@/hooks/useLCOperations";

const LCdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { baseUrl } = useUrl();

  // State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    title: "",
    description: "",
  });
  const [costModal, setCostModal] = useState({
    isOpen: false,
    category: null,
  });

  // Custom Hooks
  const { lcData, loading, error, refetch, formatNumber, formatDate } =
    useLCData(id);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const { exportLC, isExporting } = useExportLC(id);
  const { deleteLC, isDeleting } = useDeleteLC(id);

  // Memoized values
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

  // Helper function to construct document URLs
  const getDocumentUrl = useCallback(
    (documentName) => {
      if (!baseUrl || !documentName) return "#";
      return `${baseUrl}lc/${id}/documents/${documentName}`;
    },
    [baseUrl, id]
  );

  // Handlers
  const handleOpenConfirmation = useCallback(
    (action) => {
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

      setConfirmModal({
        isOpen: true,
        action,
        ...actions[action],
      });
    },
    [lcData?.basicInfo?.lcNumber]
  );

  const handleConfirm = useCallback(async () => {
    if (confirmModal.action === "delete") {
      try {
        await deleteLC();
        navigate("/lc-management");
      } catch (error) {
        // Error handled in hook
      }
    } else if (confirmModal.action === "export") {
      await exportLC();
    }

    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }, [confirmModal.action, deleteLC, exportLC, navigate]);

  const handleOpenAddCost = useCallback((category) => {
    setCostModal({ isOpen: true, category });
  }, []);

  const handleAddCostSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading and error states
  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003b75]"></div>
        <p className="mt-4 text-gray-600">Loading LC details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading LC
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
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

  if (!lcData) {
    return null;
  }

  const {
    basicInfo = {},
    financialInfo = {},
    shippingCustomsInfo = {},
    agentTransportInfo = {},
    productInfo = [],
    documentsNotes = {},
  } = lcData;

  // Helper component for Add Cost button
  const AddCostButton = ({ category }) => (
    <button
      onClick={() => handleOpenAddCost(category)}
      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:ring-offset-2"
      aria-label={`Add cost to ${category}`}
    >
      <Plus size={14} aria-hidden="true" />
      Add Cost
    </button>
  );

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100"
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
                disabled={isExporting}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Export LC as PDF"
              >
                <Download className="mr-2 w-4 h-4" aria-hidden="true" />
                {isExporting ? "Exporting..." : "Export"}
              </button>
              <button
                onClick={() => navigate(`/lc-form/${id}`)}
                className="flex items-center px-3 sm:px-4 py-2 bg-[#003b75] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#002855] active:bg-[#001c3a] transition-colors shadow-sm"
                aria-label="Edit LC"
              >
                <Edit className="mr-2 w-4 h-4" aria-hidden="true" />
                Edit
              </button>
              <button
                onClick={() => handleOpenConfirmation("delete")}
                disabled={isDeleting}
                className="flex items-center px-3 sm:px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete LC"
              >
                <Trash2 className="mr-2 w-4 h-4" aria-hidden="true" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic LC Information */}
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

            {/* Financial Information */}
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

            {/* Product Information */}
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
                        value={
                          `Thickness: ${product.thickness || "-"}, ` +
                          `Width: ${product.width || "-"}, ` +
                          `Length: ${product.length || "-"}`
                        }
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

            {/* Shipping & Customs Information */}
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Shipping Costs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shippingCustomsInfo.costs.map((cost) => (
                      <CostField key={cost._id} cost={cost} />
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleCard>

            {/* Agent & Transport Information */}
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
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Cost Summary */}
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

            {/* Documents & Notes */}
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
                          className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white transition-colors"
                        >
                          <File className="text-gray-400 mr-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700 truncate">
                              {doc.originalName}
                            </div>
                          </div>
                          <a
                            href={getDocumentUrl(doc.storedName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="ml-2 text-[#003b75] hover:text-blue-800 transition-colors"
                            aria-label={`Download ${doc.originalName}`}
                          >
                            <Download className="w-4 h-4" />
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

      {/* Add Cost Form Dialog */}
      <AddCostForm
        open={costModal.isOpen}
        onClose={() => setCostModal({ isOpen: false, category: null })}
        lcId={id}
        category={costModal.category}
        onSuccess={handleAddCostSuccess}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.action === "delete" ? "Delete" : "Export"}
        cancelText="Cancel"
        isConfirming={
          confirmModal.action === "delete" ? isDeleting : isExporting
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
