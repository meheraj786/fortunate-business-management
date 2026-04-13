import React, { useState, useMemo, memo, useEffect } from "react";
import { Link } from "react-router";
import {
  Building,
  Smartphone,
  Copy,
  Check,
  Phone,
  MapPin,
  User,
  Plus,
  Loader2,
  Wallet,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hash,
  Landmark,
  Eye,
  AlertCircle
} from "lucide-react";
import { useAccounts } from "@/api/hooks/account";
import { showErrorToast } from "@/utils/notifications";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import { useQueryClient } from "@tanstack/react-query";
import { getAccountDetails } from "@/api/account.api";

const TABS = [
  { id: "bank", label: "Bank Accounts", icon: Building },
  { id: "mobile", label: "Mobile Banking", icon: Smartphone },
  { id: "cash", label: "Cash Accounts", icon: Wallet },
];

const ITEMS_PER_PAGE = 15;

const AccountList = memo(({ onAddAccount }) => {
  const { data: allAccounts, isLoading, isError } = useAccounts();
  const [activeTab, setActiveTab] = useState("bank");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [copiedText, setCopiedText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { hasPermission } = useAuth();
  const { formatCurrency } = useSettings();
  const queryClient = useQueryClient();

  const canCreateAccount = hasPermission("ACCOUNT_CREATE");
  const canViewDetails = hasPermission("ACCOUNT_VIEW_DETAILS");

  // Reset pagination when filter/tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const prefetchAccountDetails = (id) => {
    queryClient.prefetchQuery({
      queryKey: ["accounts", "details", id],
      queryFn: async () => (await getAccountDetails(id)).data,
      staleTime: 5 * 60 * 1000,
    });
  };

  const copyToClipboard = (e, text, type) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedText(`${type}_${text}`);
        setTimeout(() => setCopiedText(""), 2000);
      },
      (err) => {
        showErrorToast("Failed to copy text.");
      },
    );
  };

  const { categorizedAccounts, totalBalances } = useMemo(() => {
    const categories = { bank: [], mobile: [], cash: [] };
    const balances = { bank: 0, mobile: 0, cash: 0 };

    if (allAccounts?.data) {
      allAccounts.data.forEach((acc) => {
        const bal = acc.balance || 0;
        if (acc.accountType === "Bank") {
          categories.bank.push(acc);
          balances.bank += bal;
        } else if (acc.accountType === "Mobile Banking") {
          categories.mobile.push(acc);
          balances.mobile += bal;
        } else if (acc.accountType === "Cash") {
          categories.cash.push(acc);
          balances.cash += bal;
        }
      });
    }
    
    return { categorizedAccounts: categories, totalBalances: balances };
  }, [allAccounts]);

  const displayedAccounts = useMemo(() => {
    let currentData = categorizedAccounts[activeTab] || [];

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      currentData = currentData.filter((acc) => {
        return (
          acc.accountName?.toLowerCase().includes(lowerQuery) ||
          acc.bankName?.toLowerCase().includes(lowerQuery) ||
          acc.serviceName?.toLowerCase().includes(lowerQuery) ||
          acc.accountNumber?.toLowerCase().includes(lowerQuery) ||
          acc.mobileNumber?.toLowerCase().includes(lowerQuery) ||
          acc.accountHolderName?.toLowerCase().includes(lowerQuery) ||
          acc.branchName?.toLowerCase().includes(lowerQuery)
        );
      });
    }

    currentData.sort((a, b) => {
      const balA = a.balance || 0;
      const balB = b.balance || 0;
      return sortOrder === "desc" ? balB - balA : balA - balB;
    });

    return currentData;
  }, [categorizedAccounts, activeTab, searchQuery, sortOrder]);

  // Pagination Logic
  const totalItems = displayedAccounts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedAccounts = displayedAccounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSortOrder = () => setSortOrder(prev => prev === "desc" ? "asc" : "desc");

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-100 text-red-600 mb-6">
        <AlertCircle className="w-8 h-8 mb-2" />
        <h3 className="text-base font-semibold">Failed to load accounts</h3>
        <p className="text-sm">Please check your connection and try again.</p>
      </div>
    );
  }

  const handleAddClick = () => {
    switch (activeTab) {
      case "bank": onAddAccount("Bank"); break;
      case "mobile": onAddAccount("Mobile Banking"); break;
      case "cash": onAddAccount("Cash"); break;
      default: onAddAccount("Bank"); break;
    }
  };

  const renderTableRow = (account) => {
    return (
      <tr 
        key={account._id}
        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <td className="p-4 align-top">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{account.accountName || account.bankName || "Unnamed Account"}</span>
            <div className="flex items-center gap-2 mt-1 py-0.5 text-sm text-gray-600">
               {activeTab === "bank" && (
                 <>
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  <span>{account.accountNumber}</span>
                  <button 
                    onClick={(e) => copyToClipboard(e, account.accountNumber, "acc")}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
                    title="Copy Account Number"
                  >
                    {copiedText === `acc_${account.accountNumber}` ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                 </>
               )}
               {activeTab === "mobile" && (
                 <>
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{account.mobileNumber}</span>
                  <button 
                    onClick={(e) => copyToClipboard(e, account.mobileNumber, "mob")}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
                    title="Copy Mobile Number"
                  >
                    {copiedText === `mob_${account.mobileNumber}` ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                 </>
               )}
               {activeTab === "cash" && (
                 <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Cash Register</span>
               )}
            </div>
          </div>
        </td>

        <td className="p-4 align-top">
          {activeTab === "bank" ? (
             <div className="flex flex-col">
              <span className="font-medium text-gray-800 flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-gray-400"/> {account.bankName}</span>
              {account.branchName && (
                <span className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> {account.branchName}</span>
              )}
             </div>
          ) : activeTab === "mobile" ? (
             <div className="flex flex-col">
               <span className="font-medium text-gray-800 flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-gray-400"/> {account.serviceName}</span>
             </div>
          ) : (
            <span className="text-gray-400 text-sm">N/A</span>
          )}
        </td>

        <td className="p-4 align-top">
          {account.accountHolderName ? (
            <div className="flex items-center gap-2 text-gray-800">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{account.accountHolderName}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">N/A</span>
          )}
        </td>

        <td className="p-4 align-top text-right">
          <span className="font-semibold text-[var(--color-success)]">
            {formatCurrency(account.balance)}
          </span>
        </td>

        <td className="p-4 align-top text-right">
          {canViewDetails && (
             <Link
                to={`/accounts/${account._id}`}
                onMouseEnter={() => prefetchAccountDetails(account._id)}
                className="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded transition-colors"
                title="View Account Details"
             >
                <Eye className="w-4 h-4" />
             </Link>
          )}
        </td>
      </tr>
    );
  };

  // Ultra-compact mobile row
  const renderMobileListRow = (account) => {
    return (
       <div key={account._id} className="flex items-center justify-between py-3 border-b border-gray-100 bg-white">
          <div className="flex flex-col flex-1 min-w-0 pr-3">
             <span className="font-semibold text-sm text-gray-900 truncate">
               {account.accountName || account.bankName || "Unnamed Account"}
             </span>
             <div className="flex items-center text-xs text-gray-500 mt-1 gap-2 truncate">
                {activeTab === "bank" && (
                  <>
                    <Landmark className="w-3 h-3 shrink-0" />
                    <span className="truncate">{account.bankName}</span>
                    <span className="text-gray-300">•</span>
                    <span>{account.accountNumber?.slice(-4) ? `*${account.accountNumber.slice(-4)}` : ''}</span>
                  </>
                )}
                {activeTab === "mobile" && (
                  <>
                    <Smartphone className="w-3 h-3 shrink-0" />
                    <span className="truncate">{account.serviceName}</span>
                    <span className="text-gray-300">•</span>
                    <span>{account.mobileNumber?.slice(-4) ? `*${account.mobileNumber.slice(-4)}` : ''}</span>
                  </>
                )}
                {activeTab === "cash" && account.accountHolderName && (
                  <>
                    <User className="w-3 h-3 shrink-0" />
                    <span className="truncate">{account.accountHolderName}</span>
                  </>
                )}
             </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
             <span className="font-semibold text-xs text-[var(--color-success)]">
               {formatCurrency(account.balance)}
             </span>
             {canViewDetails && (
               <Link
                 to={`/accounts/${account._id}`}
                 onMouseEnter={() => prefetchAccountDetails(account._id)}
                 className="mt-1 flex items-center text-gray-400 hover:text-[var(--color-primary)] p-1 -mr-1"
               >
                 <span className="text-[10px] mr-0.5">Details</span>
                 <ChevronRight className="w-3.5 h-3.5" />
               </Link>
             )}
          </div>
       </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-100">
      
      {/* Header and Summary */}
      <div className="border-b border-gray-200 p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/30">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full hidden sm:inline-block ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {categorizedAccounts[tab.id]?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Total Balance block */}
        <div className="bg-white border text-right border-gray-200 rounded-md px-5 py-3 w-full md:w-auto flex flex-col">
          <span className="text-xs font-medium text-gray-500 mb-0.5">Total {TABS.find(t => t.id === activeTab)?.label} Balance</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(totalBalances[activeTab])}
          </span>
        </div>

      </div>

      {/* Toolbar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 justify-between items-center border-b border-gray-100">
         <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            />
         </div>

         {canCreateAccount && (
            <Button
              onClick={handleAddClick}
              variant="primary"
              size="sm"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </Button>
         )}
      </div>

      {/* Data View */}
      <div className="min-h-[250px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex justify-center items-center bg-white/80 z-10">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
          </div>
        ) : displayedAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
               <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-800">No accounts found</h3>
            <p className="text-gray-500 text-sm mt-1">
               {searchQuery ? "Try adjusting your search query." : "You haven't added any accounts in this category yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="font-semibold text-gray-600 p-4 text-sm">Account Info</th>
                    <th className="font-semibold text-gray-600 p-4 text-sm">Institution / Branch</th>
                    <th className="font-semibold text-gray-600 p-4 text-sm">Account Holder</th>
                    <th 
                      className="font-semibold text-gray-600 p-4 text-sm text-right cursor-pointer hover:bg-gray-100 select-none transition-colors" 
                      onClick={toggleSortOrder}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        Balance
                        {sortOrder === "desc" ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="font-semibold text-gray-600 p-4 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAccounts.map(renderTableRow)}
                </tbody>
              </table>
            </div>

            {/* Mobile List View (Ultra Compact) */}
            <div className="lg:hidden">
              <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
                 <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {totalItems} accounts
                 </span>
                 <button 
                   onClick={toggleSortOrder} 
                   className="flex items-center gap-1 text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1.5 rounded shadow-sm"
                 >
                   Sort
                   {sortOrder === "desc" ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronUp className="w-3 h-3 text-gray-500" />}
                 </button>
              </div>
              <div className="flex flex-col px-3 sm:px-4">
                 {paginatedAccounts.map(renderMobileListRow)}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-200 bg-white">
                <p className="text-sm text-gray-700 hidden sm:block">
                  Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
                </p>
                <p className="text-sm text-gray-700 sm:hidden">
                  <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
});

export default AccountList;
