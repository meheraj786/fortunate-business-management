import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  DollarSign,
  Edit,
  FileClock,
  FileWarning,
  Hash,
  Loader2,
  Package,
  Ruler,
  ShoppingCart,
  Tag,
  Trash2,
  User,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { useProduct, useDeleteProduct } from "@/api/hooks/products";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatBox from "@/components/ui/StatBox";
import AddProductForm from "./AddProductForm";
import SalesHistory from "./SalesHistory";
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
  const { formatCurrency, formatDate } = useSettings();
  const queryClient = useQueryClient();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDelete = () => {
    deleteProductMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteModal(false);
        navigate(`/stock/${warehouseId}`);
      },
    });
  };

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
            {error.message || "Error loading product details"}
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 space-y-6">
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
                      product?.LC?.basicInfo?.supplierName || "N/A"
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
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Inventory & Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DetailItem
                  label="Quantity in Stock"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-16" />
                    ) : (
                      `${formatNumber(product?.quantity)} ${product?.unit?.name || ""
                      }`
                    )
                  }
                  icon={Package}
                />
                <DetailItem
                  label="Unit Price"
                  value={
                    isLoading ? (
                      <ValueSkeleton width="w-20" />
                    ) : product?.unitPrice ? (
                      formatCurrency(product.unitPrice)
                    ) : (
                      "N/A"
                    )
                  }
                  icon={DollarSign}
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 min-w-[320px]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Sales Overview
            </h2>
            <div className="space-y-4">
              <StatBox
                title="Total Units Sold"
                number={formatNumber(product?.totalUnitsSold)}
                Icon={ShoppingCart}
                loading={isLoading}
              />
              <StatBox
                title="Total Revenue"
                number={formatCurrency(product?.totalRevenue)}
                Icon={DollarSign}
                textColor="green"
                loading={isLoading}
              />
              <StatBox
                title="Due Invoices"
                number={product?.totalDueInvoices}
                Icon={FileClock}
                textColor="orange"
                loading={isLoading}
              />
              <StatBox
                title="Not Invoiced"
                number={product?.totalNotInvoiced}
                Icon={FileWarning}
                textColor="red"
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
    </div>
  );
};

export default ProductDetails;
