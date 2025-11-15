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
import { Label, Select } from "@headlessui/react";

const DailyCashFlow = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { baseUrl } = useContext(UrlContext);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState("income");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const dropdownMenu = [
    "sales",
    "transport",
    "commission",
    "utilities",
    "office",
    "lc",
    "others",
  ];

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
      } else {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching data."
        );
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, baseUrl]);

  useEffect(() => {
    fetchDailyCash();
  }, [fetchDailyCash]);

  const {
    openingBalance,
    totalIncome,
    totalExpense,
    runningBalance,
    isClosed,
    transactions,
  } = dailyData || {
    openingBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    runningBalance: 0,
    isClosed: false,
    transactions: [],
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.category === categoryFilter
      );
    }

    return filtered;
  }, [transactions, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    if (!transactions) return [];
    const allCategories = transactions.map((t) => t.category);
    return [...new Set(allCategories)];
  }, [transactions]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    category: "",
    description: "",
    paymentMethod: "cash",
  });

  const handleAddTransactionSubmit = async (e) => {
    e.preventDefault();
    const endpoint = transactionType === "income" ? "income" : "expense";
    const toastId = toast.loading(`Adding ${transactionType}...`);
    try {
      await axios.post(`${baseUrl}api/cash/${endpoint}`, {
        date: selectedDate,
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        description: newTransaction.description,
        paymentMethod: newTransaction.paymentMethod,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
      toast.success(
        `${
          transactionType.charAt(0).toUpperCase() + transactionType.slice(1)
        } added successfully!`,
        { id: toastId }
      );
      setShowAddTransaction(false);
      setNewTransaction({ amount: "", category: "", description: "" });
      fetchDailyCash();
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to add ${transactionType}.`,
        { id: toastId }
      );
    }
  };

  const handleAddTransaction = (type) => {
    setTransactionType(type);
    setShowAddTransaction(true);
  };

  const handleOpenDay = async () => {
    const toastId = toast.loading("Opening cash for the day...");
    try {
      await axios.post(`${baseUrl}cash/open`, { date: selectedDate });
      toast.success("Cash opened successfully!", { id: toastId });
      fetchDailyCash();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to open cash.", {
        id: toastId,
      });
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
        toast.success("Cash closed successfully!", { id: toastId });
        fetchDailyCash();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to close cash.", {
          id: toastId,
        });
      }
    }
  };

  const iconComponents = {
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
        </div>
      );
    }

    if (error && !dailyData) {
      return (
        <div className="text-center p-8 bg-yellow-50 rounded-lg">
          <p className="text-lg font-semibold text-yellow-800 mb-4">{error}</p>
          <button
            onClick={handleOpenDay}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Cash for Today
          </button>
        </div>
      );
    }

    return (
      <>
        <div
          className={`p-4 rounded-lg text-center mb-4 ${
            isClosed ? "bg-gray-200 text-gray-800" : "bg-blue-100 text-blue-800"
          }`}
        >
          <p className="font-semibold">
            {isClosed
              ? `This day's account is closed.`
              : `This day's account is active.`}
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
          iconComponents={iconComponents}
          categories={categories}
          filteredTransactions={filteredTransactions}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 ">
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Daily Cash Flow
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Track daily cash flow and business expenses
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="sm:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors justify-center text-sm"
              >
                <Menu className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={() => handleAddTransaction("income")}
                disabled={isClosed}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors justify-center text-sm sm:text-base disabled:bg-gray-400"
              >
                <Plus className="w-4 h-4" />
                Add Income
              </button>
              <button
                onClick={() => handleAddTransaction("expense")}
                disabled={isClosed}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors justify-center text-sm sm:text-base disabled:bg-gray-400"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
              <button
                onClick={handleCloseDay}
                disabled={isClosed}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors justify-center text-sm sm:text-base ${
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

        {showMobileFilters && (
          <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-lg w-full max-h-[70vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                <h3 className="font-semibold">Filter Transactions</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Transactions
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search transactions..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-md m-4">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-lg">
                  {transactionType === "income" ? "Add Income" : "Add Expense"}
                </h3>
                <button
                  onClick={() => setShowAddTransaction(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={handleAddTransactionSubmit}
                className="p-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      })
                    }
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTransaction.category}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        category: e.target.value,
                      })
                    }
                    placeholder="e.g., Office Supplies, Transport"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  /> */}

                  <div className="max-w-md">
                    <div className="mb-2 block">
                      {/* <Label htmlFor="countries">Select your country</Label> */}
                    </div>
                    <Select
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          category: e.target.value,
                        })
                      }
                      id="countries"
                      required
                    >
                      {dropdownMenu.map((d) => (
                        <option>{d}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    rows="3"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={newTransaction.paymentMethod}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="mobile-bank">Mobile Banking</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTransaction(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mb-4  sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Select Date:
                </span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-sm text-gray-600">
                {new Date(selectedDate).toDateString() ===
                new Date().toDateString()
                  ? "Today's Account"
                  : `Account for ${new Date(
                      selectedDate
                    ).toLocaleDateString()}`}
              </div>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DailyCashFlow;
