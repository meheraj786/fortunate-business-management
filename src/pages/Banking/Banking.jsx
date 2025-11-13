import React, { useState, useMemo, useEffect, useContext } from "react";
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
  Banknote,
  Plus,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
import FormDialog from "../../components/common/FormDialog";
import InputField from "../../components/forms/InputField";
import SelectField from "../../components/forms/SelectField";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const Banking = () => {
  const { baseUrl } = useContext(UrlContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedText, setCopiedText] = useState("");
  const itemsPerPage = 10;

  // Data states
  const [bankAccounts, setBankAccounts] = useState([]);
  const [mobileBankingAccounts, setMobileBankingAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isBankFormOpen, setIsBankFormOpen] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New states for delete and update
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const initialBankData = {
    bankName: "",
    branchName: "",
    accountHolderName: "",
    accountName: "",
    accountNumber: "",
    swiftCode: "",
    routingNumber: "",
    balance: "",
  };
  const [bankFormData, setBankFormData] = useState(initialBankData);

  const initialMobileData = {
    serviceName: "",
    accountNumber: "", // This will map to mobileNumber in the schema
    accountHolderName: "",
    accountName: "",
    balance: "",
  };
  const [mobileFormData, setMobileFormData] = useState(initialMobileData);
  const [transactionStats, setTransactionStats] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const initialTransactionData = {
    bankAccount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "Credit",
    amount: "",
  };
  const [transactionFormData, setTransactionFormData] = useState(
    initialTransactionData
  );

  const openTransactionForm = (type) => {
    setTransactionFormData({ ...initialTransactionData, type });
    setIsTransactionFormOpen(true);
  };

  const handleTransactionFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = async () => {
    setIsSubmitting(true);
    try {
      const { bankAccount, date, description, type, amount } =
        transactionFormData;
      if (!bankAccount || !description || !type || !amount) {
        toast.error("Please fill all required fields.");
        return;
      }

      const payload = {
        ...transactionFormData,
        amount: Number(amount),
      };

      const response = await axios.post(
        `${baseUrl}transaction/create`,
        payload
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Transaction created successfully!"
        );
        setIsTransactionFormOpen(false);
        // Refresh all data
        fetchAccounts();
        fetchTransactionStats();
        fetchTransactions();
      } else {
        toast.error(response.data.message || "Failed to create transaction.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}bank/get-all-accounts`);
      if (response.data.success) {
        const allAccounts = response.data.data;
        setBankAccounts(
          allAccounts.filter((acc) => acc.accountType === "Bank")
        );
        setMobileBankingAccounts(
          allAccounts.filter((acc) => acc.accountType === "Mobile Banking")
        );
      } else {
        toast.error(response.data.message || "Failed to fetch accounts.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while fetching accounts.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const response = await axios.get(`${baseUrl}transaction/get-stats`);
      if (response.data.success) {
        setTransactionStats(response.data.data);
      } else {
        toast.error(
          response.data.message || "Failed to fetch transaction stats."
        );
      }
    } catch (error) {
      toast.error(
        "An unexpected error occurred while fetching transaction stats."
      );
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${baseUrl}transaction/get-all`);
      if (response.data.success) {
        setTransactions(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch transactions.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while fetching transactions.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (baseUrl) {
      fetchAccounts();
      fetchTransactionStats();
      fetchTransactions();
    }
  }, [baseUrl]);

  const handleBankFormChange = (e) => {
    const { name, value } = e.target;
    setBankFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMobileFormChange = (e) => {
    const { name, value } = e.target;
    setMobileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    setIsConfirmingDelete(true);
    try {
      const response = await axios.delete(
        `${baseUrl}bank/delete-account/${accountToDelete._id}`
      );
      if (response.data.success) {
        toast.success("Account deleted successfully!");
        fetchAccounts(); // Refresh data
        setIsDeleteModalOpen(false);
        setAccountToDelete(null);
      } else {
        toast.error(response.data.message || "Failed to delete account.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  const handleEditClick = async (account) => {
    try {
      const response = await axios.get(
        `${baseUrl}bank/get-account/${account._id}`
      );
      if (!response.data.success) {
        toast.error(
          response.data.message || "Failed to fetch account details."
        );
        return;
      }

      const fetchedAccount = response.data.data;
      setEditingAccount(fetchedAccount);

      if (fetchedAccount.accountType === "Bank") {
        setBankFormData({
          bankName: fetchedAccount.bankName || "",
          branchName: fetchedAccount.branchName || "",
          accountHolderName: fetchedAccount.accountHolderName || "",
          accountName: fetchedAccount.accountName || "",
          accountNumber: fetchedAccount.accountNumber || "",
          swiftCode: fetchedAccount.swiftCode || "",
          routingNumber: fetchedAccount.routingNumber || "",
          balance: fetchedAccount.balance || "",
        });
        setIsBankFormOpen(true);
      } else if (fetchedAccount.accountType === "Mobile Banking") {
        setMobileFormData({
          serviceName: fetchedAccount.serviceName || "",
          accountNumber: fetchedAccount.mobileNumber || "",
          accountHolderName: fetchedAccount.accountHolderName || "",
          accountName: fetchedAccount.accountName || "",
          balance: fetchedAccount.balance || "",
        });
        setIsMobileFormOpen(true);
      }
    } catch (error) {
      toast.error(
        "An unexpected error occurred while fetching account details."
      );
    }
  };

  const handleSaveAccount = async (formData, accountType) => {
    setIsSubmitting(true);
    try {
      const isEditing = !!editingAccount;
      const url = isEditing
        ? `${baseUrl}bank/update-account/${editingAccount._id}`
        : `${baseUrl}bank/create-account`;
      const method = isEditing ? "patch" : "post";

      const payload = {
        ...formData,
        accountType,
        balance: Number(formData.balance) || 0,
      };

      if (accountType === "Mobile Banking") {
        payload.mobileNumber = formData.accountNumber;
        delete payload.accountNumber;
      }

      const response = await axios[method](url, payload);

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `Account ${isEditing ? "updated" : "created"} successfully!`
        );
        if (accountType === "Bank") {
          setIsBankFormOpen(false);
          setBankFormData(initialBankData);
        } else {
          setIsMobileFormOpen(false);
          setMobileFormData(initialMobileData);
        }
        fetchAccounts(); // Refresh data
        setEditingAccount(null); // Reset editing state
      } else {
        toast.error(
          response.data.message ||
            `Failed to ${isEditing ? "update" : "create"} account.`
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          item.bankAccount?.accountName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.bankAccount?.accountType === paymentMethodFilter
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
      cash: "bg-gray-100 text-gray-800",
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
                Manage bank accounts, mobile banking details and track payment
                transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTransactionFormOpen(true)}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors justify-center text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="cursor-pointer sm:hidden flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors justify-center text-sm"
              >
                <Menu className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <StatCard
            title="Total Transactions"
            value={transactionStats?.overall?.totalTransactions || 0}
            icon={Receipt}
            color="blue"
          />
          <StatCard
            title="Total Amount"
            value={`৳${(
              transactionStats?.overall?.totalCredit || 0
            ).toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Bank Transfers"
            value={transactionStats?.byType?.bank?.count || 0}
            icon={Building}
            color="blue"
          />
          <StatCard
            title="Mobile Banking"
            value={transactionStats?.byType?.mobileBanking?.count || 0}
            icon={Smartphone}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Bank Accounts
              </h2>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setIsBankFormOpen(true);
                }}
                className="cursor-pointer flex items-center gap-1 px-3 py-1 text-xs sm:text-sm bg-[#003b75] text-white rounded-lg hover:bg-[#002a5c] transition-colors"
              >
                <Plus size={16} />
                Add Account
              </button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : bankAccounts.length > 0 ? (
                bankAccounts.map((account) => (
                  <div
                    key={account._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {account.bankName}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-green-600">
                          ৳{account.balance.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleEditClick(account)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(account)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{account.branchName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>
                            {account.accountHolderName} ({account.accountName})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          A/C: {account.accountNumber}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(account.accountNumber, "account")
                          }
                          className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedText === `account_${account.accountNumber}` ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Routing: {account.routingNumber} | Swift:{" "}
                        {account.swiftCode}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No bank accounts found.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                Mobile Banking
              </h2>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setIsMobileFormOpen(true);
                }}
                className="cursor-pointer flex items-center gap-1 px-3 py-1 text-xs sm:text-sm bg-[#003b75] text-white rounded-lg hover:bg-[#002a5c] transition-colors"
              >
                <Plus size={16} />
                Add Account
              </button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
                </div>
              ) : mobileBankingAccounts.length > 0 ? (
                mobileBankingAccounts.map((account) => (
                  <div
                    key={account._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center`}
                        >
                          <Smartphone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {account.serviceName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {account.accountHolderName} ({account.accountName})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3 justify-end">
                          <p className="font-bold text-lg text-green-600">
                            ৳{account.balance.toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleEditClick(account)}
                            className="text-gray-400 hover:text-blue-600 p-1"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(account)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span className="font-mono text-sm">
                            {account.mobileNumber}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(account.mobileNumber, "mobile")
                            }
                            className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                          >
                            {copiedText === `mobile_${account.mobileNumber}` ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No mobile banking accounts found.
                </p>
              )}
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
                  className="cursor-pointer p-1 hover:bg-gray-100 rounded"
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
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
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
                          className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
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
                      transaction.bankAccount?.accountType
                    )}`}
                  >
                    {transaction.bankAccount?.accountType || "N/A"}
                  </span>
                  <div className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Via:</span>{" "}
                  {transaction.bankAccount?.accountName || "N/A"}
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
                          transaction.bankAccount?.accountType
                        )}`}
                      >
                        {transaction.bankAccount?.accountType === "Bank" && (
                          <Building className="w-3 h-3 mr-1" />
                        )}
                        {transaction.bankAccount?.accountType ===
                          "Mobile Banking" && (
                          <Smartphone className="w-3 h-3 mr-1" />
                        )}
                        {transaction.bankAccount?.accountType || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-48 truncate">
                        {transaction.bankAccount?.accountName || "N/A"}
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

        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Quick Payment Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {paymentMethods.slice(1).map((method) => {
              const methodTransactions = transactions.filter(
                (t) => t.bankAccount?.accountType === method.value
              );
              const methodTotal = methodTransactions.reduce(
                (sum, t) => sum + t.amount,
                0
              );

              return (
                <div
                  key={method.value}
                  className="text-center p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${getPaymentMethodColor(
                      method.value
                    )}`}
                  >
                    {method.value === "Bank" && (
                      <Building className="w-4 h-4" />
                    )}
                    {method.value === "Mobile Banking" && (
                      <Smartphone className="w-4 h-4" />
                    )}
                    {method.value === "Cash" && (
                      <Banknote className="w-4 h-4" />
                    )}
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

      {/* Add Bank Account Form */}
      <FormDialog
        open={isBankFormOpen}
        onClose={() => {
          setIsBankFormOpen(false);
          setEditingAccount(null);
          setBankFormData(initialBankData);
        }}
        title={editingAccount ? "Update Bank Account" : "Add New Bank Account"}
        primaryButtonText={
          isSubmitting
            ? editingAccount
              ? "Updating..."
              : "Adding..."
            : editingAccount
            ? "Update Account"
            : "Add Account"
        }
        secondaryButtonText="Cancel"
        onSubmit={() => handleSaveAccount(bankFormData, "Bank")}
        isPrimaryButtonDisabled={isSubmitting}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Bank Name"
            name="bankName"
            value={bankFormData.bankName}
            onChange={handleBankFormChange}
            required
          />
          <InputField
            label="Branch Name"
            name="branchName"
            value={bankFormData.branchName}
            onChange={handleBankFormChange}
            required
          />
          <InputField
            label="Account Holder Name"
            name="accountHolderName"
            value={bankFormData.accountHolderName}
            onChange={handleBankFormChange}
            required
          />
          <InputField
            label="Account Name"
            name="accountName"
            value={bankFormData.accountName}
            onChange={handleBankFormChange}
            placeholder="e.g., Primary Business Account"
            required
          />
          <InputField
            label="Account Number"
            name="accountNumber"
            value={bankFormData.accountNumber}
            onChange={handleBankFormChange}
            required
          />
          <InputField
            label="SWIFT Code"
            name="swiftCode"
            value={bankFormData.swiftCode}
            onChange={handleBankFormChange}
          />
          <InputField
            label="Routing Number"
            name="routingNumber"
            value={bankFormData.routingNumber}
            onChange={handleBankFormChange}
          />
          <InputField
            label="Initial Balance"
            name="balance"
            type="number"
            value={bankFormData.balance}
            onChange={handleBankFormChange}
            required
          />
        </div>
      </FormDialog>

      {/* Add Mobile Banking Account Form */}
      <FormDialog
        open={isMobileFormOpen}
        onClose={() => {
          setIsMobileFormOpen(false);
          setEditingAccount(null);
          setMobileFormData(initialMobileData);
        }}
        title={
          editingAccount
            ? "Update Mobile Banking Account"
            : "Add New Mobile Banking Account"
        }
        primaryButtonText={
          isSubmitting
            ? editingAccount
              ? "Updating..."
              : "Adding..."
            : editingAccount
            ? "Update Account"
            : "Add Account"
        }
        secondaryButtonText="Cancel"
        onSubmit={() => handleSaveAccount(mobileFormData, "Mobile Banking")}
        isPrimaryButtonDisabled={isSubmitting}
      >
        <div className="space-y-4">
          <InputField
            label="Service Name"
            name="serviceName"
            value={mobileFormData.serviceName}
            onChange={handleMobileFormChange}
            placeholder="e.g., Bkash, Nagad"
            required
          />
          <InputField
            label="Account Number"
            name="accountNumber"
            value={mobileFormData.accountNumber}
            onChange={handleMobileFormChange}
            required
          />
          <InputField
            label="Account Holder Name"
            name="accountHolderName"
            value={mobileFormData.accountHolderName}
            onChange={handleMobileFormChange}
            required
          />
          <InputField
            label="Account Name"
            name="accountName"
            value={mobileFormData.accountName}
            onChange={handleMobileFormChange}
            placeholder="e.g., Personal Bkash"
            required
          />
          <InputField
            label="Initial Balance"
            name="balance"
            type="number"
            value={mobileFormData.balance}
            onChange={handleMobileFormChange}
            required
          />
        </div>
      </FormDialog>

      {/* Add Transaction Form */}
      <FormDialog
        open={isTransactionFormOpen}
        onClose={() => setIsTransactionFormOpen(false)}
        title="Add New Transaction"
        primaryButtonText={isSubmitting ? "Adding..." : "Add Transaction"}
        secondaryButtonText="Cancel"
        onSubmit={handleAddTransaction}
        isPrimaryButtonDisabled={isSubmitting}
      >
        <div className="space-y-4">
          <SelectField
            label="Account"
            name="bankAccount"
            value={transactionFormData.bankAccount}
            onChange={handleTransactionFormChange}
            options={[...bankAccounts, ...mobileBankingAccounts].map((acc) => ({
              value: acc._id,
              label: `${acc.accountName} (${acc.bankName || acc.serviceName})`,
            }))}
            required
          />
          <SelectField
            label="Transaction Type"
            name="type"
            value={transactionFormData.type}
            onChange={handleTransactionFormChange}
            options={[
              { value: "Credit", label: "Incoming (Credit)" },
              { value: "Debit", label: "Outgoing (Debit)" },
            ]}
            required
          />
          <InputField
            label="Amount"
            name="amount"
            type="number"
            value={transactionFormData.amount}
            onChange={handleTransactionFormChange}
            required
          />
          <InputField
            label="Description"
            name="description"
            value={transactionFormData.description}
            onChange={handleTransactionFormChange}
            required
          />
          <InputField
            label="Date"
            name="date"
            type="date"
            value={transactionFormData.date}
            onChange={handleTransactionFormChange}
            required
          />
        </div>
      </FormDialog>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
        isConfirming={isConfirmingDelete}
      />
    </div>
  );
};

export default Banking;
