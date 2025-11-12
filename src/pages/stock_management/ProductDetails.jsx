import React, { useContext, useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Package,
  DollarSign,
  ShoppingCart,
  FileWarning,
  FileClock,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import StatBox from "../../components/common/StatBox";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UrlContext } from "../../context/UrlContext";
import axios from "axios";
import AddProductForm from "./AddProductForm";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../../components/common/ConfirmationModal";

const ProductDetails = () => {
  const { warehouseId, productId } = useParams();
  const { baseUrl } = useContext(UrlContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${baseUrl}warehouse/${warehouseId}/products/${productId}`
      );
      setProduct(response.data.data);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "Failed to fetch product details";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [warehouseId, productId, baseUrl]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `${baseUrl}warehouse/${warehouseId}/products/${productId}`
      );
      toast.success("Product deleted successfully");
      navigate(`/stock/${warehouseId}`);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "Failed to delete product";
      toast.error(errorMessage);
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditClick = () => setShowEditForm(true);
  const handleFormClose = () => setShowEditForm(false);

  const handleProductUpdated = () => {
    fetchProductDetails();
    handleFormClose();
  };

  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading Product Details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !product) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading product details</div>
          <button
            onClick={fetchProductDetails}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Safety check
  if (!product) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
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

  const sales = product.recentSales || [];
  const stats = {
    totalUnitsSold: product.totalUnitsSold || 0,
    totalRevenue: product.totalRevenue || 0,
    totalDueInvoices: product.totalDueInvoices || 0,
    totalNotInvoiced: product.totalNotInvoiced || 0,
  };

  const breadcrumbItems = [
    { label: "Stock", path: "/stock-management" },
    {
      label: product?.warehouse?.name,
      path: `/stock/${product?.warehouse?._id}`,
    },
    { label: product.name },
  ];

  const getStatusBadge = (status, type) => {
    const styles = {
      invoice: {
        Invoiced: "bg-green-100 text-green-800 border border-green-200",
        "Not Invoiced":
          "bg-yellow-100 text-yellow-800 border border-yellow-200",
      },
      payment: {
        "Paid Payment": "bg-green-100 text-green-800 border border-green-200",
        "Due Payment": "bg-yellow-100 text-yellow-800 border border-yellow-200",
        "N/A": "bg-gray-100 text-gray-800 border border-gray-200",
      },
    };

    const styleMap = type === "invoice" ? styles.invoice : styles.payment;
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      styleMap[status] || styleMap["N/A"]
    }`;
  };

  const NoDataMessage = () => (
    <div className="text-center py-8 text-gray-500">
      No sales data available for this product.
    </div>
  );

  const SalesTableRow = ({ sale }) => (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/sales/${sale._id}`)}
    >
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(sale.saleDate).toLocaleDateString()}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {sale.customer.name}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {sale.quantity}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        ${parseFloat(sale.pricePerUnit || 0).toFixed(2)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        ${sale.totalAmount.toFixed(2)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={getStatusBadge(sale.invoiceStatus, "invoice")}>
          {sale.invoiceStatus}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={getStatusBadge(sale.paymentStatus, "payment")}>
          {sale.paymentStatus}
        </span>
      </td>
    </tr>
  );

  const MobileSalesCard = ({ sale }) => (
    <div
      className="border-t border-gray-200 last:border-b bg-white cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => navigate(`/sales/${sale._id}`)}
    >
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium text-gray-900">{sale.customer.name}</div>
          <span className="text-sm text-gray-500">
            {new Date(sale.saleDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Qty: {sale.quantity}</span>
          <span className="text-gray-600">
            Price: ${parseFloat(sale.pricePerUnit || 0).toFixed(2)}
          </span>
        </div>
        <div className="border-t border-gray-100 my-2"></div>
        <div className="flex justify-between items-center">
          <span className={getStatusBadge(sale.invoiceStatus, "invoice")}>
            {sale.invoiceStatus}
          </span>
          <span className={getStatusBadge(sale.paymentStatus, "payment")}>
            {sale.paymentStatus}
          </span>
        </div>
        <div className="border-t border-gray-100 my-2"></div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total</span>
          <span className="font-bold text-gray-900">
            ${sale.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderMobileSales = () => (
    <div className="space-y-2 sm:hidden">
      {sales.map((sale) => (
        <MobileSalesCard key={sale._id} sale={sale} />
      ))}
      {sales.length === 0 && <NoDataMessage />}
    </div>
  );

  const renderDesktopSales = () => (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              "Date",
              "Customer",
              "Qty",
              "Price",
              "Total",
              "Invoice Status",
              "Payment Status",
            ].map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sales.map((sale) => (
            <SalesTableRow key={sale._id} sale={sale} />
          ))}
        </tbody>
      </table>
      {sales.length === 0 && <NoDataMessage />}
    </div>
  );

  const SpecificationItem = ({ label, value, unit }) => (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900">
        {value} {unit || ""}
      </p>
    </div>
  );

  const renderSpecifications = () => {
    const specifications = [
      { label: "Thickness", value: product.thickness, unit: "mm" },
      { label: "Width", value: product.width, unit: "mm" },
      { label: "Length", value: product.length, unit: "mm" },
      { label: "Grade", value: product.grade },
      { label: "Color", value: product.color },
    ].filter((spec) => spec.value);

    if (specifications.length === 0) return null;

    return (
      <>
        <div className="border-t border-gray-200 my-6"></div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Specifications
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {specifications.map((spec) => (
              <SpecificationItem key={spec.label} {...spec} />
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        {/* Product Header */}
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
                <p className="text-gray-600 mt-1">{product?.category?.name}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleEditClick}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={openDeleteModal}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Product Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Product Details
            </h2>

            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">LC Number</p>
                  <p className="font-medium text-gray-900">
                    {product.LC?.basic_info?.lc_number || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">
                    {product?.category?.name}
                  </p>
                </div>
              </div>
            </div>

            {renderSpecifications()}

            <div className="border-t border-gray-200 my-6"></div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Inventory
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quantity in Stock</p>
                  <p className="font-medium text-gray-900">
                    {product.quantity} {product.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">
                    {product?.warehouse?.name}
                  </p>
                </div>
                {product.unitPrice && (
                  <div>
                    <p className="text-sm text-gray-600">Unit Price</p>
                    <p className="font-bold text-lg text-gray-900">
                      ${parseFloat(product.unitPrice).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sales Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Sales Overview
            </h2>
            <div className="space-y-4">
              <StatBox
                title="Total Units Sold"
                number={stats.totalUnitsSold.toLocaleString()}
                Icon={ShoppingCart}
                iconColor="text-green-600"
                iconBgColor="bg-green-100"
              />
              <StatBox
                title="Total Revenue"
                number={`$${stats.totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                Icon={DollarSign}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-100"
              />
              <StatBox
                title="Total Due Invoices"
                number={stats.totalDueInvoices}
                Icon={FileClock}
                iconColor="text-yellow-600"
                iconBgColor="bg-yellow-100"
              />
              <StatBox
                title="Total Not Invoiced"
                number={stats.totalNotInvoiced}
                Icon={FileWarning}
                iconColor="text-red-600"
                iconBgColor="bg-red-100"
              />
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Sales
            </h2>
            {sales.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Showing {sales.length} recent sale
                {sales.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {renderMobileSales()}
          {renderDesktopSales()}
        </div>
      </div>
      {/* Edit Form Modal */}
      {showEditForm && (
        <AddProductForm
          isOpen={showEditForm}
          onClose={handleFormClose}
          onProductUpdated={handleProductUpdated}
          editingProduct={product}
          warehouse={product.warehouse}
        />
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        confirmingText="Deleting..."
        isConfirming={deleting}
      />{" "}
    </div>
  );
};

export default ProductDetails;
