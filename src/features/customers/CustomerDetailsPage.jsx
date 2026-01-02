import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useContext,
} from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router"; // Changed to react-router
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Star,
  Download,
  PieChart,
  Edit,
  Trash2,
  Building,
  Clock,
  TrendingUp,
  CreditCard,
  Loader2,
} from "lucide-react";
import CustomerDetailsSkeleton from "./components/CustomerDetailsSkeleton";
import { handleError } from "@/utils/handle-error";
import toast from "react-hot-toast";

// Components
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatusBadge from "@/components/ui/StatusBadge";
import DataField from "@/components/ui/DataField";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button"; // Import Button

// Custom Hooks
import { useUrl } from "@/context/UrlProvider";
import { useCustomerData, useSalesData } from "@/hooks/useCustomerOperations";
import { useDeleteCustomer } from "../../api/hooks/customer";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { baseUrl } = useUrl();
  const deleteCustomerMutation = useDeleteCustomer();

  // State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
  });

  // Custom Hooks
  const {
    customerData,
    loading: loadingCustomer,
    error: customerError,
    refetch: refetchCustomer,
  } = useCustomerData(id);

  const {
    salesData,
    pagination,
    loading: loadingSales,
    fetchSales,
  } = useSalesData(id);

  // Effects
  useEffect(() => {
    refetchCustomer();
  }, [refetchCustomer]);

  useEffect(() => {
    fetchSales(pagination.currentPage);
  }, [fetchSales, pagination.currentPage]);

  // Helper function to construct document URLs
  const getDocumentUrl = useCallback(
    (documentName) => {
      if (!baseUrl || !documentName) return "#";
      return `${baseUrl}documents/${documentName}`;
    },
    [baseUrl]
  );

  // Handlers
  const handleDelete = useCallback(async () => {
    await deleteCustomerMutation.mutateAsync(id);
    toast.success("Customer deleted successfully!");
    navigate("/customers");
  }, [id, navigate]);

  const handleOpenDeleteModal = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Customer",
      description: `Are you sure you want to delete customer "${customerData?.name}"? This action cannot be undone.`,
    });
  }, [customerData?.name]);

  const handleSalesPageChange = useCallback(
    (page) => {
      fetchSales(page);
    },
    [fetchSales]
  );

  const formatCurrency = useCallback((amount) => {
    return `৳${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, []);

  // Memoized values
  const customerStats = useMemo(
    () => ({
      totalPurchases: customerData?.stats?.totalPurchases || 0,
      totalSpent: formatCurrency(customerData?.stats?.totalSpent),
      notInvoiced: customerData?.stats?.notInvoiced || 0,
      outstandingDues: formatCurrency(customerData?.stats?.outstandingDues),
    }),
    [customerData?.stats, formatCurrency]
  );

  const handleDownload = async (customerId, fileName) => {
    try {
      const downloadUrl = `${baseUrl}customers/${customerId}/documents/${encodeURIComponent(
        fileName
      )}`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.remove();
    } catch (error) {
      handleError(error, "Download trigger failed");
    }
  };

  if (loadingCustomer) {
    return <CustomerDetailsSkeleton />;
  }

  if (customerError) {
    return (
      <div className="flex flex-col items-center justify-center h-full ">
        <div className="bg-[var(--color-danger-light)] border border-[var(--color-danger-light)] rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-[var(--color-danger)] mb-2">
            Error Loading Customer
          </h3>
          <p className="text-[var(--color-danger)] mb-4">{customerError}</p>
          <div className="flex gap-3">
            <Button onClick={refetchCustomer} variant="primary" size="sm">
              Retry
            </Button>
            <Button
              onClick={() => navigate("/customers")}
              variant="secondary"
              size="sm"
            >
              Back to Customers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-[var(--color-warning-light)] border border-[var(--color-warning-light)] rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-[var(--color-warning)] mb-2">
            Customer Not Found
          </h3>
          <p className="text-[var(--color-warning)] mb-4">
            The requested customer could not be found.
          </p>
          <Button
            onClick={() => navigate("/customers")}
            variant="secondary"
            size="sm"
          >
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <User className="text-[var(--color-primary)] text-xl sm:text-2xl" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {customerData.name}
                </h1>
                <div className="flex items-center mt-1 flex-wrap gap-2">
                  {customerData.customerId && (
                    <span className="text-gray-600 text-sm sm:text-base">
                      {customerData.customerId}
                    </span>
                  )}
                  <StatusBadge status={customerData.customerStatus} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate(`/customer-form/${id}`)}
                variant="primary"
                size="sm"
                className="flex items-center"
                aria-label="Edit customer"
              >
                <Edit className="mr-2 w-4 h-4" aria-hidden="true" />
                Edit
              </Button>
              <Button
                onClick={handleOpenDeleteModal}
                variant="danger"
                size="sm"
                className="flex items-center"
                aria-label="Delete customer"
              >
                <Trash2 className="mr-2 w-4 h-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Column 1 - General Info & Transaction Overview */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* General Info */}
            <CollapsibleCard
              title="General Information"
              icon={<User className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="General Information Section"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataField
                  label="Company Name"
                  value={customerData.companyName}
                  icon={Building}
                />
                <DataField
                  label="Customer Type"
                  value={customerData.customerType}
                />
                <DataField
                  label="Email"
                  value={customerData.email}
                  icon={Mail}
                  type="email"
                />
                <DataField
                  label="Phone"
                  value={customerData.phone}
                  icon={Phone}
                  type="tel"
                />
                <DataField
                  label="Credit Limit"
                  value={formatCurrency(customerData.creditLimit)}
                  icon={CreditCard}
                />
                <DataField
                  label="Join Date"
                  value={new Date(customerData.joinDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                  icon={Calendar}
                />
                <div className="sm:col-span-2">
                  <DataField
                    label="Billing Address"
                    value={customerData.billingAddress}
                    icon={MapPin}
                  />
                </div>
                {customerData.customerNote && (
                  <div className="sm:col-span-2">
                    <DataField
                      label="Notes"
                      value={customerData.customerNote}
                      icon={FileText}
                    />
                  </div>
                )}
              </div>
            </CollapsibleCard>

            {/* Transaction Overview */}
            <CollapsibleCard
              title="Transaction Overview"
              icon={<PieChart className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="Transaction Overview Section"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--color-primary-light)] p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">
                    {customerStats.totalPurchases}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-primary)] mt-1">
                    Total Purchases
                  </div>
                </div>
                <div className="bg-[var(--color-success-light)] p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-success)]">
                    {customerStats.totalSpent}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-success)] mt-1">
                    Total Spent
                  </div>
                </div>
                <div className="bg-[var(--color-warning-light)] p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-warning)]">
                    {customerStats.notInvoiced}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-warning)] mt-1">
                    Not Invoiced
                  </div>
                </div>
                <div className="bg-[var(--color-danger-light)] p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-danger)]">
                    {customerStats.outstandingDues}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-danger)] mt-1">
                    Outstanding Dues
                  </div>
                </div>
              </div>
            </CollapsibleCard>
          </div>

          {/* Column 2 - Status & Documents */}
          <div className="space-y-4 sm:space-y-6">
            {/* Status Info */}
            <CollapsibleCard
              title="Status Information"
              icon={<Star className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="Status Information Section"
            >
              <div className="space-y-3">
                <DataField
                  label="Customer Status"
                  value={<StatusBadge status={customerData.customerStatus} />}
                />
                <DataField
                  label="Customer Type"
                  value={customerData.customerType}
                />
                <DataField
                  label="Customer ID"
                  value={customerData.customerId}
                />
                <DataField
                  label="Join Date"
                  value={new Date(customerData.joinDate).toLocaleDateString()}
                  icon={Calendar}
                />
              </div>
            </CollapsibleCard>

            {/* Documents */}
            <CollapsibleCard
              title="Documents"
              icon={<FileText className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="Documents Section"
            >
              <div className="space-y-3">
                {customerData.documents?.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white transition-colors"
                  >
                    <FileText className="text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 truncate">
                        {doc.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(doc.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        handleDownload(
                          customerData._id,
                          doc.storedName || doc.name
                        )
                      }
                      variant="subtle"
                      size="sm"
                      className="!p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-full"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          </div>
        </div>

        {/* Recent Purchases - Full Width */}
        <div className="mt-4 sm:mt-6">
          <CollapsibleCard
            title="Recent Purchases"
            icon={<DollarSign className="text-[var(--color-primary)]" />}
            defaultOpen={true}
            ariaLabel="Recent Purchases Section"
          >
            {loadingSales ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
                <span className="ml-3 text-gray-600">Loading purchases...</span>
              </div>
            ) : salesData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No purchases found for this customer</p>
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="block sm:hidden space-y-3">
                  {salesData.map((sale) => (
                    <div
                      key={sale._id}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/sales/${sale._id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          navigate(`/sales/${sale._id}`);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {sale.product?.name || "N/A"}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-sm">
                            {formatCurrency(sale.totalAmountToBePaid)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Qty: {sale.quantity} {sale.unit?.name || ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <StatusBadge status={sale.invoiceStatus} />
                        <StatusBadge status={sale.paymentStatus} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          LC Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesData.map((sale) => (
                        <tr
                          key={sale._id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/sales/${sale._id}`)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-[var(--color-primary)]">
                              {sale.product?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {sale.product?.LC?.basicInfo?.lcNumber || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {sale.quantity} {sale.unit?.name || ""}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(sale.pricePerUnit)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(sale.totalAmountToBePaid)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={sale.invoiceStatus} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={sale.paymentStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handleSalesPageChange}
                      isLoading={loadingSales}
                      totalItems={pagination.totalItems}
                    />
                  </div>
                )}
              </>
            )}
          </CollapsibleCard>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText="Delete"
        cancelText="Cancel"
        isConfirming={deleteCustomerMutation.isLoading}
        icon={Trash2}
        variant="danger" // Themed variant
      />
    </motion.div>
  );
};

export default memo(CustomerDetails);
