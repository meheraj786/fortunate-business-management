import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { DollarSign, Receipt } from "lucide-react";
import { useSalesByCustomer } from "@/api/hooks/sales";
import { useCustomer } from "@/api/hooks/customer";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/hooks/useAuth";

import Pagination from "@/components/ui/Pagination";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import SearchBar from "@/components/ui/SearchBar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";

const CustomerSalesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useSettings();
  const { hasPermission } = useAuth();

  // Filters State
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [invoiceFilter, setInvoiceFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Customer Data for Header
  const { data: customerRes, isLoading: loadingCustomer } = useCustomer(id);
  const customerData = customerRes?.data;

  // Computed Query Parameters
  const queryParams = {
    page,
    limit: 15,
  };
  if (searchTerm) queryParams.search = searchTerm;
  if (paymentFilter !== "All") queryParams.paymentStatus = paymentFilter;
  if (invoiceFilter !== "All") queryParams.invoiceStatus = invoiceFilter;
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;

  // React Query Fetch
  const { data, isLoading: loadingSales, isFetching } = useSalesByCustomer(id, queryParams);

  const sales = data?.data?.sales || [];
  const totalItems = data?.data?.totalItems || 0;
  const totalPages = data?.data?.totalPages || 0;

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, paymentFilter, invoiceFilter, startDate, endDate]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setPaymentFilter("All");
    setInvoiceFilter("All");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const breadcrumbItems = [
    { label: "Customers", path: "/customers" },
    { label: customerData?.name || "Customer Profile", path: `/customer-details/${id}` },
    { label: "Purchase History" },
  ];

  // Helper to get due amount
  const getDueAmount = (sale) => {
    if (sale.balanceDue != null) return sale.balanceDue;
    const totalPaid = sale.payments?.filter(p => !p.isReversed).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    return Math.round(((sale.totalAmountToBePaid || 0) - totalPaid) * 100) / 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto"
    >
      <Breadcrumb items={breadcrumbItems} />

      {/* ===== HEADER ===== */}
      <motion.div
        className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center flex-1 min-w-0">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <DollarSign className="text-green-600 w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Purchase History
              </h1>
              {loadingCustomer ? (
                <ValueSkeleton width="w-32" height="h-4" className="mt-1" />
              ) : (
                <p className="text-sm text-gray-500 truncate">
                  Complete sales ledger for {customerData?.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== FILTER TOOLBAR ===== */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4 sm:mb-6 flex flex-col lg:flex-row gap-4 flex-wrap">
        <div className="flex-1 w-full lg:max-w-md min-w-[200px]">
           <SearchBar 
             onSearch={setSearchTerm} 
             placeholder="Search by Invoice / Sale ID..." 
           />
        </div>

        <div className="w-full sm:w-40 lg:w-48">
           <Dropdown
             value={paymentFilter}
             onChange={setPaymentFilter}
             options={[
               { label: "All Payments", value: "All" },
               { label: "Paid", value: "Paid payment" },
               { label: "Due", value: "Due payment" },
               { label: "Partial", value: "Partial" },
             ]}
             className="w-full"
           />
        </div>

        <div className="w-full sm:w-40 lg:w-48">
           <Dropdown
             value={invoiceFilter}
             onChange={setInvoiceFilter}
             options={[
               { label: "All Invoices", value: "All" },
               { label: "Invoiced", value: "Invoiced" },
               { label: "Pending", value: "Not-invoiced" },
             ]}
             className="w-full"
           />
        </div>

        <div className="flex gap-3 flex-1 lg:flex-none">
            <input
               type="date"
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
               className="block w-1/2 lg:w-auto px-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm transition-shadow"
            />
            <input
               type="date"
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
               min={startDate}
               className="block w-1/2 lg:w-auto px-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm transition-shadow"
            />
        </div>
        
        <div className="flex items-center lg:flex-1 justify-end w-full lg:w-auto min-w-fit">
           {(searchTerm || paymentFilter !== "All" || invoiceFilter !== "All" || startDate || endDate) && (
              <Button
                onClick={handleClearFilters}
                variant="secondary"
                size="sm"
                className="w-full lg:w-auto"
              >
                Clear Filters
              </Button>
           )}
        </div>
      </div>

      {/* ===== HISTORY TABLE ===== */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden pb-1">
         <div className="overflow-x-auto min-h-[400px]">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                     <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale ID / Description</th>
                     <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Due Amount</th>
                     <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                     <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                     <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 bg-white relative">
                  {loadingSales ? (
                     [...Array(6)].map((_, i) => (
                       <tr key={i}>
                         <td colSpan="6" className="px-5 py-4"><ValueSkeleton width="100%" height="h-6" /></td>
                       </tr>
                     ))
                  ) : sales.length === 0 ? (
                     <tr>
                        <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                           <div className="flex flex-col items-center justify-center">
                              <Receipt className="w-10 h-10 text-gray-300 mb-3" />
                              <p className="text-sm font-medium text-gray-900">No purchases found</p>
                              <p className="text-xs mt-1">Adjust filters to find historical records.</p>
                           </div>
                        </td>
                     </tr>
                  ) : (
                     sales.map((sale) => (
                       <tr 
                          key={sale._id} 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => hasPermission("SALE_VIEW_DETAILS") && navigate(`/sales/${sale._id}`)}
                        >
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">
                             {formatDate(sale.saleDate)}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm">
                             {sale.saleId?.startsWith("OPEN-BAL-") ? (
                               <div className="flex items-center gap-2">
                                 <span className="font-medium text-gray-900">Opening Balance</span>
                                 <span className="px-2 py-0.5 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-full">Automated</span>
                               </div>
                             ) : (
                               <div className="flex flex-col">
                                 <span className="font-medium text-gray-900 text-sm">{sale.saleId || "N/A"}</span>
                                 <span className="text-xs text-gray-500 mt-0.5">
                                   {sale.items?.length > 1 ? `${sale.items.length} Items` : (sale.items?.[0]?._itemProducts?.[0]?.name || sale.product?.name || "")}
                                 </span>
                               </div>
                             )}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-right font-medium">
                             <span className={getDueAmount(sale) > 0 ? "text-red-600 font-bold" : "text-green-600"}>
                               {formatCurrency(getDueAmount(sale))}
                             </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-bold text-[var(--color-primary)]">
                             {formatCurrency(sale.totalAmountToBePaid)}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-center">
                             <StatusBadge status={sale.invoiceStatus} size="sm" />
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-center">
                             <StatusBadge status={sale.paymentStatus} size="sm" />
                          </td>
                       </tr>
                     ))
                  )}
                  {isFetching && !loadingSales && (
                     <tr className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
                        <td></td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
               <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  isLoading={isFetching}
                  totalItems={totalItems}
               />
            </div>
         )}
      </div>
    </motion.div>
  );
};

export default CustomerSalesPage;
