import React, { useState, useMemo } from "react";
import {
  Calendar,
  Plus,
  Wallet,
  TrendingDown,
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
import { expensesData } from "../../data/data";
import CashFlowDetails from "./CashFlowDetails";

const DailyCashFlow = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showAddCash, setShowAddCash] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expenseFilter, setExpenseFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [accountData, setAccountData] = useState({
    startingCash: 50000,
    todayStartingCash: 45000,
    isClosed: false,
  });

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
  };

  const expenseCategories = [
    ...new Set(expensesData.map((expense) => expense.category)),
  ];

  const filteredExpenses = useMemo(() => {
    let filtered = expensesData.filter((expense) => {
      const expenseDate = new Date(expense.date).toDateString();
      const selectedDateObj = new Date(selectedDate).toDateString();
      return expenseDate === selectedDateObj;
    });

    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (expenseFilter !== "all") {
      filtered = filtered.filter(
        (expense) => expense.category === expenseFilter
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)
    );
  }, [expensesData, selectedDate, searchTerm, expenseFilter]);

  const totalExpensesToday = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const remainingCash = accountData.todayStartingCash - totalExpensesToday;
  const totalExpensesAll = expensesData.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 ">
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Accounts Management
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
                onClick={() => setShowAddCash(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors justify-center text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Add Cash
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors justify-center text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
              <button
                disabled={accountData.isClosed}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors justify-center text-sm sm:text-base ${
                  accountData.isClosed
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <Target className="w-4 h-4" />
                {accountData.isClosed ? "Closed" : "Close Today"}
              </button>
            </div>
          </div>
        </div>

        {showMobileFilters && (
          <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-lg w-full max-h-[70vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                <h3 className="font-semibold">Filter Expenses</h3>
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
                    Search Expenses
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search expenses..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={expenseFilter}
                    onChange={(e) => setExpenseFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Categories</option>
                    {expenseCategories.map((category) => (
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
              accountData.isClosed
                ? "bg-gray-200 text-gray-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            <p className="font-semibold">
              {accountData.isClosed
                ? `This day's account is closed.`
                : `This day's account is active.`}
            </p>
          </div>

          <CashFlowDetails
            accountData={accountData}
            totalExpensesToday={totalExpensesToday}
            filteredExpenses={filteredExpenses}
            remainingCash={remainingCash}
            paginatedExpenses={paginatedExpenses}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            iconComponents={iconComponents}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyCashFlow;