import React, { useState, useMemo } from "react";
import {
  Building,
  Smartphone,
  CreditCard,
  Wallet,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Phone,
  MapPin,
  User,
  Receipt,
  Banknote
} from "lucide-react";

const Banking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedText, setCopiedText] = useState("");
  const itemsPerPage = 10;

  const salesDataWithPayment = [
    {
      id: 1,
      productName: "Mild Steel Rod",
      productId: 1,
      lcNumber: "LC001",
      quantity: 25,
      price: 25.5,
      invoiceStatus: "yes",
      date: "2025-01-21",
      customer: "Rahman Steel Works",
      category: "Steel Rods",
      size: "12mm x 12m",
      unit: "pieces",
      paymentMethod: "bank",
      bankInfo: "Dutch Bangla Bank - Dhanmondi Branch"
    },
    {
      id: 2,
      productName: "Galvanized Steel Sheet",
      productId: 2,
      lcNumber: "LC002",
      quantity: 10,
      price: 45.0,
      invoiceStatus: "yes",
      date: "2025-01-22",
      customer: "Metro Construction",
      category: "Steel Sheets",
      size: "4ft x 8ft x 2mm",
      unit: "sheets",
      paymentMethod: "bkash",
      bankInfo: "bKash Personal"
    },
    {
      id: 3,
      productName: "Steel Angle Bar",
      productId: 3,
      lcNumber: "LC003",
      quantity: 8,
      price: 18.75,
      invoiceStatus: "no",
      date: "2025-01-20",
      customer: "Building Solutions Ltd",
      category: "Structural Steel",
      size: "50mm x 50mm x 6m",
      unit: "pieces",
      paymentMethod: "cash",
      bankInfo: "Cash Payment"
    },
    {
      id: 4,
      productName: "Stainless Steel Plate",
      productId: 4,
      lcNumber: "LC004",
      quantity: 2,
      price: 125.0,
      invoiceStatus: "pending",
      date: "2025-01-19",
      customer: "Industrial Fabricators",
      category: "Steel Plates",
      size: "3ft x 6ft x 5mm",
      unit: "plates",
      paymentMethod: "nagad",
      bankInfo: "Nagad Personal"
    },
    {
      id: 5,
      productName: "Steel Pipe",
      productId: 5,
      lcNumber: "LC005",
      quantity: 5,
      price: 65.5,
      invoiceStatus: "yes",
      date: "2025-01-18",
      customer: "Pipe & Fittings Co",
      category: "Steel Pipes",
      size: "6 inch diameter x 6m",
      unit: "pieces",
      paymentMethod: "bank",
      bankInfo: "BRAC Bank - Gulshan Branch"
    },
    {
      id: 6,
      productName: "Carbon Steel Bar",
      productId: 6,
      lcNumber: "LC006",
      quantity: 15,
      price: 32.25,
      invoiceStatus: "pending",
      date: "2025-01-10",
      customer: "Steel Traders",
      category: "Steel Bars",
      size: "25mm x 6m",
      unit: "pieces",
      paymentMethod: "rocket",
      bankInfo: "Rocket Personal"
    },
    {
      id: 7,
      productName: "Steel H-Beam",
      productId: 7,
      lcNumber: "LC007",
      quantity: 3,
      price: 185.0,
      invoiceStatus: "yes",
      date: "2025-01-15",
      customer: "Heavy Construction",
      category: "Structural Steel",
      size: "200mm x 100mm x 12m",
      unit: "pieces",
      paymentMethod: "bank",
      bankInfo: "Islami Bank - Motijheel Branch"
    },
    {
      id: 8,
      productName: "Coil Steel Strip",
      productId: 8,
      lcNumber: "LC008",
      quantity: 1,
      price: 450.0,
      invoiceStatus: "no",
      date: "2025-01-20",
      customer: "Manufacturing Corp",
      category: "Steel Coils",
      size: "50mm width x 1000m",
      unit: "coils",
      paymentMethod: "upay",
      bankInfo: "Upay Wallet"
    },
    {
      id: 9,
      productName: "Steel Wire Mesh",
      productId: 9,
      lcNumber: "LC009",
      quantity: 8,
      price: 75.0,
      invoiceStatus: "pending",
      date: "2025-01-16",
      customer: "Mesh Solutions",
      category: "Wire Products",
      size: "4ft x 100ft x 2mm",
      unit: "rolls",
      paymentMethod: "bkash",
      bankInfo: "bKash Personal"
    },
    {
      id: 10,
      productName: "TMT Steel Bar",
      productId: 10,
      lcNumber: "LC010",
      quantity: 30,
      price: 28.0,
      invoiceStatus: "yes",
      date: "2025-01-17",
      customer: "Construction Materials Ltd",
      category: "Steel Bars",
      size: "16mm x 12m",
      unit: "pieces",
      paymentMethod: "bank",
      bankInfo: "City Bank - Wari Branch"
    }
  ];

  const bankAccounts = [
    {
      id: 1,
      bankName: "Dutch Bangla Bank Limited",
      branchName: "Dhanmondi Branch",
      accountNumber: "1234567890123",
      accountName: "Steel Trading Company",
      routingNumber: "090270001",
      swiftCode: "DBBLBDDHXXX"
    },
    {
      id: 2,
      bankName: "BRAC Bank Limited",
      branchName: "Gulshan Branch", 
      accountNumber: "9876543210987",
      accountName: "Steel Trading Company",
      routingNumber: "060270001",
      swiftCode: "BRACBDDH"
    },
    {
      id: 3,
      bankName: "Islami Bank Bangladesh Limited",
      branchName: "Motijheel Branch",
      accountNumber: "5555444433332",
      accountName: "Steel Trading Company",
      routingNumber: "125270001",
      swiftCode: "IBBLBDDH"
    },
    {
      id: 4,
      bankName: "City Bank Limited",
      branchName: "Wari Branch",
      accountNumber: "7777888899990",
      accountName: "Steel Trading Company",
      routingNumber: "225270001",
      swiftCode: "CIBLBDDH"
    }
  ];

  const mobileBankingAccounts = [
    {
      id: 1,
      provider: "bKash",
      type: "Personal",
      number: "01712345678",
      color: "bg-pink-500"
    },
    {
      id: 2,
      provider: "Nagad",
      type: "Personal",
      number: "01987654321",
      color: "bg-orange-500"
    },
    {
      id: 3,
      provider: "Rocket",
      type: "Personal",
      number: "01555666777",
      color: "bg-purple-500"
    },
    {
      id: 4,
      provider: "Upay",
      type: "Merchant",
      number: "01444333222",
      color: "bg-green-500"
    }
  ];

  const paymentMethods = [
    { value: "all", label: "All Methods" },
    { value: "bank", label: "Bank Transfer" },
    { value: "bkash", label: "bKash" },
    { value: "nagad", label: "Nagad" },
    { value: "rocket", label: "Rocket" },
    { value: "upay", label: "Upay" },
    { value: "cash", label: "Cash" }
  ];

  const filteredData = useMemo(() => {
    let filtered = salesDataWithPayment;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.lcNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.bankInfo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter((item) => item.paymentMethod === paymentMethodFilter);
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
  }, [salesDataWithPayment, searchTerm, paymentMethodFilter, dateFilter, selectedDate]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalTransactions = filteredData.length;
  const totalAmount = filteredData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const bankTransactions = filteredData.filter(item => item.paymentMethod === 'bank').length;
  const mobileTransactions = filteredData.filter(item => ['bkash', 'nagad', 'rocket', 'upay'].includes(item.paymentMethod)).length;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(`${type}_${text}`);
      setTimeout(() => setCopiedText(""), 2000);
    });
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      bank: "bg-blue-100 text-blue-800",
      bkash: "bg-pink-100 text-pink-800",
      nagad: "bg-orange-100 text-orange-800",
      rocket: "bg-purple-100 text-purple-800",
      upay: "bg-green-100 text-green-800",
      cash: "bg-gray-100 text-gray-800"
    };
    return colors[method] || "bg-gray-100 text-gray-800";
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-lg sm:text-2xl font-bold mt-1 text-${color}-600`}>
            {value}
          </p>
        </div>
        <div className={`p-2 sm:p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 ">
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Banking & Payment Information
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage bank accounts, mobile banking details and track payment transactions
              </p>
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors justify-center text-sm w-full"
            >
              <Menu className="w-4 h-4" />
              Filters & Options
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <StatCard
            title="Total Transactions"
            value={totalTransactions}
            icon={Receipt}
            color="blue"
          />
          <StatCard
            title="Total Amount"
            value={`৳${totalAmount.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Bank Transfers"
            value={bankTransactions}
            icon={Building}
            color="blue"
          />
          <StatCard
            title="Mobile Banking"
            value={mobileTransactions}
            icon={Smartphone}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Bank Accounts
            </h2>
            <div className="space-y-4">
              {bankAccounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {account.bankName}
                    </h3>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{account.branchName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{account.accountName}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">A/C: {account.accountNumber}</span>
                      <button
                        onClick={() => copyToClipboard(account.accountNumber, 'account')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {copiedText === `account_${account.accountNumber}` ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Routing: {account.routingNumber} | Swift: {account.swiftCode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              Mobile Banking
            </h2>
            <div className="space-y-4">
              {mobileBankingAccounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${account.color} rounded-lg flex items-center justify-center`}>
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {account.provider}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {account.type} Account
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="font-mono text-sm">{account.number}</span>
                        <button
                          onClick={() => copyToClipboard(account.number, 'mobile')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedText === `mobile_${account.number}` ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                    Search
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
                    Payment Method
                  </label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Filter
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "all", label: "All" },
                        { key: "today", label: "Today" },
                        { key: "week", label: "Week" },
                        { key: "month", label: "Month" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setDateFilter(key)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            dateFilter === key
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  <CreditCard className="w-5 h-5" />
                  Payment Transactions
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Showing {paginatedData.length} of {filteredData.length} transactions
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
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
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
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
            {paginatedData.map(transaction => (
              <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {transaction.productName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.customer} • {transaction.lcNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-sm">
                      ৳{(transaction.price * transaction.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.quantity} {transaction.unit}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                    {transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
                  </span>
                  <div className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Via:</span> {transaction.bankInfo}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank/Mobile Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.lcNumber} • {transaction.size}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.customer}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.quantity} {transaction.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ৳{(transaction.price * transaction.quantity).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        @৳{transaction.price.toFixed(2)} per {transaction.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                        {transaction.paymentMethod === 'bank' && <Building className="w-3 h-3 mr-1" />}
                        {['bkash', 'nagad', 'rocket', 'upay'].includes(transaction.paymentMethod) && <Smartphone className="w-3 h-3 mr-1" />}
                        {transaction.paymentMethod === 'cash' && <Banknote className="w-3 h-3 mr-1" />}
                        {transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-48 truncate">
                        {transaction.bankInfo}
                      </div>
                      <div className="text-sm text-gray-500">
                        Status: {transaction.invoiceStatus === 'yes' ? 'Completed' : 
                                transaction.invoiceStatus === 'pending' ? 'Pending' : 'Not Invoiced'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('en-GB')}
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
                <p className="text-xs sm:text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Quick Payment Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {paymentMethods.slice(1).map(method => {
              const methodTransactions = filteredData.filter(t => t.paymentMethod === method.value);
              const methodTotal = methodTransactions.reduce((sum, t) => sum + (t.price * t.quantity), 0);
              
              return (
                <div key={method.value} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${getPaymentMethodColor(method.value)}`}>
                    {method.value === 'bank' && <Building className="w-4 h-4" />}
                    {['bkash', 'nagad', 'rocket', 'upay'].includes(method.value) && <Smartphone className="w-4 h-4" />}
                    {method.value === 'cash' && <Banknote className="w-4 h-4" />}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    {method.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {methodTransactions.length} transactions
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    ৳{methodTotal.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banking;