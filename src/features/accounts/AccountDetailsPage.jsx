import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft, Building, Smartphone, CreditCard, DollarSign,
  Hash, User, Calendar, Info, Edit, Trash2, Wallet, Search,
  Filter, ArrowUp, ArrowDown, X, ChevronDown, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/apiService";
import StatBox from "@/components/ui/StatBox";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AddAccountForm from "./AddAccountForm";
import TransactionDetailsModal from "@/components/common/TransactionDetailsModal";
import TransactionTable from "@/components/common/TransactionTable";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();

  // Data States
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Status States
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  // Filter States
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({ transactionType: "all", paymentMethod: "all", category: "all" });
  const [sorting, setSorting] = useState({ sortBy: "date", sortOrder: "desc" });
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Fetch Account Information and Summary Stats
   */
  const fetchAccountDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/account/get-account-details/${accountId}`);
      
      if (res.data.success) {
        // আপনার JSON অনুযায়ী সরাসরি ডাটা সেট করা
        // res.data.data সরাসরি একাউন্ট অবজেক্ট এবং ক্যালকুলেটেড ডাটা ধারণ করে
        setAccount(res.data.data);
      }
    } catch (error) {
      console.error("Account Fetch Error:", error);
      toast.error(error.response?.data?.message || "Failed to load account.");
      if (error.response?.status === 404) navigate("/accounts");
    } finally {
      setLoading(false);
    }
  }, [accountId, navigate]);

  /**
   * Fetch Transaction History for this Account
   */
  const fetchTransactions = useCallback(async (page = 1) => {
    setLoadingTransactions(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      });

      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (filters.transactionType !== "all") params.append("transactionType", filters.transactionType);
      if (filters.paymentMethod !== "all") params.append("paymentMethod", filters.paymentMethod);
      if (filters.category !== "all") params.append("category", filters.category);

      const res = await api.get(`/transactions/get-transactions-by-account/${accountId}?${params.toString()}`);
      if (res.data.success) {
        // ট্রানজেকশন ডাটা হ্যান্ডলিং
        const transData = res.data.data.transactions || res.data.data;
        setTransactions(transData.docs || []);
        setPagination({
          page: transData.page || 1,
          limit: transData.limit || 10,
          totalPages: transData.totalPages || 1,
        });
        setCategories(res.data.data.categories || []);
      }
    } catch (error) {
      console.error("Transaction Error:", error);
    } finally {
      setLoadingTransactions(false);
    }
  }, [accountId, pagination.limit, sorting, filters, debouncedSearchTerm]);

  useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);

  useEffect(() => {
    if (account) {
      fetchTransactions(pagination.page);
    }
  }, [account, pagination.page, fetchTransactions]);

  // Actions
  const confirmDelete = async () => {
    setIsConfirmingDelete(true);
    try {
      const res = await api.delete(`/account/delete-account/${accountId}`);
      if (res.data.success) {
        toast.success("Account moved to trash!");
        navigate("/accounts");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete.");
    } finally {
      setIsConfirmingDelete(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[400px] gap-3">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        <p className="text-gray-500 font-medium">Loading Account Information...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed">
        <Info className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Account Not Found</h2>
        <Link to="/accounts" className="mt-4 inline-block text-blue-600 underline">
          Go Back to Accounts
        </Link>
      </div>
    );
  }

  const isBank = account.accountType === "Bank";
  const isMobile = account.accountType === "Mobile Banking";

  return (
    <div className="p-4 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/accounts" className="p-2 bg-white border rounded-full hover:bg-gray-100 shadow-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.accountName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${account.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {account.status}
              </span>
              <span className="text-gray-300">•</span>
              <p className="text-sm text-gray-500 font-medium">{account.accountType}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setIsEditFormOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-all active:scale-95">
            <Edit size={16} /> Edit
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-all active:scale-95">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* INFO CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><User size={20} /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Holder Name</p>
              <p className="text-sm font-bold text-gray-800">{account.accountHolderName || "N/A"}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 border-l-0 sm:border-l sm:pl-8">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Hash size={20} /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">{isBank ? "A/C Number" : isMobile ? "Mobile Number" : "Ref ID"}</p>
              <p className="text-sm font-mono font-bold text-gray-800">{account.accountNumber || account.mobileNumber || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 border-l-0 lg:border-l lg:pl-8">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              {isBank ? <Building size={20} /> : <Smartphone size={20} />}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">{isBank ? "Bank & Branch" : isMobile ? "Service" : "Account"}</p>
              <p className="text-sm font-bold text-gray-800">
                {isBank ? `${account.bankName} (${account.branchName})` : isMobile ? account.serviceName : "Physical Cash"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS SECTION - আপনার JSON ফিল্ড অনুযায়ী */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatBox title="Current Balance" number={`৳${(account.balance || 0).toLocaleString()}`} Icon={Wallet} textColor="blue" />
        <StatBox title="Total Inflow" number={`৳${(account.totalIncome || 0).toLocaleString()}`} Icon={ArrowUp} textColor="green" />
        <StatBox title="Total Outflow" number={`৳${(account.totalExpense || 0).toLocaleString()}`} Icon={ArrowDown} textColor="red" />
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Transaction History ({account.transactionCount || 0})</h2>
            <p className="text-xs text-gray-400">All financial logs for this account</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search description..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}>
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="p-0">
          {loadingTransactions ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : transactions.length > 0 ? (
            <TransactionTable transactions={transactions} onRowClick={(id) => { setSelectedTransactionId(id); setIsTransactionModalOpen(true); }} />
          ) : (
            <div className="py-24 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-gray-100 mb-4" />
              <p className="text-gray-400 text-sm">No transaction records found.</p>
            </div>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 bg-gray-50/50 border-t">
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => setPagination(prev => ({...prev, page: p}))} />
          </div>
        )}
      </div>

      {/* MODALS */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Move to Trash"
        description="Are you sure you want to move this account to trash? Account balance must be ৳0."
        isConfirming={isConfirmingDelete}
        variant="danger"
      />

      <AddAccountForm 
        isOpen={isEditFormOpen} 
        onClose={() => setIsEditFormOpen(false)} 
        editingAccount={account} 
        onSuccess={() => { setIsEditFormOpen(false); fetchAccountDetails(); }} 
      />

      <TransactionDetailsModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactionId={selectedTransactionId}
      />
    </div>
  );
};

export default AccountDetails;