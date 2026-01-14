import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
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
} from "lucide-react";
import { useProduct, useDeleteProduct } from "@/api/hooks/products";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatBox from "@/components/ui/StatBox";
import AddProductForm from "./AddProductForm";
import SalesHistory from "./SalesHistory";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast } from "@/utils/notifications";
import Button from "@/components/ui/button";

const formatNumber = (num) => {
  if (typeof num !== "number") return num;
  return parseFloat(num.toFixed(3));
};

const getStockStatusBadgeStyle = (status) => {
  switch (status) {
    case "OK":
      return "bg-green-100 text-green-800 border-green-200";
    case "Low":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "No Stock":
      return "bg-red-100 text-red-800 border-red-200";
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading Product Details...</span>
        </div>
      </div>
    );
  }

  if (isError) {
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

  if (!product) {
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
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-gray-600">{product?.category?.name}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStatusBadgeStyle(
                      product.stockStatus,
                    )}`}
                  >
                    {product.stockStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {hasPermission("PRODUCT_UPDATE") && (
                <Button
                  onClick={() => setShowEditForm(true)}
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
                                    value={product.category?.name || "N/A"}
                                    icon={Tag}
                                  />
                                  <DetailItem
                                    label="Supplier"
                                    value={product.LC?.basicInfo?.supplierName || "N/A"}
                                    icon={User}
                                  />
                                  <DetailItem
                                    label="LC Number"
                                    value={product.LC?.basicInfo?.lcNumber || "N/A"}
                                    icon={Hash}
                                  />
                                  <DetailItem
                                    label="Product Description"
                                    value={product.productDescription || "N/A"}
                                    icon={FileText}
                                  />
                                  <DetailItem
                                    label="Creation Date"
                                    value={new Date(product.createdAt).toLocaleDateString()}
                                    icon={Calendar}
                                  />
                                  <DetailItem
                                    label="Last Updated"
                                    value={new Date(product.updatedAt).toLocaleDateString()}
                                    icon={Calendar}
                                  />
                                </div>            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Specifications
              </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  {[
                                    { label: "Thickness", value: product.thickness, unit: "mm" },
                                    { label: "Width", value: product.width, unit: "mm" },
                                    { label: "Length", value: product.length, unit: "mm" },
                                    { label: "Grade", value: product.grade },
                                    { label: "Color", value: product.color }, // Added color
                                  ]
                                    .filter((spec) => spec.value)
                                    .map((spec) => (
                                      <DetailItem key={spec.label} {...spec} icon={Ruler} />
                                    ))}
                                </div>            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Inventory & Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DetailItem
                  label="Quantity in Stock"
                  value={`${formatNumber(product.quantity)} ${
                    product.unit?.name
                  }`}
                  icon={Package}
                />
                <DetailItem
                  label="Unit Price"
                  value={
                    product.unitPrice
                      ? `৳${product.unitPrice.toLocaleString()}`
                      : "N/A"
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
                number={formatNumber(product.totalUnitsSold)}
                Icon={ShoppingCart}
              />
              <StatBox
                title="Total Revenue"
                number={`৳${formatNumber(
                  product.totalRevenue,
                ).toLocaleString()}`}
                Icon={DollarSign}
                textColor="green"
              />
              <StatBox
                title="Due Invoices"
                number={product.totalDueInvoices}
                Icon={FileClock}
                textColor="orange"
              />
              <StatBox
                title="Not Invoiced"
                number={product.totalNotInvoiced}
                Icon={FileWarning}
                textColor="red"
              />
            </div>
          </div>
        </div>
        {hasPermission("SALE_VIEW_TABLE") && (
          <SalesHistory warehouseId={warehouseId} productId={productId} />
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
