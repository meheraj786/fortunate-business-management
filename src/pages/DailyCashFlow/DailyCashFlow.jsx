import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback,
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
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { UrlContext } from "../../context/UrlContext";
import CashFlowDetails from "./CashFlowDetails";
import FormDialog from "../../components/common/FormDialog";
import InputField from "../../components/forms/InputField";
import SelectField from "../../components/forms/SelectField";
import TextAreaField from "../../components/forms/TextAreaField";

// Constants
const DROPDOWN_MENU = [
  "sales",
  "transport",
  "commission",
  "utilities",
  "office",
  "lc",
  "others",
];

const ITEMS_PER_PAGE = 10;

// Initial state for new transaction
const INITIAL_TRANSACTION_STATE = {
  amount: "",
  category: "",
  description: "",
  paymentMethod: "cash",
  lcId: "",
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
  User: Users,
  Sale: DollarSign,
  "Office Expense": Building,
  Transportation: Truck,
};

const DailyCashFlow = () => {
  // State
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { baseUrl } = useContext(UrlContext);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionType, setTransactionType] = useState("income");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeLc, setActiveLc] = useState([]);
  const [newTransaction, setNewTransaction] = useState(
    INITIAL_TRANSACTION_STATE
  );

  // Data extraction with fallbacks
  const {
    openingBalance = 0,
    totalIncome = 0,
    totalExpense = 0,
    runningBalance = 0,
    isClosed = false,
    transactions = [],
  } = dailyData || {};

  // Fetch active LC data
  useEffect(() => {
    const fetchActiveLc = async () => {
      try {
        const response = await axios.get(`${baseUrl}lc/get-all-lc`);
        if (Array.isArray(response.data.data)) {
          setActiveLc(response.data.data);
        } else {
          setActiveLc([]);
        }
      } catch (error) {
        console.error("Failed to fetch LC data:", error);
        setActiveLc([]);
      }
    };

    if (baseUrl) {
      fetchActiveLc();
    }
  }, [baseUrl]);

  // Fetch daily cash data
  const fetchDailyCash = useCallback(async () => {
    if (!baseUrl || !selectedDate) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseUrl}cash/get-cash`, {
        params: { date: selectedDate },
      });
      if (response.data.data) {
        setDailyData(response.data.data);
      } else {
        setDailyData(null);
        setError(response.data.message || "Cash for this day is not open.");
      }
    } catch (err) {
      setDailyData(null);
      if (err.response && err.response.status === 404) {
        setError("Cash for this day has not been opened yet.");
      } else if (err.response && err.response.status === 400) {
        setError("Invalid date or request format.");
      } else {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching data. Please try again."
        );
      }
      console.error("Fetch daily cash error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, baseUrl]);

  // Fetch data when selectedDate changes
  useEffect(() => {
    fetchDailyCash();
  }, [fetchDailyCash]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    let filtered = [...transactions];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(term) ||
          transaction.category?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.category === categoryFilter
      );
    }

    return filtered;
  }, [transactions, searchTerm, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    const allCategories = transactions.map((t) => t.category).filter(Boolean);
    return [...new Set(allCategories)].sort();
  }, [transactions]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Event handlers
  const handleNewTransactionChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

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

    const endpoint = transactionType === "income" ? "income" : "expense";
    const toastId = toast.loading(`Adding ${transactionType}...`);
    setIsSubmitting(true);

    const payload = {
      date: selectedDate,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      description: newTransaction.description || "",
      paymentMethod: newTransaction.paymentMethod,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    // Add LC ID if applicable
    if (newTransaction.category === "lc" && newTransaction.lcId) {
      payload.lcId = newTransaction.lcId;
    }

    try {
      let response;
      if (
        transactionType === "expense" &&
        newTransaction.category === "lc" &&
        newTransaction.lcId
      ) {
        response = await axios.post(
          `${baseUrl}lc/add-lc-expense/${newTransaction.lcId}`,
          payload
        );
      } else {
        response = await axios.post(`${baseUrl}cash/${endpoint}`, payload);
      }

      toast.success(
        `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} added successfully!`,
        { id: toastId, duration: 3000 }
      );
      setShowAddTransaction(false);
      setNewTransaction(INITIAL_TRANSACTION_STATE);
      fetchDailyCash();
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to add ${transactionType}.`;
      toast.error(errorMessage, { id: toastId, duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTransaction = (type) => {
    setTransactionType(type);
    setNewTransaction(INITIAL_TRANSACTION_STATE);
    setShowAddTransaction(true);
  };

  const handleOpenDay = async () => {
    const toastId = toast.loading("Opening cash for the day...");
    try {
      await axios.post(`${baseUrl}cash/open`, { date: selectedDate });
      toast.success("Cash opened successfully!", { id: toastId, duration: 3000 });
      fetchDailyCash();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to open cash.";
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
        await axios.post(`${baseUrl}cash/close`, { date: selectedDate });
        toast.success("Cash closed successfully!", { id: toastId, duration: 3000 });
        fetchDailyCash();
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to close cash.";
        toast.error(errorMessage, { id: toastId, duration: 4000 });
      }
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
    setSearchTerm("");
    setCategoryFilter("all");
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

    if (error && !dailyData) {
      return (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-lg font-semibold text-yellow-800 mb-4">{error}</p>
          <button
            onClick={handleOpenDay}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Open Cash for This Day
          </button>
        </div>
      );
    }

    return (
      <>
        <div
          className={`p-4 rounded-lg text-center mb-6 border ${
            isClosed
              ? "bg-gray-100 text-gray-800 border-gray-300"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          <p className="font-semibold text-sm">
            {isClosed
              ? "📋 This day's account is closed"
              : "✅ This day's account is active"}
          </p>
        </div>

        <CashFlowDetails
          openingBalance={openingBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpense}
          runningBalance={runningBalance}
          transactions={paginatedTransactions}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          iconComponents={ICON_COMPONENTS}
          categories={categories}
          filteredTransactions={filteredTransactions}
        />
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
                disabled={isClosed}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Income
              </button>
              
              <button
                onClick={() => handleAddTransaction("expense")}
                disabled={isClosed}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
              
              <button
                onClick={handleCloseDay}
                disabled={isClosed}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm ${
                  isClosed
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <Target className="w-4 h-4" />
                {isClosed ? "Day Closed" : "Close Day"}
              </button>
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
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
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
                max={new Date().toISOString().split("T")[0]}
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
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[180px]"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
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
        isPrimaryButtonDisabled={isSubmitting}
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
          
          {transactionType === "income" ? (
            <InputField
              label="Category"
              name="category"
              value={newTransaction.category}
              onChange={handleNewTransactionChange}
              placeholder="e.g., Sale, Commission"
              required
            />
          ) : (
            <SelectField
              label="Category"
              name="category"
              value={newTransaction.category}
              onChange={handleNewTransactionChange}
              options={DROPDOWN_MENU.map((item) => ({
                value: item,
                label: item.charAt(0).toUpperCase() + item.slice(1),
              }))}
              required
              placeholder="Select category"
            />
          )}
          
          {newTransaction.category === "lc" && (
            <SelectField
              label="Select LC"
              name="lcId"
              value={newTransaction.lcId}
              onChange={handleNewTransactionChange}
              options={activeLc.map((lc) => ({
                value: lc._id,
                label: lc.basicInfo?.lcNumber || `LC ${lc._id?.slice(-6)}`,
              }))}
              required={newTransaction.category === "lc"}
              placeholder="Select an LC"
            />
          )}
          
          <TextAreaField
            label="Description"
            name="description"
            value={newTransaction.description}
            onChange={handleNewTransactionChange}
            placeholder="Enter description (optional)"
            rows="3"
          />
          
          <SelectField
            label="Payment Method"
            name="paymentMethod"
            value={newTransaction.paymentMethod}
            onChange={handleNewTransactionChange}
            options={[
              { value: "cash", label: "💵 Cash" },
              { value: "bank", label: "🏦 Bank Transfer" },
              { value: "mobile-banking", label: "📱 Mobile Banking" },
            ]}
            required
          />
        </div>
      </FormDialog>
    </div>
  );
};

export default DailyCashFlow;