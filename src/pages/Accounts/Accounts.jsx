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

const Accounts = () => {
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

  const StatCard = ({
    title,
    amount,
    icon: Icon,
    color = "blue",
    subtitle,
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-lg sm:text-2xl font-bold mt-1 text-${color}-600`}>
            ৳{amount?.toLocaleString()}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 sm:p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ExpenseCard = ({ expense }) => {
    const IconComponent = iconComponents[expense.icon] || Receipt;

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-red-500">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-red-100 rounded-full">
              <IconComponent className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {expense.description}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {expense.category} • {expense.time}
              </p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                {expense.paymentMethod}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-red-600">
              ৳{expense.amount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <StatCard
              title="Starting Cash"
              amount={accountData.todayStartingCash}
              icon={Wallet}
              color="green"
              subtitle="Business opening amount"
            />
            <StatCard
              title="Total Expenses"
              amount={totalExpensesToday}
              icon={TrendingDown}
              color="red"
              subtitle={`${filteredExpenses.length} transactions`}
            />
            <StatCard
              title="Remaining Cash"
              amount={remainingCash}
              icon={DollarSign}
              color={remainingCash >= 0 ? "green" : "red"}
              subtitle="Available balance"
            />
            <StatCard
              title="Status"
              amount={accountData.isClosed ? "Closed" : "Active"}
              icon={Target}
              color={accountData.isClosed ? "gray" : "blue"}
              subtitle="Account status"
            />
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

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Expense Records
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Showing {paginatedExpenses.length} of{" "}
                  {filteredExpenses.length} expenses
                </p>
              </div>

              {/* Desktop Filters */}
              <div className="hidden sm:flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search expenses..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                  />
                </div>
                <select
                  value={expenseFilter}
                  onChange={(e) => setExpenseFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Categories</option>
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:hidden space-y-3 p-4">
            {paginatedExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedExpenses.map((expense) => {
                  const IconComponent = iconComponents[expense.icon] || Receipt;
                  return (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900">
                            {expense.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {expense.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {expense.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        ৳{expense.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500">
                <Receipt className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">
                  No expenses found for this date
                </p>
                <p className="text-xs sm:text-sm">
                  Try selecting a different date or adjusting filters
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounts;
