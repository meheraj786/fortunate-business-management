import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building,
  Smartphone,
  CreditCard,
  Banknote,
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/transaction/get-all`);
      if (response.data.success) {
        setTransactions(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch transactions.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while fetching transactions.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const paymentMethods = [
    { value: "all", label: "All Methods" },
    { value: "Bank", label: "Bank Transfer" },
    { value: "Mobile Banking", label: "Mobile Banking" },
    { value: "Cash", label: "Cash" },
  ];

  const filteredData = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.account?.accountName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.account?.accountType === paymentMethodFilter
      );
    }

    const currentDate = new Date(selectedDate);
    if (dateFilter === "today") {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === currentDate.toDateString();
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date(currentDate);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= weekAgo && itemDate <= currentDate;
      });
    } else if (dateFilter === "month") {
      const monthAgo = new Date(currentDate);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= monthAgo && itemDate <= currentDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchTerm, paymentMethodFilter, dateFilter, selectedDate]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPaymentMethodColor = (method) => {
    const colors = {
      bank: "bg-blue-100 text-blue-800",
      bkash: "bg-pink-100 text-pink-800",
      nagad: "bg-orange-100 text-orange-800",
      rocket: "bg-purple-100 text-purple-800",
      upay: "bg-green-100 text-green-800",
      cash: "bg-gray-100 text-gray-800",
    };
    return colors[method] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      {showMobileFilters && (
        <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
          {/* Mobile filter UI here */}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Transactions
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Showing {paginatedData.length} of {filteredData.length}{" "}
                transactions
              </p>
            </div>

            <div className="hidden sm:flex gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                />
              </div>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="cursor-pointer p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="cursor-pointer text-sm text-gray-600">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="cursor-pointer p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:hidden space-y-3 p-4">
          {paginatedData.map((transaction) => (
            <div
              key={transaction._id}
              className="bg-gray-50 rounded-lg p-4 border"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {transaction.description}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {transaction.source}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-sm ${
                      transaction.type === "Credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "Credit" ? "+" : "-"} ৳
                    {transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(
                    transaction.account?.accountType
                  )}`}
                >
                  {transaction.account?.accountType || "N/A"}
                </span>
                <div className="text-xs text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <span className="font-medium">Via:</span>{" "}
                {transaction.account?.accountName || "N/A"}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        Source: {transaction.source}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        transaction.type === "Credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "Credit" ? "+" : "-"} ৳
                      {transaction.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(
                        transaction.account?.accountType
                      )}`}
                    >
                      {transaction.account?.accountType === "Bank" && (
                        <Building className="w-3 h-3 mr-1" />
                      )}
                      {transaction.account?.accountType ===
                        "Mobile Banking" && (
                        <Smartphone className="w-3 h-3 mr-1" />
                      )}
                      {transaction.account?.accountType || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-48 truncate">
                      {transaction.account?.accountName || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500">
              <CreditCard className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No transactions found</p>
              <p className="text-xs sm:text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TransactionList;
