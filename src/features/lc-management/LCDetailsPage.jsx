import React, { useState, useMemo, memo } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";

import Button from "../../components/ui/Button";

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
import { showSuccessToast, showErrorToast } from "@/utils/notifications";

// Components
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AddCostForm from "./components/AddCostForm";
import StatusBadge from "@/components/ui/StatusBadge";
import DataField from "@/components/ui/DataField";
import CostField from "@/components/ui/CostField";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import AuditInfoSection from "@/components/ui/AuditInfoSection";
import EntityAuditLog from "@/components/ui/EntityAuditLog";

import {
  useLC,
  useDeleteLC,
  useExportLC,
  useDeleteLCDocument,
} from "@/api/hooks/lc";
import { useQueryClient } from "@tanstack/react-query";
import { useUrl } from "@/hooks/useUrl";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";

const LCdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { baseUrl } = useUrl();
  const { hasPermission } = useAuth();
  const { formatCurrency, formatDate, formatNumber, settings } = useSettings();
  const queryClient = useQueryClient();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    title: "",
    description: "",
  });
  const [deleteDocModal, setDeleteDocModal] = useState({
    isOpen: false,
    docId: null,
  });
  const [costModal, setCostModal] = useState({ isOpen: false, category: null });

  const { data: lcQueryData, isLoading, isError, error, refetch } = useLC(id);
  const lcData = lcQueryData?.data;

  const deleteLCMutation = useDeleteLC();
  const exportLCMutation = useExportLC(id, lcData?.basicInfo?.lcNumber);
  const deleteDocMutation = useDeleteLCDocument();

  const totalProductsValueUsd = useMemo(() => {
    if (!lcData?.productInfo) return 0;
    return lcData.productInfo.reduce(
      (total, p) => total + (p.totalValueUsd || 0),
      0,
    );
  }, [lcData?.productInfo]);

  const allCosts = useMemo(() => {
    const sections = [
      "financialInfo",
      "shippingCustomsInfo",
      "agentTransportInfo",
      "otherExpenses",
      "documentProductInfo",
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

  const getFileUrl = (lcId, storedName) => {
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/lc/${lcId}/documents/${storedName}`;
  };

  const handleDownload = (lcId, storedName, originalName) => {
    try {
      const downloadUrl = getFileUrl(lcId, storedName);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccessToast("Downloading started...");
    } catch (err) {
      showErrorToast(err, "Failed to download file");
    }
  };

  const handleDeleteDoc = (docId) => {
    setDeleteDocModal({ isOpen: true, docId });
  };

  const handleConfirmDeleteDoc = () => {
    if (!deleteDocModal.docId) return;
    deleteDocMutation.mutate(
      { lcId: id, docId: deleteDocModal.docId },
      {
        onSuccess: () => {
          setDeleteDocModal({ isOpen: false, docId: null });
          refetch(); // Refetch LC data to update the documents list
        },
      },
    );
  };

  if (isError) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-4">
        <div className="bg-[var(--color-danger-light)] border border-[var(--color-danger-light)] rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-[var(--color-danger)] mb-2">
            Error Loading LC
          </h3>
          <p className="text-[var(--color-danger)] mb-4">{error.message}</p>
          <Button
            onClick={() => navigate("/lc-management")}
            variant="secondary"
            size="sm"
          >
            Back to LC Management
          </Button>
        </div>
      </div>
    );
  }

  if (!lcData && !isLoading) return null;

  const {
    basicInfo = {},
    financialInfo = {},
    shippingCustomsInfo = {},
    agentTransportInfo = {},
    productInfo = [],
    documentProductInfo = {},
    documentsNotes = {},
    otherExpenses = {},
  } = lcData || {};

  const AddCostButton = ({ category }) => (
    <Button
      onClick={() => handleOpenAddCost(category)}
      variant="secondary"
      size="sm"
      className="flex items-center gap-1"
      aria-label={`Add cost to ${category}`}
    >
      <Plus size={14} aria-hidden="true" />
      Cost
    </Button>
  );

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-4 sm:mb-6 p-5 bg-white rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="p-2 bg-[var(--color-primary)] rounded-lg flex-shrink-0"
                  aria-hidden="true"
                >
                  <FileText className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {isLoading ? (
                    <ValueSkeleton width="w-48" height="h-8" />
                  ) : (
                    basicInfo.lcNumber || "Letter of Credit Details"
                  )}
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base ml-11">
                Comprehensive view of your Letter of Credit
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasPermission("LC_EXPORT_PDF") && (
                <Button
                  onClick={() => handleOpenConfirmation("export")}
                  disabled={exportLCMutation.isLoading}
                  isLoading={exportLCMutation.isLoading}
                  variant="secondary"
                  size="sm"
                  className="flex items-center justify-center" // Adjust spacing if needed
                  aria-label="Export LC as PDF"
                >
                  <Download className="mr-2 w-4 h-4" aria-hidden="true" />
                  {exportLCMutation.isLoading ? "Exporting..." : "Export"}
                </Button>
              )}
              {hasPermission("LC_UPDATE") && (
                <Button
                  onClick={() => navigate(`/lc-form/${id}`)}
                  onMouseEnter={() =>
                    import("@/features/lc-management/LCFormPage")
                  }
                  variant="primary"
                  size="sm"
                  className="flex items-center"
                  aria-label="Edit LC"
                >
                  <Edit className="mr-2 w-4 h-4" aria-hidden="true" /> Edit
                </Button>
              )}
              {hasPermission("LC_DELETE") && (
                <Button
                  onClick={() => handleOpenConfirmation("delete")}
                  disabled={deleteLCMutation.isLoading}
                  isLoading={deleteLCMutation.isLoading}
                  variant="danger"
                  size="sm"
                  className="flex items-center"
                  aria-label="Delete LC"
                >
                  <Trash2 className="mr-2 w-4 h-4" aria-hidden="true" />
                  {deleteLCMutation.isLoading ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <CollapsibleCard
              title="Basic LC Information"
              icon={<FileText className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="Basic LC Information Section"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataField
                  label="LC Number"
                  value={basicInfo?.lcNumber}
                  icon={FileText}
                  loading={isLoading}
                />
                <DataField
                  label="LC Opening Date"
                  value={basicInfo?.lcOpeningDate}
                  format="date"
                  icon={Calendar}
                  loading={isLoading}
                />
                <DataField
                  label="Supplier Name"
                  value={basicInfo?.supplierName}
                  icon={User}
                  loading={isLoading}
                />
                <DataField
                  label="Supplier Country"
                  value={basicInfo?.supplierCountry}
                  icon={MapPin}
                  loading={isLoading}
                />
                <div className="sm:col-span-2">
                  <DataField
                    label="Status"
                    value={<StatusBadge status={basicInfo?.status} />}
                    loading={isLoading}
                  />
                </div>
              </div>
              {basicInfo?.accountId && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Bank Account Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DataField
                      label="Bank Name"
                      value={basicInfo.accountId?.bankName}
                      icon={Building}
                      loading={isLoading}
                    />
                    <DataField
                      label="Branch Name"
                      value={basicInfo.accountId?.branchName}
                      loading={isLoading}
                    />
                    <DataField
                      label="Account Holder"
                      value={basicInfo.accountId?.accountHolderName}
                      loading={isLoading}
                    />
                    <DataField
                      label="Account Number"
                      value={basicInfo.accountId?.accountNumber}
                      loading={isLoading}
                    />
                  </div>
                </div>
              )}
            </CollapsibleCard>
            <CollapsibleCard
              title="Financial Information"
              icon={<DollarSign className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              headerActions={
                hasPermission("LC_UPDATE") ? (
                  <AddCostButton category="financialInfo" />
                ) : null
              }
              ariaLabel="Financial Information Section"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <DataField
                  label="LC Amount (USD)"
                  value={
                    financialInfo.lcAmountUsd
                      ? `$${formatNumber(financialInfo.lcAmountUsd)}`
                      : null
                  }
                  loading={isLoading}
                />
                <DataField
                  label="Exchange Rate"
                  value={formatNumber(financialInfo.exchangeRate)}
                  loading={isLoading}
                />
                <DataField
                  label={`LC Amount (${settings?.currency || "BDT"})`}
                  value={formatCurrency(financialInfo.lcAmountBdt)}
                  loading={isLoading}
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
              icon={<Package className="text-[var(--color-primary)]" />}
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
                      <DataField
                        label="Item Name"
                        value={product.itemName}
                        loading={isLoading}
                      />
                    )}
                    {(product.thickness || product.width || product.length) && (
                      <DataField
                        label="Specifications"
                        value={`Thickness: ${product.thickness || "-"
                          }, Width: ${product.width || "-"}, Length: ${product.length || "-"
                          }`}
                        loading={isLoading}
                      />
                    )}
                    {product.grade && (
                      <DataField
                        label="Grade"
                        value={product.grade}
                        loading={isLoading}
                      />
                    )}
                    <DataField
                      label="Quantity"
                      value={`${formatNumber(product.quantity)} ${product.quantityUnit?.name
                        ? `(${product.quantityUnit.name})`
                        : ""
                        }`}
                      loading={isLoading}
                    />
                    <DataField
                      label="Unit Price (USD)"
                      value={
                        product.unitPriceUsd
                          ? `$${formatNumber(product.unitPriceUsd)}`
                          : null
                      }
                      loading={isLoading}
                    />
                    <DataField
                      label="Total Value (USD)"
                      value={
                        product.totalValueUsd
                          ? `$${formatNumber(product.totalValueUsd)}`
                          : null
                      }
                      loading={isLoading}
                    />
                  </div>
                </div>
              ))}
              {productInfo.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-700">Total Products Value</span>
                    <span className="text-[var(--color-primary)]">
                      ${formatNumber(totalProductsValueUsd)} USD
                    </span>
                  </div>
                </div>
              )}
            </CollapsibleCard>
            <CollapsibleCard
              title="Document Information"
              icon={<Package className="text-[var(--color-primary)] opacity-70" />}
              defaultOpen={true}
              ariaLabel="Document Information Section"
              headerActions={
                hasPermission("LC_UPDATE") ? (
                  <AddCostButton category="documentProductInfo" />
                ) : null
              }
            >
              {documentProductInfo?.products?.map((product, index) => (
                <div
                  key={product._id || index}
                  className="pb-4 mb-4 last:pb-0 last:mb-0 border-b last:border-b-0 border-gray-200"
                >
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    Product {index + 1}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.itemName && (
                      <DataField
                        label="Item Name"
                        value={product.itemName}
                        loading={isLoading}
                      />
                    )}
                    {(product.thickness || product.width || product.length) && (
                      <DataField
                        label="Specifications"
                        value={`Thickness: ${product.thickness || "-"
                          }, Width: ${product.width || "-"}, Length: ${product.length || "-"
                          }`}
                        loading={isLoading}
                      />
                    )}
                    {product.grade && (
                      <DataField
                        label="Grade"
                        value={product.grade}
                        loading={isLoading}
                      />
                    )}
                    <DataField
                      label="Quantity"
                      value={`${formatNumber(product.quantity)} ${product.quantityUnit?.name
                        ? `(${product.quantityUnit.name})`
                        : ""
                        }`}
                      loading={isLoading}
                    />
                    <DataField
                      label="Unit Price (USD)"
                      value={
                        product.unitPriceUsd
                          ? `$${formatNumber(product.unitPriceUsd)}`
                          : null
                      }
                      loading={isLoading}
                    />
                    <DataField
                      label="Total Value (USD)"
                      value={
                        product.totalValueUsd
                          ? `$${formatNumber(product.totalValueUsd)}`
                          : null
                      }
                      loading={isLoading}
                    />
                  </div>
                </div>
              ))}
              {documentProductInfo?.costs?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Document Related Costs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {documentProductInfo.costs.map((cost) => (
                      <CostField key={cost._id} cost={cost} showDetails />
                    ))}
                  </div>
                </div>
              )}

              {/* Document Value Summary */}
              {(lcData?.totalDocumentValue > 0 || totalProductsValueUsd > 0) && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                    {/* Column 1: Total Value */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Document Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${formatNumber(lcData?.totalDocumentValue || 0)}
                      </p>
                    </div>

                    {/* Column 2: Products Value & Balance */}
                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Products Value (USD)</span>
                        <span className="text-lg font-bold text-[var(--color-primary)]">
                          ${formatNumber(totalProductsValueUsd)}
                        </span>
                      </div>

                      <div className="w-px h-10 bg-gray-300"></div>

                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Balance (USD)</span>
                        {(() => {
                          const balance = (lcData?.totalDocumentValue || 0) - totalProductsValueUsd;
                          const isMatched = balance === 0;
                          const colorClass = isMatched ? "text-green-700" : balance > 0 ? "text-red-600" : "text-amber-600";
                          return (
                            <div className="flex items-center gap-2">
                              <span className={`text-xl font-bold ${colorClass}`}>
                                ${formatNumber(Math.abs(balance))}
                              </span>
                              {isMatched && (
                                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Matched
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {(!documentProductInfo?.products?.length && !documentProductInfo?.costs?.length) && (
                <div className="text-center py-6 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300 opacity-50" />
                  <p>No document items or costs added</p>
                </div>
              )}
            </CollapsibleCard>
            <CollapsibleCard
              title="Shipping & Customs Info"
              icon={<Truck className="text-[var(--color-primary)]" />}
              headerActions={
                hasPermission("LC_UPDATE") ? (
                  <AddCostButton category="shippingCustomsInfo" />
                ) : null
              }
              ariaLabel="Shipping and Customs Information Section"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataField
                  label="Port of Shipment"
                  value={shippingCustomsInfo.portOfShipment}
                  loading={isLoading}
                />
                <DataField
                  label="Port of Destination"
                  value={shippingCustomsInfo.portOfDestination}
                  loading={isLoading}
                />
                <DataField
                  label="Expected Arrival Date"
                  value={shippingCustomsInfo.expectedArrivalDate}
                  format="date"
                  loading={isLoading}
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
              icon={<User className="text-[var(--color-primary)]" />}
              headerActions={
                hasPermission("LC_UPDATE") ? (
                  <AddCostButton category="agentTransportInfo" />
                ) : null
              }
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
              icon={<DollarSign className="text-[var(--color-primary)]" />}
              headerActions={
                hasPermission("LC_UPDATE") ? (
                  <AddCostButton category="otherExpenses" />
                ) : null
              }
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
              icon={<PieChart className="text-[var(--color-primary)]" />}
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
                            {formatCurrency(cost.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                        <span className="font-bold text-gray-800">
                          Total LC Expenses
                        </span>
                        <span className="font-bold text-lg text-[var(--color-primary)]">
                          {formatCurrency(totalLcExpenses)}
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
              icon={<Clipboard className="text-[var(--color-primary)]" />}
              ariaLabel="Documents and Notes Section"
            >
              <div className="space-y-4">
                {documentsNotes.uploadedDocuments?.length > 0 ? (
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
                            <a
                              href={getFileUrl(lcData._id, doc.storedName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-700 truncate hover:text-[var(--color-primary)]"
                              title={`View ${doc.originalName}`}
                            >
                              {doc.originalName}
                            </a>
                          </div>
                          <div className="flex items-center flex-shrink-0">
                            <Button
                              onClick={() =>
                                handleDownload(
                                  lcData._id,
                                  doc.storedName,
                                  doc.originalName,
                                )
                              }
                              variant="subtle"
                              size="sm"
                              className="!p-2 text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-full"
                              aria-label="Download document"
                            >
                              <Download size={18} />
                            </Button>
                            {hasPermission("LC_UPDATE") && (
                              <Button
                                onClick={() => handleDeleteDoc(doc._id)}
                                variant="subtle"
                                size="sm"
                                className="!p-2 text-gray-500 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] rounded-full"
                                aria-label="Delete document"
                                disabled={deleteDocMutation.isLoading}
                              >
                                <Trash2 size={18} />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No documents uploaded yet.</p>
                  </div>
                )}
                {documentsNotes.note &&
                  documentsNotes.note !== "No notes given" && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Notes
                      </h3>
                      <div className="p-3 bg-[var(--color-warning-light)] border border-[var(--color-warning-light)] rounded-lg">
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
              icon={<CreditCard className="text-[var(--color-primary)]" />}
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
                            {formatCurrency(cost.amount)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {formatDate(cost.date)}
                        </div>
                        {cost.paymentMethod && (
                          <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                            {cost.accountId
                              ? formatAccountLabel(cost.accountId)
                              : cost.paymentMethod}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No payment history available</p>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          </div>
        </div>
        <AuditInfoSection
          createdBy={lcData?.createdBy}
          createdAt={lcData?.createdAt}
          modifiedBy={lcData?.modifiedBy}
          updatedAt={lcData?.updatedAt}
          deletedBy={lcData?.deletedBy}
          deletedAt={lcData?.deletedAt}
          isDeleted={lcData?.isDeleted}
        />
        {hasPermission("AUDIT_VIEW") && (
          <div className="mt-6">
            <EntityAuditLog moduleId={id} moduleName="LC" />
          </div>
        )}
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
        variant={confirmModal.action === "delete" ? "danger" : "primary"}
        icon={confirmModal.action === "delete" ? Trash2 : Download}
      />
      <ConfirmationModal
        isOpen={deleteDocModal.isOpen}
        onClose={() => setDeleteDocModal({ isOpen: false, docId: null })}
        onConfirm={handleConfirmDeleteDoc}
        title="Confirm Document Deletion"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isConfirming={deleteDocMutation.isLoading}
        confirmingText="Deleting..."
        variant="danger"
        icon={Trash2}
      />
    </div>
  );
};

export default memo(LCdetails);
