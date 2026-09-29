import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  Calendar,
  DollarSign,
  Edit,
  FileClock,
  FileWarning,
  Hash,
  Loader2,
  Lock,
  Package,
  Ruler,
  ShoppingCart,
  Tag,
  Trash2,
  User,
  FileText,
  ShieldAlert,
  GitBranch,
  PackagePlus,
  Layers,
  TrendingUp,
} from "lucide-react";
import { useProduct, useDeleteProduct, useCloseLot } from "@/api/hooks/products";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatBox from "@/components/ui/StatBox";
import AddProductForm from "./AddProductForm";
import SalesHistory from "./SalesHistory";
import TransferStockModal from "./TransferStockModal";
import RestockProductModal from "./RestockProductModal";
import RestockHistory from "./RestockHistory";
import { useAuth } from "@/hooks/useAuth";
import { showErrorToast } from "@/utils/notifications";
import Button from "@/components/ui/Button";
import { useSettings } from "@/context/SettingsContext";
import { getCategories } from "@/api/category.api";
import { getCompletedLCs } from "@/api/lc.api";
import { getUnits } from "@/api/unit.api";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import EntityAuditLog from "@/components/ui/EntityAuditLog";

const formatNumber = (num) => {
  if (typeof num !== "number") return num;
  return parseFloat(num.toFixed(3));
};

const formatExactNumber = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(Number(num))) return "0.00";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatQuantityWithUnit = (num, unitName = "", decimals = 2) => {
  if (num === null || num === undefined || isNaN(Number(num))) {
    return unitName ? `0.00 ${unitName}` : "0.00";
  }
  const formatted = formatExactNumber(num, decimals);
  return unitName ? `${formatted} ${unitName}` : formatted;
};

