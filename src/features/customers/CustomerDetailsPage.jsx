import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  Calendar,
  Download,
  PieChart,
  Edit,
  Trash2,
  Building,
  Star,
  CreditCard,
  Loader2,
  FileIcon,
} from "lucide-react";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import { showSuccessToast, showErrorToast } from "@/utils/notifications";

// Components
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatusBadge from "@/components/ui/StatusBadge";
import DataField from "@/components/ui/DataField";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";

// Custom Hooks
import { useUrl } from "@/hooks/useUrl";
import { useCustomerData, useSalesData } from "@/hooks/useCustomerOperations";
import {
  useDeleteCustomer,
  useDeleteCustomerDocument,
} from "../../api/hooks/customer";
import { useAuth } from "@/hooks/useAuth";
import { downloadCustomerDocument } from "../../api/customer.api";
import { getSaleById } from "@/api/sales.api";
import { useSettings } from "@/context/SettingsContext";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { baseUrl } = useUrl();
  const deleteCustomerMutation = useDeleteCustomer();
  const deleteDocMutation = useDeleteCustomerDocument();
  const { hasPermission } = useAuth();
  const { formatCurrency, formatDate } = useSettings();
  const queryClient = useQueryClient();

  // State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
  });
  const [deleteDocModal, setDeleteDocModal] = useState({
    isOpen: false,
    docId: null,
  });

  useEffect(() => {
    if (!hasPermission("CUSTOMER_VIEW_DETAILS")) {
      showErrorToast("You don't have permission to view customer details.");
      navigate("/customers");
    }
  }, [hasPermission, navigate]);

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

  useEffect(() => {
    refetchCustomer();
  }, [refetchCustomer]);

  useEffect(() => {
    fetchSales(pagination.currentPage);
  }, [fetchSales, pagination.currentPage]);

  const getFileUrl = useCallback(
    (customerId, docId) => {
      if (!baseUrl || !customerId || !docId) return "#";
      const cleanBaseUrl = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;
      return `${cleanBaseUrl}/customer/${customerId}/documents/${docId}`;
    },
    [baseUrl],
  );

  // Handlers
  const handleDelete = useCallback(() => {
    deleteCustomerMutation.mutate(id, {
      onSuccess: () => navigate("/customers"),
    });
  }, [id, navigate, deleteCustomerMutation]);

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
    [fetchSales],
  );

  const handleDeleteDoc = (docId) => {
    setDeleteDocModal({ isOpen: true, docId });
  };

  const handleConfirmDeleteDoc = () => {
    if (!deleteDocModal.docId) return;
    deleteDocMutation.mutate(
      { customerId: id, docId: deleteDocModal.docId },
      {
        onSuccess: () => {
          setDeleteDocModal({ isOpen: false, docId: null });
          refetchCustomer();
        },
      },
    );
  };

  const handleDownload = async (customerId, docId, originalName) => {
    try {
      const response = await downloadCustomerDocument(customerId, docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccessToast("Downloading started...");
    } catch (err) {
      showErrorToast(err, "Failed to download file");
    }
  };

  const prefetchSale = useCallback(
    (saleId) => {
      queryClient.prefetchQuery({
        queryKey: ["sales", saleId],
        queryFn: async () => (await getSaleById(saleId)).data,
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient],
  );

  const preloadEditForm = useCallback(() => {
    import("@/features/customers/CustomerFormPage");
  }, []);

  // Memoized values
  const customerStats = useMemo(
    () => ({
      totalPurchases: customerData?.stats?.totalPurchases || 0,
      totalSpent: formatCurrency(customerData?.stats?.totalSpent),
      notInvoiced: customerData?.stats?.notInvoiced || 0,
      outstandingDues: formatCurrency(customerData?.stats?.outstandingDues),
    }),
    [customerData?.stats, formatCurrency],
  );

  if (customerError && !loadingCustomer)
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
  if (!customerData && !loadingCustomer)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto">
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
                  {loadingCustomer ? (
                    <ValueSkeleton width="w-48" height="h-8" />
                  ) : (
                    customerData?.name
                  )}
                </h1>
                <div className="flex items-center mt-1 flex-wrap gap-2">
                  {loadingCustomer ? (
                    <ValueSkeleton width="w-24" height="h-5" />
                  ) : (
                    <>
                      {customerData?.customerId && (
                        <span className="text-gray-600 text-sm sm:text-base">
                          {customerData.customerId}
                        </span>
                      )}
                      <StatusBadge status={customerData?.customerStatus} />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasPermission("CUSTOMER_UPDATE") && (
                <Button
                  onClick={() => navigate(`/customer-form/${id}`)}
                  onMouseEnter={preloadEditForm}
                  variant="primary"
                  size="sm"
                  className="flex items-center"
                  aria-label="Edit customer"
                >
                  <Edit className="mr-2 w-4 h-4" aria-hidden="true" />
                  Edit
                </Button>
              )}
              {hasPermission("CUSTOMER_DELETE") && (
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
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <CollapsibleCard
              title="General Information"
              icon={<User className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="General Information Section"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataField
                  label="Company Name"
                  value={customerData?.companyName}
                  icon={Building}
                  loading={loadingCustomer}
                />
                <DataField
                  label="Customer Type"
                  value={customerData?.customerType}
                  loading={loadingCustomer}
                />
                <DataField
                  label="Email"
                  value={customerData?.email}
                  icon={Mail}
                  type="email"
                  loading={loadingCustomer}
                />
                <DataField
                  label="Phone"
                  value={customerData?.phone}
                  icon={Phone}
                  type="tel"
                  loading={loadingCustomer}
                />
                <DataField
                  label="Credit Limit"
                  value={customerData?.creditLimit}
                  format="currency"
                  icon={CreditCard}
                  loading={loadingCustomer}
                />
                <DataField
                  label="Opening Due"
                  value={customerData?.openingDue}
                  format="currency"
                  icon={DollarSign}
                  loading={loadingCustomer}
                />
                <DataField
                  label="Join Date"
                  value={customerData?.joinDate}
                  format="date"
                  icon={Calendar}
                  loading={loadingCustomer}
                />
                <div className="sm:col-span-2">
                  <DataField
                    label="Billing Address"
                    value={customerData?.billingAddress}
                    icon={MapPin}
                    loading={loadingCustomer}
                  />
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Transaction Overview"
              icon={<PieChart className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="Transaction Overview Section"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--color-primary-light)] p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">
                    {loadingCustomer ? (
                      <ValueSkeleton width="w-12" height="h-7" />
                    ) : (
                      customerStats.totalPurchases
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-primary)] mt-1">
                    Total Purchases
                  </div>
                </div>
                <div className="bg-[var(--color-success-light)] p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-success)]">
                    {loadingCustomer ? (
                      <ValueSkeleton width="w-16" height="h-7" />
                    ) : (
                      customerStats.totalSpent
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-success)] mt-1">
                    Total Spent
                  </div>
                </div>
                <div className="bg-[var(--color-warning-light)] p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-warning)]">
                    {loadingCustomer ? (
                      <ValueSkeleton width="w-12" height="h-7" />
                    ) : (
                      customerStats.notInvoiced
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-warning)] mt-1">
                    Not Invoiced
                  </div>
                </div>
                <div className="bg-[var(--color-danger-light)] p-4 rounded-lg text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-danger)]">
                    {loadingCustomer ? (
                      <ValueSkeleton width="w-16" height="h-7" />
                    ) : (
                      customerStats.outstandingDues
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-danger)] mt-1">
                    Outstanding Dues
                  </div>
                </div>
              </div>
            </CollapsibleCard>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <CollapsibleCard
              title="Status Information"
              icon={<Star className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="Status Information Section"
            >
              <div className="space-y-3">
                <DataField
                  label="Customer Status"
                  value={<StatusBadge status={customerData?.customerStatus} />}
                  loading={loadingCustomer}
                />
                <DataField
                  label="Customer Type"
                  value={customerData?.customerType}
                  loading={loadingCustomer}
                />
                <DataField
                  label="Customer ID"
                  value={customerData?.customerId}
                  loading={loadingCustomer}
                />
                <DataField
                  label="Join Date"
                  value={customerData?.joinDate}
                  format="date"
                  icon={Calendar}
                  loading={loadingCustomer}
                />
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Documents & Note"
              icon={<FileText className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="Documents & Note Section"
            >
              <div className="space-y-3">
                {customerData?.documents?.length > 0 && (
                  <div className="space-y-3">
                    {customerData.documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center min-w-0">
                          <FileIcon className="text-gray-400 mr-3 flex-shrink-0" />
                          <a
                            href={getFileUrl(id, doc._id)}
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
                              handleDownload(id, doc._id, doc.originalName)
                            }
                            variant="subtle"
                            size="sm"
                            className="!p-2 text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-full"
                            aria-label="Download document"
                          >
                            <Download size={18} />
                          </Button>
                          {hasPermission("CUSTOMER_UPDATE") && (
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
                )}
                {customerData.customerNote && (
                  <div className="border-t border-gray-200 pt-3">
                    <DataField
                      label="Customer Note"
                      value={customerData.customerNote}
                      icon={FileText}
                      loading={loadingCustomer}
                    />
                  </div>
                )}
                {!customerData.customerNote &&
                  customerData.documents?.length === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      No documents or notes available.
                    </p>
                  )}
              </div>
            </CollapsibleCard>
          </div>
        </div>

        {hasPermission("SALE_VIEW_TABLE") && (
          <div className="mt-4 sm:mt-6">
            <CollapsibleCard
              title="Recent Purchases"
              icon={<DollarSign className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="Recent Purchases Section"
            >
              {loadingSales ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <th key={i} className="px-4 py-3 text-left">
                            <ValueSkeleton width="w-16" height="h-4" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <ValueSkeleton width="w-full" height="h-4" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                        onMouseEnter={() => prefetchSale(sale._id)}
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
                            {sale.saleId?.startsWith("OPEN-BAL-") ? (
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  Opening Balance
                                </h4>
                                <span className="px-2 py-0.5 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-full">
                                  Automated
                                </span>
                              </div>
                            ) : (
                              <h4 className="font-semibold text-[var(--color-primary)] text-sm">
                                {sale.product?.name || "N/A"}
                              </h4>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(sale.saleDate)}
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
                            onMouseEnter={() => prefetchSale(sale._id)}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(sale.saleDate)}
                            </td>
                            {sale.saleId?.startsWith("OPEN-BAL-") ? (
                              <>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      Opening Balance
                                    </span>
                                    <span className="px-2 py-0.5 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-full">
                                      Automated
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  N/A
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-[var(--color-primary)]">
                                    {sale.product?.name || "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {sale.product?.LC?.basicInfo?.lcNumber ||
                                    "N/A"}
                                </td>
                              </>
                            )}
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
        )}
      </div>

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
        variant="danger"
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
        variant="danger"
        icon={Trash2}
      />
    </motion.div>
  );
};

CustomerDetails.propTypes = {
  id: PropTypes.string,
};

export default memo(CustomerDetails);
