import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { dailyCashFlowData } from "../../data/data";
import CashFlowDetails from "./CashFlowDetails";

const DailyCashFlow = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState("income");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [cashFlowData, setCashFlowData] = useState(dailyCashFlowData);

  const todayData = useMemo(() => {
    return cashFlowData[selectedDate] || {
      openingBalance: 0,
      closingBalance: null,
      isClosed: false,
      transactions: [],
    };
  }, [cashFlowData, selectedDate]);

  const {
    openingBalance,
    isClosed,
    transactions,
  } = todayData;

  const filteredTransactions = useMemo(() => {
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

    return filtered.sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    );
  }, [transactions, searchTerm, categoryFilter]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const runningBalance = openingBalance + totalIncome - totalExpenses;

  const categories = useMemo(() => {
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
    paymentMethod: "Cash",
  });

  const handleAddTransactionSubmit = (e) => {
    e.preventDefault();
    const newId = Math.max(...transactions.map((t) => t.id), 0) + 1;
    const newTransactionData = {
      id: newId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" }),
      type: transactionType,
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
    };

    const updatedData = { ...cashFlowData };
    if (!updatedData[selectedDate]) {
      const yesterday = new Date(selectedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateString = yesterday.toISOString().split("T")[0];
      const yesterdayClosingBalance = cashFlowData[yesterdayDateString]?.closingBalance || 0;

      updatedData[selectedDate] = {
        openingBalance: yesterdayClosingBalance,
        closingBalance: null,
        isClosed: false,
        transactions: [newTransactionData],
      };
    } else {
      updatedData[selectedDate].transactions.push(newTransactionData);
    }

    setCashFlowData(updatedData);
    setShowAddTransaction(false);
    setNewTransaction({
      amount: "",
      category: "",
      description: "",
      paymentMethod: "Cash",
    });
  };
  const handleAddTransaction = (type) => {
    setTransactionType(type);
    setShowAddTransaction(true);
  };

  const handleCloseDay = () => {
    const updatedData = { ...cashFlowData };
    updatedData[selectedDate].isClosed = true;
    updatedData[selectedDate].closingBalance = runningBalance;

    // Create next day's opening balance
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split("T")[0];
    if (!updatedData[tomorrowDateString]) {
      updatedData[tomorrowDateString] = {
        openingBalance: runningBalance,
        closingBalance: null,
        isClosed: false,
        transactions: [],
      };
    } else {
      updatedData[tomorrowDateString].openingBalance = runningBalance;
    }

    setCashFlowData(updatedData);
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
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors justify-center text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Add Income
              </button>
              <button
                onClick={() => handleAddTransaction("expense")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors justify-center text-sm sm:text-base"
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
                {isClosed ? "Closed" : "Close Today"}
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
              <form onSubmit={handleAddTransactionSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTransaction.category}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, category: e.target.value })
                    }
                    placeholder="Enter category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, description: e.target.value })
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
                      setNewTransaction({ ...newTransaction, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option>Cash</option>
                    <option>Bank</option>
                    <option>Card</option>
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

        <div className="mb-4 sm:mb-6">
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

          <div
            className={`p-4 rounded-lg text-center mb-4 ${
              isClosed
                ? "bg-gray-200 text-gray-800"
                : "bg-blue-100 text-blue-800"
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
            totalExpenses={totalExpenses}
            runningBalance={runningBalance}
            transactions={paginatedTransactions}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            iconComponents={iconComponents}
            categories={categories}
            filteredTransactions={filteredTransactions}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyCashFlow;