const getStockStatusBadgeStyle = (status) => {
  switch (status) {
    case "OK":
      return "bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success-light)]";
    case "Low":
      return "bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning-light)]";
    case "No Stock":
      return "bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger-light)]";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const DetailItem = ({ label, value, unit, icon: Icon }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-gray-50 rounded-lg">
      {Icon && <Icon size={16} className="text-gray-500" />}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">
        {value} {unit || ""}
      </p>
    </div>
  </div>
);

const ProductDetails = () => {
  const { warehouseId, productId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { formatCurrency, formatExactCurrency, formatDate } = useSettings();
  const queryClient = useQueryClient();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseLotModal, setShowCloseLotModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  useEffect(() => {
    if (!hasPermission("PRODUCT_VIEW_DETAILS")) {
      showErrorToast("You don't have permission to view product details.");
      navigate(`/stock/${warehouseId}`);
    }
  }, [hasPermission, navigate, warehouseId]);

  const {
    data: productData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProduct(warehouseId, productId);
  const product = productData?.data;

  const deleteProductMutation = useDeleteProduct(warehouseId, productId);
  const closeLotMutation = useCloseLot(warehouseId, productId);

  const handleDelete = () => {
    deleteProductMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteModal(false);
        navigate(`/stock/${warehouseId}`);
      },
    });
  };

  const handleCloseLot = () => {
    closeLotMutation.mutate(undefined, {
      onSuccess: () => {
        setShowCloseLotModal(false);
      },
    });
  };

  const canCloseLot =
    hasPermission("PRODUCT_LOT_CLOSE") &&
    product &&
    !product.lotClosed &&
    product.quantity > 0;

  const prefetchFormData = () => {
    const staleTime = 5 * 60 * 1000;
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: async () => (await getCategories()).data,
      staleTime,
    });
    queryClient.prefetchQuery({
      queryKey: ["lcs", "completed"],
      queryFn: async () => (await getCompletedLCs()).data,
      staleTime,
    });
    queryClient.prefetchQuery({
      queryKey: ["units"],
      queryFn: async () => (await getUnits()).data,
      staleTime,
    });
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: "Stock", path: "/stock-management" },
      {
        label: product?.warehouse?.name || "Warehouse",
        path: `/stock/${warehouseId}`,
      },
      { label: product?.name || "Product" },
    ],
    [product, warehouseId],
  );

  if ((isError || !product) && !isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            {error?.message || "Error loading product details"}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product && !isLoading && !isFetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Product not found</div>
          <button
            onClick={() => navigate(`/stock/${warehouseId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Stock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isLoading ? (
                    <ValueSkeleton width="w-48" height="h-8" />
                  ) : (
                    product?.name
                  )}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-gray-600">
                    {isLoading ? (
                      <ValueSkeleton width="w-24" height="h-4" />
                    ) : (
                      product?.category?.name
                    )}
                  </p>
                  {!isLoading && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStatusBadgeStyle(
                        product?.stockStatus,
                      )}`}
                    >
                      {product?.stockStatus}
                    </span>
                  )}
                  {!isLoading && product?.lotClosed && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300">
                      <Lock size={12} />
                      Lot Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              {hasPermission("PRODUCT_UPDATE") && (
                <Button
                  onClick={() => setShowRestockModal(true)}
                  variant="primary"
                  size="sm"
                  className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
                  disabled={!product || product.lotClosed}
                  title={product?.lotClosed ? "Cannot add stock to a closed lot" : "Record received stock"}
                >
                  <PackagePlus size={16} />
                  <span>Add Stock</span>
                </Button>
              )}
              {hasPermission("PRODUCT_TRANSFER") && (
                <Button
                  onClick={() => setShowTransferModal(true)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
                  disabled={!product || product.lotClosed || product.quantity <= 0}
                  title={
                    product?.lotClosed
                      ? "Cannot transfer — lot is closed"
                      : product?.quantity <= 0
                        ? "Cannot transfer — no stock available"
                        : "Transfer stock to another warehouse"
                  }
                >
                  <ArrowRightLeft size={16} />
                  <span>Transfer</span>
                </Button>
              )}
              {canCloseLot && (
                <Button
                  onClick={() => setShowCloseLotModal(true)}
                  variant="warning"
                  size="sm"
                  className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
                >
                  <Lock size={16} />
                  <span>Close Lot</span>
                </Button>
              )}
              {hasPermission("PRODUCT_UPDATE") && (
                <Button
                  onClick={() => setShowEditForm(true)}
                  onMouseEnter={prefetchFormData}
                  variant="primary"
                  size="sm"
                  className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Button>
              )}
              {hasPermission("PRODUCT_DELETE") && (
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  size="sm"
                  className="flex-1 sm:flex-auto flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Transfer Lineage Banner */}
        {!isLoading && product?.transferredFrom && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <GitBranch size={16} className="text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-0.5">
                  Transferred Product
                </p>
                <p className="text-blue-700">
                  This product was split from{" "}
                  <button
                    onClick={() => {
                      const fromProduct = product.transferredFrom;
                      if (fromProduct?.warehouse) {
                        navigate(`/stock/${typeof fromProduct.warehouse === 'object' ? fromProduct.warehouse._id || fromProduct.warehouse.id : fromProduct.warehouse}/product/${fromProduct._id || fromProduct}`);
                      }
                    }}
                    className="font-semibold text-blue-800 underline hover:text-blue-900"
                  >
                    {product.transferredFrom?.name || "another product"}
                  </button>
                  {product.transferredAt && (
                    <> on {formatDate(product.transferredAt)}</>
                  )}
                  {product.transferNotes && (
                    <span className="text-blue-600 italic"> — {product.transferNotes}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DetailItem
                  label="Category"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-20" />
                    ) : (
                      product?.category?.name || "N/A"
                    )
                  }
                  icon={Tag}
                />
                <DetailItem
                  label="Supplier"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-24" />
                    ) : (
                      product?.supplierName || "N/A"
                    )
                  }
                  icon={User}
                />
                <DetailItem
                  label="LC Number"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-28" />
                    ) : (
                      product?.LC?.basicInfo?.lcNumber || "N/A"
                    )
                  }
                  icon={Hash}
                />
                <DetailItem
                  label="Product Description"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-full" />
                    ) : (
                      product?.productDescription || "N/A"
                    )
                  }
                  icon={FileText}
                />
                <DetailItem
                  label="Creation Date"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-24" />
                    ) : (
                      formatDate(product?.createdAt)
                    )
                  }
                  icon={Calendar}
                />
                <DetailItem
                  label="Last Updated"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-24" />
                    ) : (
                      formatDate(product?.updatedAt)
                    )
                  }
                  icon={Calendar}
                />
              </div>{" "}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {isLoading ? (
                  <>
                    <DetailItem label="Thickness" value={<ValueSkeleton />} />
                    <DetailItem label="Width" value={<ValueSkeleton />} />
                  </>
                ) : (
                  [
                    {
                      label: "Thickness",
                      value: product?.thickness,
                      unit: "mm",
                    },
                    { label: "Width", value: product?.width, unit: "mm" },
                    { label: "Length", value: product?.length, unit: "mm" },
                    { label: "Grade", value: product?.grade },
                    { label: "Color", value: product?.color },
                  ]
                    .filter((spec) => spec.value)
                    .map((spec) => (
                      <DetailItem key={spec.label} {...spec} icon={Ruler} />
                    ))
                )}
              </div>{" "}
            </div>
            {/* Inventory & Stock Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Inventory & Stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DetailItem
                  label="Quantity in Stock"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-20" />
                    ) : (
                      formatQuantityWithUnit(product?.quantity, product?.unit?.name, 2)
                    )
                  }
                  icon={Package}
                />
                <DetailItem
                  label="Total Quantity"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-20" />
                    ) : (
                      formatQuantityWithUnit(product?.totalQuantity, product?.unit?.name, 2)
                    )
                  }
                  icon={Layers}
                />
                {!isLoading && product?.initialQuantity != null && (
                  <DetailItem
                    label="Opening Quantity"
                    value={formatQuantityWithUnit(product?.initialQuantity, product?.unit?.name, 2)}
                    icon={PackagePlus}
                  />
                )}
                {!isLoading && (product?.totalRestockedQuantity > 0 || product?.restockCount > 0) && (
                  <DetailItem
                    label="Restocked Quantity"
                    value={`+${formatQuantityWithUnit(product?.totalRestockedQuantity, product?.unit?.name, 2)}${
                      product?.restockCount > 0 ? ` (${product.restockCount} additions)` : ""
                    }`}
                    icon={PackagePlus}
                  />
                )}
                {!isLoading && product?.transferredOutQuantity > 0 && (
                  <DetailItem
                    label="Transferred Out"
                    value={`-${formatQuantityWithUnit(product?.transferredOutQuantity, product?.unit?.name, 2)}`}
                    icon={ArrowRightLeft}
                  />
                )}
                {!isLoading && product?.lotClosed && (
                  <DetailItem
                    label="Closed Lot Residual"
                    value={formatQuantityWithUnit(product?.lotClosedQuantity, product?.unit?.name, 2)}
                    icon={Lock}
                  />
                )}
                <DetailItem
                  label="Stock Depletion / Sold"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-16" />
                    ) : (
                      `${formatExactNumber(product?.sellThroughRate || 0, 1)}%`
                    )
                  }
                  icon={TrendingUp}
                />
              </div>
            </div>

            {/* Pricing & Valuation Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Pricing & Valuation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DetailItem
                  label="Unit Price"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-20" />
                    ) : product?.unitPrice ? (
                      `${formatExactCurrency(product.unitPrice, 2)} / ${product?.unit?.name || "unit"}`
                    ) : (
                      "N/A"
                    )
                  }
                  icon={DollarSign}
                />
                <DetailItem
                  label="Current Stock Value"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-24" />
                    ) : (
                      formatExactCurrency(product?.currentStockValue, 2)
                    )
                  }
                  icon={DollarSign}
                />
                <DetailItem
                  label="Total Lot Value"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-24" />
                    ) : (
                      formatExactCurrency(product?.totalStockValue, 2)
                    )
                  }
                  icon={DollarSign}
                />
                <DetailItem
                  label="Realized Avg. Price"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-20" />
                    ) : (
                      `${formatExactCurrency(product?.averageSellingPrice, 2)} / ${product?.unit?.name || "unit"}`
                    )
                  }
                  icon={DollarSign}
                />
              </div>
            </div>

            {/* Sales & Invoicing Performance Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Sales & Invoicing Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DetailItem
                  label="Total Units Sold"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-20" />
                    ) : (
                      formatQuantityWithUnit(product?.totalUnitsSold, product?.unit?.name, 2)
                    )
                  }
                  icon={ShoppingCart}
                />
                <DetailItem
                  label="Total Sales Revenue"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-24" />
                    ) : (
                      formatExactCurrency(product?.totalRevenue, 2)
                    )
                  }
                  icon={DollarSign}
                />
                <DetailItem
                  label="Invoiced Sales"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-28" />
                    ) : (
                      `${formatExactCurrency(product?.totalInvoicedRevenue, 2)} (${product?.totalInvoicedCount || 0} sales)`
                    )
                  }
                  icon={FileText}
                />
                <DetailItem
                  label="Not Invoiced Sales"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-28" />
                    ) : (
                      `${formatExactCurrency(product?.totalNotInvoicedRevenue, 2)} (${product?.totalNotInvoiced || 0} sales)`
                    )
                  }
                  icon={FileWarning}
                />
                <DetailItem
                  label="Due Invoices"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-28" />
                    ) : (
                      `${formatExactCurrency(product?.totalDueRevenue, 2)} (${product?.totalDueInvoices || 0} due)`
                    )
                  }
                  icon={FileClock}
                />
                <DetailItem
                  label="Paid Invoices"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-28" />
                    ) : (
                      `${formatExactCurrency(product?.totalPaidRevenue, 2)} (${product?.totalPaidInvoices || 0} paid)`
                    )
                  }
                  icon={FileText}
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 min-w-0 lg:min-w-[320px]">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span>Sales Overview</span>
              {!isLoading && (
                <span className="text-xs font-normal text-gray-500">
                  {product?.warehouse?.name || "Warehouse"}
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              <StatBox
                title="Units Sold"
                number={
                  isLoading
                    ? ""
                    : formatQuantityWithUnit(
                        product?.currentWarehouseUnitsSold !== undefined &&
                          product?.currentWarehouseUnitsSold !== product?.totalUnitsSold
                          ? product?.currentWarehouseUnitsSold
                          : product?.totalUnitsSold,
                        product?.unit?.name,
                        2
                      )
                }
                subtitle={
                  product?.currentWarehouseUnitsSold !== undefined &&
                  product?.currentWarehouseUnitsSold !== product?.totalUnitsSold
                    ? `Total: ${formatQuantityWithUnit(product?.totalUnitsSold, product?.unit?.name, 2)} (all warehouses)`
                    : "Total across all sales"
                }
                Icon={ShoppingCart}
                valueClassName="text-base sm:text-lg font-bold tracking-tight break-words text-gray-900"
                subtitleClassName="text-[11px] text-gray-500 mt-1 line-clamp-2"
                loading={isLoading}
              />
              <StatBox
                title="Revenue"
                number={
                  isLoading
                    ? ""
                    : formatExactCurrency(
                        product?.currentWarehouseRevenue !== undefined &&
                          product?.currentWarehouseRevenue !== product?.totalRevenue
                          ? product?.currentWarehouseRevenue
                          : product?.totalRevenue,
                        2
                      )
                }
                subtitle={
                  product?.currentWarehouseRevenue !== undefined &&
                  product?.currentWarehouseRevenue !== product?.totalRevenue
                    ? `Total: ${formatExactCurrency(product?.totalRevenue, 2)} (all warehouses)`
                    : `Avg: ${formatExactCurrency(product?.averageSellingPrice, 2)} / ${product?.unit?.name || "unit"}`
                }
                Icon={DollarSign}
                textColor="green"
                valueClassName="text-base sm:text-lg font-bold tracking-tight break-words text-[var(--color-success)]"
                subtitleClassName="text-[11px] text-gray-500 mt-1 line-clamp-2"
                loading={isLoading}
              />
              <StatBox
                title="Due Invoices"
                number={
                  isLoading
                    ? ""
                    : `${product?.totalDueInvoices || 0} ${product?.totalDueInvoices === 1 ? "Invoice" : "Invoices"}`
                }
                subtitle={
                  isLoading
                    ? undefined
                    : `Due: ${formatExactCurrency(
                        product?.currentWarehouseDueRevenue !== undefined &&
                          product?.currentWarehouseDueRevenue !== product?.totalDueRevenue
                          ? product?.currentWarehouseDueRevenue
                          : product?.totalDueRevenue,
                        2
                      )}`
                }
                Icon={FileClock}
                textColor="yellow"
                valueClassName="text-base sm:text-lg font-bold tracking-tight break-words text-[var(--color-warning)]"
                subtitleClassName="text-[11px] text-gray-500 mt-1 line-clamp-2"
                loading={isLoading}
              />
              <StatBox
                title="Not Invoiced"
                number={
                  isLoading
                    ? ""
                    : `${product?.totalNotInvoiced || 0} ${product?.totalNotInvoiced === 1 ? "Sale" : "Sales"}`
                }
                subtitle={
                  isLoading
                    ? undefined
                    : `Pending: ${formatExactCurrency(
                        product?.currentWarehouseNotInvoicedRevenue !== undefined &&
                          product?.currentWarehouseNotInvoicedRevenue !== product?.totalNotInvoicedRevenue
                          ? product?.currentWarehouseNotInvoicedRevenue
                          : product?.totalNotInvoicedRevenue,
                        2
                      )}`
                }
                Icon={FileWarning}
                textColor="red"
                valueClassName="text-base sm:text-lg font-bold tracking-tight break-words text-[var(--color-danger)]"
                subtitleClassName="text-[11px] text-gray-500 mt-1 line-clamp-2"
                loading={isLoading}
              />
            </div>
          </div>
        </div>
        {hasPermission("SALE_VIEW_TABLE") ? (
          <SalesHistory warehouseId={warehouseId} productId={productId} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <ShieldAlert size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Sales History Restricted</h3>
            <p className="text-sm text-gray-500">You don't have permission to view sales history for this product. Contact your administrator for access.</p>
          </div>
        )}
        <RestockHistory warehouseId={warehouseId} productId={productId} unit={product?.unit?.name || "units"} initialQuantity={product?.initialQuantity} />
        {hasPermission("AUDIT_VIEW") && (
          <div className="mt-6">
            <EntityAuditLog moduleId={productId} moduleName="StockTransfer" title="Transfer History" />
          </div>
        )}
        {hasPermission("AUDIT_VIEW") && (
          <div className="mt-6">
            <EntityAuditLog moduleId={productId} moduleName="Product" />
          </div>
        )}
      </div>
      {showEditForm && (
        <AddProductForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onProductUpdated={() => {
            refetch();
            setShowEditForm(false);
          }}
          editingProduct={product}
          warehouse={product.warehouse}
        />
      )}
      {showRestockModal && product && (
        <RestockProductModal
          isOpen={showRestockModal}
          onClose={() => setShowRestockModal(false)}
          onSuccess={() => refetch()}
          product={product}
          warehouseId={warehouseId}
        />
      )}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        confirmingText="Deleting..."
        isConfirming={deleteProductMutation.isLoading}
      />
      <ConfirmationModal
        isOpen={showCloseLotModal}
        onClose={() => setShowCloseLotModal(false)}
        onConfirm={handleCloseLot}
        title="Close Lot"
        description={`Are you sure you want to close this lot? This will set the remaining stock (${formatNumber(product?.quantity)} ${product?.unit?.name || ""}) to zero and the product will no longer be available for sale.`}
        confirmText="Yes, Close Lot"
        confirmingText="Closing..."
        isConfirming={closeLotMutation.isPending}
        variant="primary"
        icon={Lock}
      />
      {showTransferModal && product && (
        <TransferStockModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          onSuccess={(response) => {
            setShowTransferModal(false);
            const data = response?.data?.data;
            if (data?.transferType === "full" && data?.destinationWarehouse?._id) {
              // Full transfer: product moved entirely — navigate to it in the new warehouse
              navigate(`/stock/${data.destinationWarehouse._id}/product/${productId}`);
            } else {
              // Partial transfer: source product still exists here — refetch to update quantity
              refetch();
            }
          }}
          product={product}
          warehouseId={warehouseId}
        />
      )}
    </div>
  );
};

export default ProductDetails;
