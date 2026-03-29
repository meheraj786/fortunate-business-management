import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate, Link } from "react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  Calendar,
  Download,
  Edit,
  Trash2,
  Building,
  CreditCard,
  FileIcon,
  Wallet,
  ShoppingBag,
  AlertCircle,
  Receipt,
} from "lucide-react";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import AuditInfoSection from "@/components/ui/AuditInfoSection";
import StatBox from "@/components/ui/StatBox";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { showSuccessToast, showErrorToast } from "@/utils/notifications";

// Components
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatusBadge from "@/components/ui/StatusBadge";
import DataField from "@/components/ui/DataField";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import AddCreditModal from "./components/AddCreditModal";
import CreditHistoryTable from "./components/CreditHistoryTable";
import EntityAuditLog from "@/components/ui/EntityAuditLog";

// Custom Hooks
import { useUrl } from "@/hooks/useUrl";
import CustomerTypePill from "@/components/ui/CustomerTypePill";
import { useCustomerData, useSalesData } from "@/hooks/useCustomerOperations";
import {
  useDeleteCustomer,
  useDeleteCustomerDocument,
} from "../../api/hooks/customer";
import { useAuth } from "@/hooks/useAuth";
import { downloadCustomerDocument } from "../../api/customer.api";
import { getSaleById, getSalesSummaryTable } from "@/api/sales.api";
import { useSettings } from "@/context/SettingsContext";


