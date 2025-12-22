import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Calendar,
  Plus,
  Wallet,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Target,
  X,
  Search,
  Filter,
  Menu,
  ChevronLeft,
  ChevronRight,
  Car,
  Truck,
  Users,
  Fuel,
  Wrench,
  Coffee,
  Building,
  CreditCard,
  Receipt,
  PiggyBank,
  Loader2,
  Package,
} from "lucide-react";
import api from "@/services/apiService";
import toast from "react-hot-toast";

import CashFlowDetails from "./CashFlowDetails";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import TransactionDetailsModal from "./TransactionDetailsModal"; // New component for details

// Custom hook for account fetching
const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/account/get-all-accounts");
      if (response.data.success) {
        setAccounts(response.data.data || []);
      } else {
        throw new Error("Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast.error("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { accounts, loading, fetchAccounts };
};

// Constants
const INCOME_CATEGORIES = [
  "LC",
  "Sales",
  "Donation",
  "Commission",
  "Interest",
  "Service Charge",
  "Others",
];
const EXPENSE_CATEGORIES = [
  "LC",
  "Sales",
  "Rent",
  "Salary",
  "Office Expense",
  "Transport",
  "Utility",
  "Others",
];

const ITEMS_PER_PAGE = 10;

// Initial state for new transaction
const INITIAL_TRANSACTION_STATE = {
  name: "", // For income/expense name
  amount: "",
  category: "",
  description: "",
  paymentMethod: "Cash",
  accountId: "",
  lcId: "", // For LC transactions
  salesId: "", // For Sales transactions
  costName: "", // For LC/Sales expense costs
};

// Icon mapping
const ICON_COMPONENTS = {
  Fuel,
  Users,
  Wrench,
  Coffee,
  Building,
  Truck,
  Car,
  CreditCard,
  Receipt,
  PiggyBank,
  Wallet,
  Package, // For LC/Sales
  User: Users,
  Sale: DollarSign,
  "Office Expense": Building,
  Transportation: Truck,
};

const DailyCashFlow = () => {
  // State
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString(new Date())
  );
  const [dailyCashSummary, setDailyCashSummary] = useState(null);
  const [dailyCashStatus, setDailyCashStatus] = useState(null); // 'Open', 'Closed', 'Not Opened Yet'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionType, setTransactionType] = useState("income"); // 'income' or 'expense'
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeLc, setActiveLc] = useState([]); // For LC dropdown
  const [activeSales, setActiveSales] = useState([]); // For Sales dropdown
  const [newTransaction, setNewTransaction] = useState(
    INITIAL_TRANSACTION_STATE
  );
  const { accounts, loading: accountsLoading, fetchAccounts } = useAccounts();

  const [showTransactionDetailsModal, setShowTransactionDetailsModal] =
    useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

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
    setError(null);
    try {
      const response = await api.get(`/cash/status`, {
        params: { date: selectedDate },
      });
      setDailyCashStatus(response.data.data.status);
    } catch (err) {
      console.error("Failed to fetch daily cash status:", err);
      setError("Failed to fetch daily cash status.");
      setDailyCashStatus("Error");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch daily cash summary
  const fetchDailyCashSummary = useCallback(async () => {
    if (!selectedDate || dailyCashStatus !== "Open") return; // Only fetch summary if cash is open
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/cash/summary`, {
        params: { date: selectedDate },
      });
      setDailyCashSummary(response.data.data);
    } catch (err) {
      console.error("Failed to fetch daily cash summary:", err);
      setError("Failed to fetch daily cash summary.");
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
  }, [fetchReferences]);

  // Handle new transaction form changes
  const handleNewTransactionChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => {
      let newState = { ...prev, [name]: value };

      // Reset accountId if payment method changes
      if (name === "paymentMethod") {
        newState.accountId = "";
      }
      // Reset LC/Sales IDs if category changes
      if (name === "category") {
        newState.lcId = "";
        newState.salesId = "";
        newState.costName = ""; // Reset costName for expense
        // Auto-fill description for LC/Sales categories if empty
        if ((value === "LC" || value === "Sales") && !prev.description) {
          newState.description = `Auto-generated description for ${value}`;
        } else if ((prev.category === "LC" || prev.category === "Sales") && prev.description.startsWith("Auto-generated")) {
          // Clear auto-generated description if category changes from LC/Sales
          newState.description = "";
        }
      }
      return newState;
    });
  }, []);


  const handleAddTransactionSubmit = async () => {
    // Validation
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!newTransaction.category) {
      toast.error("Please select a category");
      return;
    }
    if (!newTransaction.name && (newTransaction.category !== "LC" && newTransaction.category !== "Sales")) {
        toast.error("Please enter a name for the transaction");
        return;
    }
    if (!newTransaction.accountId) {
      toast.error("Please select an account");
      return;
    }
    if (newTransaction.category === "LC" && !newTransaction.lcId) {
      toast.error("Please select an LC for this transaction");
      return;
    }
    if (newTransaction.category === "Sales" && !newTransaction.salesId) {
      toast.error("Please select a Sale for this transaction");
      return;
    }
    if (transactionType === "expense" && (newTransaction.category === "LC" || newTransaction.category === "Sales") && !newTransaction.costName) {
        toast.error("Please enter a cost name");
        return;
    }


    const endpoint = transactionType === "income" ? "income" : "expense";
    const toastId = toast.loading(`Adding ${transactionType}...`);
    setIsSubmitting(true);

    const payload = {
      date: selectedDate,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      name: newTransaction.name, // The actual name of the income/expense
      paymentMethod: newTransaction.paymentMethod,
      accountId: newTransaction.accountId,
      description: newTransaction.description || undefined, // Send only if provided
    };

    if (newTransaction.category === "LC") {
      payload.lcId = newTransaction.lcId;
    }
    if (newTransaction.category === "Sales") {
      payload.salesId = newTransaction.salesId;
    }
    if (transactionType === "expense" && (newTransaction.category === "LC" || newTransaction.category === "Sales")) {
        payload.costName = newTransaction.costName;
    }


    try {
      const response = await api.post(`/cash/${endpoint}`, payload);
      toast.success(
        `${
          transactionType.charAt(0).toUpperCase() + transactionType.slice(1)
        } added successfully!`,
        { id: toastId, duration: 3000 }
      );
      setShowAddTransaction(false);
      setNewTransaction(INITIAL_TRANSACTION_STATE);
      fetchDailyCashSummary(); // Refresh summary after transaction
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || `Failed to add ${transactionType}.`;
      toast.error(errorMessage, { id: toastId, duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTransaction = (type) => {
    setTransactionType(type);
    setNewTransaction(INITIAL_TRANSACTION_STATE); // Reset form
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
          <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
          <span className="ml-3 text-gray-600">Loading cash flow data...</span>
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

    if (dailyCashStatus === "Not Opened Yet" || dailyCashStatus === "Closed") {
      return (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-lg font-semibold text-yellow-800 mb-4">
            Cash for {selectedDate} is{" "}
            {dailyCashStatus === "Closed" ? "closed" : "not opened yet"}.
          </p>
          {dailyCashStatus === "Closed" && (
            <p className="text-sm text-gray-600 mt-4">
              You cannot add transactions to a closed day.
            </p>
          )}
        </div>
      );
    }

    if (dailyCashStatus === "Open" && !dailyCashSummary) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
          <span className="ml-3 text-gray-600">Loading daily summary...</span>
        </div>
      );
    }

    return (
      <>
        <div
          className={`p-4 rounded-lg text-center mb-6 border ${
            dailyCashSummary?.isClosed
              ? "bg-gray-100 text-gray-800 border-gray-300"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          <p className="font-semibold text-sm">
            {dailyCashSummary?.isClosed
              ? "📋 This day's account is closed"
              : "✅ This day's account is active"}
          </p>
        </div>

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

  const getFilteredAccounts = useCallback(() => {
    return accounts.filter((acc) => acc.accountType === newTransaction.paymentMethod);
  }, [accounts, newTransaction.paymentMethod]);

  const isDescriptionDisabled = useMemo(() => {
    return (newTransaction.category === "LC" || newTransaction.category === "Sales");
  }, [newTransaction.category]);

  const transactionCategories = transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

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

      {/* Add Transaction Dialog */}
      <FormDialog
        open={showAddTransaction}
        onClose={() => {
          setShowAddTransaction(false);
          setNewTransaction(INITIAL_TRANSACTION_STATE);
        }}
        title={`Add ${transactionType === "income" ? "Income" : "Expense"}`}
        primaryButtonText={isSubmitting ? "Adding..." : "Add Transaction"}
        secondaryButtonText="Cancel"
        onSubmit={handleAddTransactionSubmit}
        isPrimaryButtonDisabled={isSubmitting || accountsLoading}
        size="md"
      >
        <div className="space-y-4">
          <InputField
            label="Amount"
            name="amount"
            type="number"
            value={newTransaction.amount}
            onChange={handleNewTransactionChange}
            placeholder="Enter amount"
            required
            min="0"
            step="0.01"
          />

          <SelectField
            label="Category"
            name="category"
            value={newTransaction.category}
            onChange={handleNewTransactionChange}
            options={transactionCategories.map((item) => ({
                value: item,
                label: item.charAt(0).toUpperCase() + item.slice(1),
            }))}
            required
            placeholder="Select category"
          />

          {newTransaction.category !== "LC" && newTransaction.category !== "Sales" && (
            <InputField
              label={`${transactionType === "income" ? "Income" : "Expense"} Name`}
              name="name"
              value={newTransaction.name}
              onChange={handleNewTransactionChange}
              placeholder={`e.g., ${transactionType === "income" ? "Donation from John" : "Office Rent"}`}
              required
            />
          )}

          {newTransaction.category === "LC" && (
            <SelectField
              label="Select LC"
              name="lcId"
              value={newTransaction.lcId}
              onChange={handleNewTransactionChange}
              options={activeLc.map((lc) => ({
                value: lc._id,
                label: lc.basicInfo?.lcNumber || `LC ${lc._id?.slice(-6)}`,
              }))}
              required
              placeholder="Select an LC"
            />
          )}

          {newTransaction.category === "Sales" && (
            <SelectField
              label="Select Sale"
              name="salesId"
              value={newTransaction.salesId}
              onChange={handleNewTransactionChange}
              options={activeSales.map((sale) => ({
                value: sale._id,
                label: sale.saleId || `Sale ${sale._id?.slice(-6)}`,
              }))}
              required
              placeholder="Select a Sale"
            />
          )}

          {(newTransaction.category === "LC" || newTransaction.category === "Sales") && transactionType === "expense" && (
            <InputField
              label="Cost Name"
              name="costName"
              value={newTransaction.costName}
              onChange={handleNewTransactionChange}
              placeholder="e.g., Transport Cost"
              required
            />
          )}

          <TextAreaField
            label="Description (Auto-generated for LC/Sales)"
            name="description"
            value={newTransaction.description}
            onChange={handleNewTransactionChange}
            placeholder="Enter description (optional)"
            rows="3"
            disabled={isDescriptionDisabled}
          />

          <SelectField
            label="Payment Method"
            name="paymentMethod"
            value={newTransaction.paymentMethod}
            onChange={handleNewTransactionChange}
            options={[
              { value: "Cash", label: "💵 Cash" },
              { value: "Bank", label: "🏦 Bank Transfer" },
              { value: "Mobile Banking", label: "📱 Mobile Banking" },
            ]}
            required
          />
          {(newTransaction.paymentMethod === "Bank" ||
            newTransaction.paymentMethod === "Mobile Banking" ||
            newTransaction.paymentMethod === "Cash") && (
            <SelectField
              label="Select Account"
              name="accountId"
              value={newTransaction.accountId}
              onChange={handleNewTransactionChange}
              options={getFilteredAccounts().map((acc) => ({
                value: acc._id,
                label: `${acc.accountHolderName} - ${
                  acc.accountNumber || acc.mobileNumber || acc.accountName || ""
                }`.trim(),
              }))}
              placeholder="Select an account"
              required
              loading={accountsLoading}
            />
          )}
        </div>
      </FormDialog>

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