import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router"; // Usereact-router
import { handleError } from "@/utils/handle-error";
import api from "@/services/apiService"; // Assuming apiService.js handles axios setup
import toast from "react-hot-toast";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  ITEMS_PER_PAGE,
} from "../constants";
import { useAccounts } from "@/api/hooks/account"; // Import useAccounts from src/api/hooks/account.js

// Helper to get local date string in YYYY-MM-DD format
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- API Functions (assuming these exist in src/api/cash.api.js or similar) ---
// Since the prompt provided backend routes for cash, I'm creating simple wrappers.
const fetchDailyCashStatus = async (date) => {
  if (!date) return Promise.reject(new Error("Date is required."));
  const response = await api.get(`/cash/status`, { params: { date } });
  return response.data.data;
};

const fetchDailyCashSummary = async (date) => {
  if (!date) return Promise.reject(new Error("Date is required."));
  const response = await api.get(`/cash/summary`, { params: { date } });
  return response.data.data;
};

const openDailyCash = async (date) => {
  const response = await api.post(`/cash/open`, { date });
  return response.data;
};

const closeDailyCash = async (date) => {
  const response = await api.post(`/cash/close`, { date });
  return response.data;
};

// Fetch active LCs and Sales for dropdowns
const fetchActiveReferences = async () => {
  const [lcRes, salesRes] = await Promise.all([
    api.get(`/lc/get-all-lc?status=Active`),
    api.get(`/sales/get-all-sales?status=Invoiced&paymentStatus=Due%20payment`),
  ]);
  return {
    activeLc: lcRes.data.data || [],
    activeSales: salesRes.data.data || [],
  };
};

// --- Main Hook ---
export const useDailyCashFlowData = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // --- Date Management ---
  const getInitialDate = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const dateFromUrl = params.get("date");
    if (dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)) {
      const d = new Date(dateFromUrl);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for comparison
      if (!isNaN(d.getTime()) && d <= today) {
        return dateFromUrl;
      }
    }
    return getLocalDateString(new Date());
  }, [location.search]);

  const [selectedDate, setSelectedDate] = useState(getInitialDate);

  useEffect(() => {
    // Update URL when selectedDate changes
    navigate(`?date=${selectedDate}`, { replace: true });
  }, [selectedDate, navigate]);

  // --- Data Fetching ---
  const {
    data: dailyCashStatusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["dailyCashStatus", selectedDate],
    queryFn: () => fetchDailyCashStatus(selectedDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    onError: (err) => handleError(err, "Failed to fetch daily cash status."),
  });

  const {
    data: dailyCashSummaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["dailyCashSummary", selectedDate],
    queryFn: () => fetchDailyCashSummary(selectedDate),
    enabled:
      dailyCashStatusData?.status === "Open" ||
      dailyCashStatusData?.status === "Closed", // Only fetch summary if status is open or closed
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: (err) => handleError(err, "Failed to fetch daily cash summary."),
  });

  const {
    data: activeReferences,
    isLoading: isReferencesLoading,
    refetch: refetchReferences,
  } = useQuery({
    queryKey: ["activeReferences"],
    queryFn: fetchActiveReferences,
    staleTime: 10 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    enabled: false, // Only fetch when needed (e.g., when AddTransactionDialog is opened)
    onError: (err) =>
      handleError(err, "Failed to load LCs or Sales for transaction linking."),
  });

  // Fetch Accounts using useAccounts from @/api/hooks/account
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();

  // --- Mutations ---
  const openDayMutation = useMutation({
    mutationFn: openDailyCash,
    onSuccess: (data) => {
      toast.success(data.message || "Cash opened successfully!");
      queryClient.invalidateQueries({
        queryKey: ["dailyCashStatus", selectedDate],
      });
      queryClient.invalidateQueries({
        queryKey: ["dailyCashSummary", selectedDate],
      });
    },
    onError: (err) => handleError(err, "Failed to open cash."),
  });

  const closeDayMutation = useMutation({
    mutationFn: closeDailyCash,
    onSuccess: (data) => {
      toast.success(data.message || "Cash closed successfully!");
      queryClient.invalidateQueries({
        queryKey: ["dailyCashStatus", selectedDate],
      });
      queryClient.invalidateQueries({
        queryKey: ["dailyCashSummary", selectedDate],
      });
    },
    onError: (err) => handleError(err, "Failed to close cash."),
  });

  // --- Filter and Pagination ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const transactions = useMemo(() => {
    return dailyCashSummaryData?.transactions || [];
  }, [dailyCashSummaryData]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.description?.toLowerCase().includes(term) ||
          transaction.category?.toLowerCase().includes(term) ||
          transaction.name?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.category === categoryFilter
      );
    }
    // Sort by createdAt descending, assuming createdAt exists on transaction objects
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    );
  }, [transactions, searchTerm, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  );

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const allCategories = useMemo(() => {
    const incomeCats = INCOME_CATEGORIES.map((cat) => ({
      value: cat,
      label: cat,
    }));
    const expenseCats = EXPENSE_CATEGORIES.map((cat) => ({
      value: cat,
      label: cat,
    }));
    const uniqueCategories = [
      ...new Set([
        ...incomeCats.map((c) => c.value),
        ...expenseCats.map((c) => c.value),
      ]),
    ];
    return uniqueCategories.sort().map((cat) => ({ value: cat, label: cat }));
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  const handleDateChange = useCallback((dateString) => {
    setSelectedDate(dateString);
    setCurrentPage(1);
    setSearchTerm("");
    setCategoryFilter("all");
  }, []);

  const dailyCashStatus = dailyCashStatusData?.status;
  const summary = dailyCashSummaryData || {
    openingBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    runningBalance: 0,
    totalTransactions: 0,
    incomeTransactionsCount: 0,
    expenseTransactionsCount: 0,
  };

  const isInitialLoading =
    isStatusLoading || (dailyCashStatus && isSummaryLoading);
  const isLoading =
    isInitialLoading || openDayMutation.isLoading || closeDayMutation.isLoading;
  const isError = isStatusError || isSummaryError;
  const error = statusError || summaryError;

  return {
    // Date & Status
    selectedDate,
    handleDateChange,
    dailyCashStatus,
    isInitialLoading, // Loading for initial data fetch (status and summary)
    isLoading, // Loading for any operation (initial fetch + mutations)
    isError,
    error,
    getLocalDateString, // Expose helper
    isToday: selectedDate === getLocalDateString(new Date()),

    // Summary Data
    summary,

    // Transactions
    transactions: paginatedTransactions,
    totalTransactions: transactions.length,
    filteredTransactionsCount: filteredTransactions.length,
    refetchDailyCashData: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyCashStatus", selectedDate],
      });
      queryClient.invalidateQueries({
        queryKey: ["dailyCashSummary", selectedDate],
      });
    },

    // Mutations
    openDay: openDayMutation.mutate,
    closeDay: closeDayMutation.mutate,
    isOpeningDay: openDayMutation.isLoading,
    isClosingDay: closeDayMutation.isLoading,

    // Filters
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    allCategories,

    // Pagination
    currentPage,
    totalPages,
    handlePageChange,

    // References for AddTransactionDialog
    activeLc: activeReferences?.activeLc || [],
    activeSales: activeReferences?.activeSales || [],
    isReferencesLoading,
    refetchReferences,

    // Accounts for AddTransactionDialog
    accounts: accountsData?.data || [], // Assuming accountsData has a 'data' field
    accountsLoading: accountsLoading,
  };
};