const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { baseUrl } = useUrl();
  const deleteCustomerMutation = useDeleteCustomer();
  const deleteDocMutation = useDeleteCustomerDocument();
  const { hasPermission } = useAuth();
  const canViewSensitive = hasPermission("CUSTOMER_VIEW_SENSITIVE") || hasPermission("CUSTOMER_UPDATE");
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
  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);

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

  const { data: openingBalanceSale } = useQuery({
    queryKey: ["sales", "opening-balance", customerData?.customerId],
    queryFn: async () => {
      try {
        const response = await getSalesSummaryTable({ search: `OPEN-BAL-${customerData.customerId}`, limit: 1 });
        const sales = response?.data?.data?.sales;
        if (sales && sales.length > 0) {
          const exactMatch = sales.find(s => s.saleId === `OPEN-BAL-${customerData.customerId}`);
          return exactMatch || null;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch opening balance sale ID", error);
        return null;
      }
    },
    enabled: !!(customerData?.customerId && customerData?.openingDue > 0),
  });

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
      notInvoiced: formatCurrency(customerData?.stats?.notInvoiced || 0),
      outstandingDues: formatCurrency(customerData?.stats?.outstandingDues),
      creditBalance: formatCurrency(customerData?.creditBalance || 0),
    }),
    [customerData?.stats, customerData?.creditBalance, formatCurrency],
  );

  // Helper to get due amount (uses persisted field, falls back to calculation)
  const getDueAmount = (sale) => {
    if (sale.balanceDue != null) return sale.balanceDue;
    const totalPaid = sale.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    return Math.round(((sale.totalAmountToBePaid || 0) - totalPaid) * 100) / 100;
  };

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

  const breadcrumbItems = [
    { label: "Customers", path: "/customers" },
    { label: customerData?.name || "Customer Profile" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* ===== HEADER ===== */}
        <motion.div
          className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
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
                <div className="flex items-center mt-1.5 flex-wrap gap-2">
                  {loadingCustomer ? (
                    <ValueSkeleton width="w-32" height="h-5" />
                  ) : (
                    <>
                      {customerData?.customerId && (
                        <span className="text-gray-500 text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {customerData?.customerId}
                        </span>
                      )}
                      <CustomerTypePill type={customerData?.customerType} />
                      <StatusBadge status={customerData?.customerStatus} size="sm" />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasPermission("CUSTOMER_UPDATE") && (
                <Button
                  onClick={() => navigate(`/customer-form/${id}`)}
                  onMouseEnter={preloadEditForm}
                  variant="primary"
                  size="sm"
                  className="flex items-center justify-center flex-1 sm:flex-initial"
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
                  className="flex items-center justify-center flex-1 sm:flex-initial"
                  aria-label="Delete customer"
                >
                  <Trash2 className="mr-2 w-4 h-4" aria-hidden="true" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ===== OUTSTANDING OPENING BALANCE ALERT ===== */}
        <AnimatePresence>
          {openingBalanceSale && openingBalanceSale.balanceDue > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden mb-4 sm:mb-6"
            >
              <div className="p-4 lg:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50/50 shadow-sm">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Action Required</p>
                    <p className="text-sm font-semibold text-gray-900">
                      Customer has an unpaid opening balance of <span className="text-red-600 font-bold">{formatCurrency(openingBalanceSale.balanceDue)}</span>
                    </p>
                  </div>
                </div>
                <Link
                  to={`/sales/${openingBalanceSale._id}`}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)] rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
                >
                   View & Repay
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== STATS ROW ===== */}
        <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatBox
            title="Total Purchases"
            number={customerStats.totalPurchases}
            Icon={ShoppingBag}
            textColor="blue"
            loading={loadingCustomer}
          />
          <StatBox
            title="Total Spent"
            number={customerStats.totalSpent}
            Icon={DollarSign}
            textColor="green"
            loading={loadingCustomer}
          />
          <StatBox
            title="Not Invoiced"
            number={customerStats.notInvoiced}
            Icon={AlertCircle}
            textColor="yellow"
            loading={loadingCustomer}
          />
          <StatBox
            title="Outstanding Dues"
            number={customerStats.outstandingDues}
            Icon={Receipt}
            textColor="red"
            loading={loadingCustomer}
          />
          <StatBox
            title="Credit Balance"
            number={customerStats.creditBalance}
            Icon={Wallet}
            textColor="blue"
            loading={loadingCustomer}
          />
        </div>

        {/* ===== CONTENT SECTIONS ===== */}
        <div className="space-y-4 sm:space-y-6">
          {/* Contact (2/3) + Documents (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Contact & Identity */}
            <CollapsibleCard
              title="Contact & Identity"
              icon={<User className="text-[var(--color-primary)]" />}
              defaultOpen={true}
              ariaLabel="Contact & Identity Section"
              className="lg:col-span-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DataField
                  label="Company Name"
                  value={customerData?.companyName}
                  icon={Building}
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
                  value={canViewSensitive ? customerData?.phone : (customerData?.phone ? "***-****" : "")}
                  icon={Phone}
                  type={canViewSensitive ? "tel" : "text"}
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
                    value={canViewSensitive ? customerData?.billingAddress : (customerData?.billingAddress ? "Restricted View" : "")}
                    icon={MapPin}
                    loading={loadingCustomer}
                  />
                </div>
              </div>
            </CollapsibleCard>

            {/* Documents & Note — 1/3 width sidebar */}
            <CollapsibleCard
              title="Documents & Note"
              icon={<FileText className="text-[var(--color-primary)]" />}
              defaultOpen={false}
              ariaLabel="Documents & Note Section"
            >
              <div className="space-y-3">
                {customerData?.documents?.length > 0 && (
                  <div className="space-y-3">
                    {customerData?.documents?.map((doc) => (
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
                {customerData?.customerNote && (
                  <div className="border-t border-gray-200 pt-3">
                    <DataField
                      label="Customer Note"
                      value={customerData?.customerNote}
                      icon={FileText}
                      loading={loadingCustomer}
                    />
                  </div>
                )}
                {!customerData?.customerNote &&
                  customerData?.documents?.length === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center">
                      No documents or notes available.
                    </p>
                  )}
              </div>
            </CollapsibleCard>
          </div>

          {/* Wallet & Credit — full width */}
          <CollapsibleCard
            title="Wallet & Credit"
            icon={<Wallet className="text-[var(--color-primary)]" />}
            defaultOpen={true}
            ariaLabel="Wallet & Credit Section"
          >
            <div className="space-y-4">
              <div className="flex flex-row justify-between items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Available Credit
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-primary)] mt-1">
                    {loadingCustomer ? (
                      <ValueSkeleton width="w-20" height="h-7" />
                    ) : (
                      customerStats.creditBalance
                    )}
                  </p>
                </div>
                {hasPermission("CUSTOMER_UPDATE") && (
                  <Button
                    onClick={() => setIsAddCreditModalOpen(true)}
                    variant="primary"
                    size="sm"
                  >
                    Add Credit
                  </Button>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  History
                </h4>
                <CreditHistoryTable customerId={id} />
              </div>
            </div>
          </CollapsibleCard>

          {/* ===== RECENT PURCHASES (Full Width) ===== */}
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
                        {Array.from({ length: 6 }).map((_, i) => (
                          <th key={i} className="px-4 py-3 text-left">
                            <ValueSkeleton width="w-16" height="h-4" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
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
                  <div className="overflow-x-auto">
                    <table className="min-w-[650px] w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sale ID / Description
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Due Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.slice(0, 10).map((sale) => (
                          <tr
                            key={sale._id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => hasPermission("SALE_VIEW_DETAILS") && navigate(`/sales/${sale._id}`)}
                            onMouseEnter={() => hasPermission("SALE_VIEW_DETAILS") && prefetchSale(sale._id)}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(sale.saleDate)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {sale.saleId?.startsWith("OPEN-BAL-") ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">Opening Balance</span>
                                  <span className="px-2 py-0.5 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-full">
                                    Automated
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{sale.saleId || "N/A"}</span>
                                  <span className="text-xs text-gray-500">
                                    {sale.items?.length > 1 ? `${sale.items.length} Items` : (sale.items?.[0]?.product?.name || sale.product?.name || "")}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                              <span className={getDueAmount(sale) > 0 ? "text-red-600" : "text-green-600"}>
                                {formatCurrency(getDueAmount(sale))}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-[var(--color-primary)]">
                              {formatCurrency(sale.totalAmountToBePaid)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <StatusBadge status={sale.invoiceStatus} size="sm" />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <StatusBadge status={sale.paymentStatus} size="sm" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* View All Button */}
                  {salesData.length > 0 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 text-center rounded-b-lg">
                      <Link
                        to={`/customer-details/${id}/sales`}
                        className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors inline-flex items-center"
                      >
                        View All Purchases
                        <span className="ml-1">→</span>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </CollapsibleCard>
          </div>

          {hasPermission("AUDIT_VIEW") && (
            <EntityAuditLog moduleId={id} moduleName="Customer" />
          )}
        </div>
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
      <AddCreditModal
        isOpen={isAddCreditModalOpen}
        onClose={() => setIsAddCreditModalOpen(false)}
        customerId={id}
      />
    </motion.div>
  );
};

CustomerDetails.propTypes = {
  id: PropTypes.string,
};

export default memo(CustomerDetails);
