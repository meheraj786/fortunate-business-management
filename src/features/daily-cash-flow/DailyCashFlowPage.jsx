import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Calendar, Plus, Wallet, TrendingDown, TrendingUp, DollarSign, Target, X, Search, Filter, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import api from "@/services/apiService";
import toast from "react-hot-toast";

import CashFlowDetails from "./CashFlowDetails";
import AddTransactionDialog from "./components/AddTransactionDialog";
import TransactionDetailsModal from "@/components/common/TransactionDetailsModal";
import useAccounts from "@/api/hooks/useAccounts";
import { ICON_COMPONENTS, INCOME_CATEGORIES, EXPENSE_CATEGORIES, ITEMS_PER_PAGE } from "./constants";


const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DailyCashFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialDate = () => {
    const params = new URLSearchParams(location.search);
    const dateFromUrl = params.get("date");
    if (dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)) {
      const d = new Date(dateFromUrl);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!isNaN(d.getTime()) && d <= today) {
        return dateFromUrl;
      }
    }
    return getLocalDateString(new Date());
  };

  // State
  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  const [dailyCashSummary, setDailyCashSummary] = useState(null);
  const [dailyCashStatus, setDailyCashStatus] = useState(null); // 'Open', 'Closed', 'Not Opened Yet'
  const [loading, setLoading] = useState(true);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState("income"); // 'income' or 'expense'
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { accounts, loading: accountsLoading, fetchAccounts } = useAccounts();
  const [activeLc, setActiveLc] = useState([]);
  const [activeSales, setActiveSales] = useState([]);

  const [showTransactionDetailsModal, setShowTransactionDetailsModal] =
    useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  const statusBanner = useMemo(() => {
    const isToday = selectedDate === getLocalDateString(new Date());
    if (dailyCashStatus === "Closed") {
      return (
        <div className="p-4 rounded-lg text-center mb-6 border bg-gray-100 text-gray-800 border-gray-300">
          <p className="font-semibold text-sm">
            📋 This day's account is closed
          </p>
        </div>
      );
    }
    if (dailyCashStatus === "Open" && isToday) {
      return (
        <div className="p-4 rounded-lg text-center mb-6 border bg-blue-50 text-blue-800 border-blue-200">
          <p className="font-semibold text-sm">
            ✅ This day's account is active
          </p>
        </div>
      );
    }
    if (dailyCashStatus === "Open" && !isToday) {
      return (
        <div className="p-4 rounded-lg text-center mb-6 border bg-yellow-50 text-yellow-800 border-yellow-300">
          <p className="font-semibold text-sm">
            ❗ This past day's account was not closed
          </p>
        </div>
      );
    }
    return null;
  }, [dailyCashStatus, selectedDate]);

  // Memoized filtered transactions for display
  const transactions = useMemo(() => {
    return dailyCashSummary?.transactions || [];
  }, [dailyCashSummary]);

  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];

    let filtered = [...transactions];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(term) ||
          transaction.category?.toLowerCase().includes(term) ||
          transaction.name?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.category === categoryFilter
      );
    }
    return filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [transactions, searchTerm, categoryFilter]);

  // Get unique categories for filter dropdown
  const allCategories = useMemo(() => {
    const incomeCats = INCOME_CATEGORIES.map(cat => ({ value: cat, label: cat }));
    const expenseCats = EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat }));
    const uniqueCategories = [...new Set([...incomeCats.map(c => c.value), ...expenseCats.map(c => c.value)])];
    return uniqueCategories.sort().map(cat => ({ value: cat, label: cat }));
  }, []);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  );
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Fetch daily cash status
  const fetchDailyCashStatus = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const response = await api.get(`/cash/status`, {
        params: { date: selectedDate },
      });
      setDailyCashStatus(response.data.data.status);
    } catch (err) {
      console.error("Failed to fetch daily cash status:", err);
      setDailyCashStatus("Error");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch daily cash summary
  const fetchDailyCashSummary = useCallback(async () => {
    if (!selectedDate || (dailyCashStatus !== "Open" && dailyCashStatus !== "Closed")) return; // Only fetch summary if cash is open or closed
    setLoading(true);
    try {
      const response = await api.get(`/cash/summary`, {
        params: { date: selectedDate },
      });
      setDailyCashSummary(response.data.data);
    } catch (err) {
      console.error("Failed to fetch daily cash summary:", err);
      setDailyCashSummary(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, dailyCashStatus]);
  
  // Fetch active LCs and Sales for dropdowns
  const fetchReferences = useCallback(async () => {
    if (!showAddTransaction) return;
    try {
      const [lcRes, salesRes] = await Promise.all([
        api.get(`/lc/get-all-lc?status=Active`),
        api.get(`/sales/get-all-sales?status=Invoiced&paymentStatus=Due%20payment`),
      ]);
      setActiveLc(lcRes.data.data || []);
      setActiveSales(salesRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch references:", error);
      toast.error("Failed to load LCs or Sales for transaction linking.");
    }
  }, [showAddTransaction]);


  useEffect(() => {
    fetchDailyCashStatus();
    fetchAccounts(); // Fetch accounts once
  }, [selectedDate, fetchDailyCashStatus, fetchAccounts]);

  useEffect(() => {
    fetchDailyCashSummary();
  }, [dailyCashStatus, fetchDailyCashSummary]); // Re-fetch summary if status changes

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences, showAddTransaction]);

  useEffect(() => {
    navigate(`?date=${selectedDate}`, { replace: true });
  }, [selectedDate, navigate]);

  const handleAddTransaction = (type) => {
    setTransactionType(type);
    setShowAddTransaction(true);
  };

  const handleOpenDay = async () => {
    const toastId = toast.loading("Opening cash for the day...");
    try {
      const response = await api.post(`/cash/open`, { date: selectedDate });
      toast.success(response.data.message || "Cash opened successfully!", {
        id: toastId,
        duration: 3000,
      });
      fetchDailyCashStatus(); // Refresh status
      fetchDailyCashSummary(); // Fetch summary as it's now open
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to open cash.";
      toast.error(errorMessage, { id: toastId, duration: 4000 });
    }
  };

  const handleCloseDay = async () => {
    if (
      window.confirm(
        "Are you sure you want to close the cash for the day? This cannot be undone."
      )
    ) {
      const toastId = toast.loading("Closing cash for the day...");
      try {
        const response = await api.post(`/cash/close`, { date: selectedDate });
        toast.success(response.data.message || "Cash closed successfully!", {
          id: toastId,
          duration: 3000,
        });
        fetchDailyCashStatus(); // Refresh status
        fetchDailyCashSummary(); // Fetch summary again, status might change
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to close cash.";
        toast.error(errorMessage, { id: toastId, duration: 4000 });
      }
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
    setSearchTerm("");
    setCategoryFilter("all");
    setDailyCashSummary(null); // Clear summary when date changes
    setDailyCashStatus(null); // Clear status when date changes
  };

  const handleTransactionClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowTransactionDetailsModal(true);
  };

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (dailyCashStatus === "Error") {
        return (
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
                <p className="text-lg font-semibold text-red-800 mb-4">
                    Error loading daily cash flow. Please try again.
                </p>
            </div>
        );
    }

    if (dailyCashStatus === "Not Opened Yet") {
      return (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-lg font-semibold text-yellow-800 mb-4">
            Cash for {selectedDate} is not opened yet.
          </p>
        </div>
      );
    }

    if ((dailyCashStatus === "Open" || dailyCashStatus === "Closed") && !dailyCashSummary) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Loading daily summary...</span>
        </div>
      );
    }

    return (
      <>
        {statusBanner}

        {dailyCashSummary && (
          <CashFlowDetails
            openingBalance={dailyCashSummary.openingBalance}
            totalIncome={dailyCashSummary.totalIncome}
            totalExpenses={dailyCashSummary.totalExpenses}
            runningBalance={dailyCashSummary.runningBalance}
            transactions={paginatedTransactions}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            iconComponents={ICON_COMPONENTS}
            filteredTransactions={filteredTransactions}
            onTransactionClick={handleTransactionClick}
          />
        )}
      </>
    );
  };

  return (
    <div className="">
      <div className="">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Daily Cash Flow
              </h1>
              <p className="text-gray-600">
                Track daily cash flow and business expenses in real-time
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Mobile Filters Button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                <Menu className="w-4 h-4" />
                Filters
              </button>

              {/* Action Buttons */}
              <button
                onClick={() => handleAddTransaction("income")}
                disabled={dailyCashStatus !== "Open"}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Income
              </button>

              <button
                onClick={() => handleAddTransaction("expense")}
                disabled={dailyCashStatus !== "Open"}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>

              {dailyCashStatus === "Open" ? (
                <button
                  onClick={handleCloseDay}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm bg-blue-500 text-white hover:bg-blue-600`}
                >
                  <Target className="w-4 h-4" />
                  Close Day
                </button>
              ) : (dailyCashStatus === "Closed" || dailyCashStatus === "Not Opened Yet") && (
                <button
                  onClick={handleOpenDay}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm bg-green-500 text-white hover:bg-green-600`}
                >
                  <Target className="w-4 h-4" />
                  Open Day
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto animate-slide-up">
              <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                <h3 className="font-semibold text-lg">Filter Transactions</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Search Transactions
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by description or category..."
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Filter by Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  >
                    <option value="all">All Categories</option>
                    {allCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                  }}
                  className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 font-medium text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date Selection Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Select Date
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  View cash flow for any specific day
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-md">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                max={getLocalDateString(new Date())}
              />
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              {new Date(selectedDate).toDateString() ===
              new Date().toDateString()
                ? "📅 Today's Account"
                : `📅 Account for ${new Date(
                    selectedDate
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`}
            </div>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Category:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[180px]"
              >
                <option value="all">All Categories</option>
                {allCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              {(searchTerm || categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {renderContent()}
      </div>

      {showAddTransaction && (
        <AddTransactionDialog
          open={showAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          onSuccess={() => {
            setShowAddTransaction(false);
            fetchDailyCashSummary();
          }}
          transactionType={transactionType}
          accounts={accounts}
          accountsLoading={accountsLoading}
          activeLc={activeLc}
          activeSales={activeSales}
          selectedDate={selectedDate}
        />
      )}

      {selectedTransactionId && (
        <TransactionDetailsModal
          isOpen={showTransactionDetailsModal}
          onClose={() => setShowTransactionDetailsModal(false)}
          transactionId={selectedTransactionId}
        />
      )}
    </div>
  );
};

export default DailyCashFlow;