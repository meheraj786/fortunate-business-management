import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Users,
    DollarSign,
    AlertCircle,
    CalendarDays,
    Phone,
    X,
} from "lucide-react";
import { useDueCustomers } from "@/api/hooks/customer";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { useQueryClient } from "@tanstack/react-query";
import { getCustomerById } from "@/api/customer.api";

// --- Date Preset Helpers ---
const getDatePresetRange = (preset) => {
    const now = new Date();
    const to = now.toISOString().split("T")[0];
    let from;

    switch (preset) {
        case "last-month": {
            const d = new Date(now);
            d.setMonth(d.getMonth() - 1);
            from = d.toISOString().split("T")[0];
            break;
        }
        case "last-3-months": {
            const d = new Date(now);
            d.setMonth(d.getMonth() - 3);
            from = d.toISOString().split("T")[0];
            break;
        }
        case "last-6-months": {
            const d = new Date(now);
            d.setMonth(d.getMonth() - 6);
            from = d.toISOString().split("T")[0];
            break;
        }
        case "last-year": {
            const d = new Date(now);
            d.setFullYear(d.getFullYear() - 1);
            from = d.toISOString().split("T")[0];
            break;
        }
        default:
            return { from: "", to: "" };
    }

    return { from, to };
};

const DATE_PRESETS = [
    { key: "all", label: "All Time" },
    { key: "last-month", label: "Last Month" },
    { key: "last-3-months", label: "3 Months" },
    { key: "last-6-months", label: "6 Months" },
    { key: "last-year", label: "1 Year" },
    { key: "custom", label: "Custom" },
];

// --- Sortable Header ---
const SortableHeader = ({
    label,
    value,
    align = "left",
    sortBy,
    sortOrder,
    onSort,
}) => {
    const isSorted = sortBy === value;

    return (
        <button
            onClick={() => onSort(value)}
            className={`flex items-center gap-1.5 whitespace-nowrap hover:text-[var(--color-primary)] transition-colors w-full group outline-none ${align === "right" ? "justify-end text-right" : align === "center" ? "justify-center text-center" : "justify-start text-left"
                }`}
            aria-label={`Sort by ${label} ${isSorted ? (sortOrder === "asc" ? "ascending" : "descending") : ""
                }`}
        >
            <span
                className={`text-sm font-semibold ${isSorted ? "text-[var(--color-primary)]" : "text-gray-900"
                    }`}
            >
                {label}
            </span>
            <span
                className={`flex-shrink-0 transition-opacity ${isSorted ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
            >
                {isSorted && sortOrder === "asc" ? (
                    <ArrowUp size={14} className="text-[var(--color-primary)]" />
                ) : isSorted && sortOrder === "desc" ? (
                    <ArrowDown size={14} className="text-[var(--color-primary)]" />
                ) : (
                    <ArrowUpDown size={14} />
                )}
            </span>
        </button>
    );
};

// --- Skeleton Loader ---
const TableSkeleton = () => (
    <div className="animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
            <div
                key={i}
                className="flex items-center gap-4 py-4 px-4 sm:px-6 border-b border-gray-100"
            >
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
        ))}
    </div>
);

// --- Stats Skeleton ---
const StatsSkeleton = () => (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-pulse">
        {[0, 1].map((i) => (
            <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5 flex items-center gap-3 sm:gap-4"
            >
                <div className="p-2 sm:p-3 rounded-lg bg-gray-100 flex-shrink-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6"></div>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

// --- Main Component ---
const DueCustomersReport = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("totalDue");
    const [sortOrder, setSortOrder] = useState("desc");
    const [datePreset, setDatePreset] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const { hasPermission } = useAuth();
    const { formatCurrency, formatDate, formatNumber } = useSettings();
    const queryClient = useQueryClient();

    const params = useMemo(
        () => ({
            page,
            limit: 15,
            search: searchTerm,
            sortBy,
            sortOrder,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
        }),
        [page, searchTerm, sortBy, sortOrder, dateFrom, dateTo],
    );

    const {
        data: response,
        isLoading,
        isError,
        error,
        refetch,
    } = useDueCustomers(params);

    const customers = response?.data?.customers || [];
    const totalPages = response?.data?.totalPages || 1;
    const totalItems = response?.data?.totalItems || 0;
    const totalDueAmount = response?.data?.totalDueAmount || 0;

    const handlePresetChange = useCallback((preset) => {
        setDatePreset(preset);
        if (preset === "all") {
            setDateFrom("");
            setDateTo("");
        } else if (preset === "custom") {
            // Keep current dates, user will pick
        } else {
            const range = getDatePresetRange(preset);
            setDateFrom(range.from);
            setDateTo(range.to);
        }
        setPage(1);
    }, []);

    const handleCustomDateChange = useCallback((field, value) => {
        setDatePreset("custom");
        if (field === "from") {
            setDateFrom(value);
        } else {
            setDateTo(value);
        }
        setPage(1);
    }, []);

    const clearAllFilters = useCallback(() => {
        setDatePreset("all");
        setDateFrom("");
        setDateTo("");
        setSearchTerm("");
        setPage(1);
    }, []);

    const handleSort = useCallback((field) => {
        setSortBy((currentSortBy) => {
            if (currentSortBy === field) {
                setSortOrder((prevOrder) =>
                    prevOrder === "asc" ? "desc" : "asc",
                );
                return currentSortBy;
            } else {
                setSortOrder("desc");
                return field;
            }
        });
        setPage(1);
    }, []);

    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
        setPage(1);
    }, []);

    const handlePageChange = useCallback(
        (newPage) => {
            if (newPage >= 1 && newPage <= totalPages) {
                setPage(newPage);
            }
        },
        [totalPages],
    );

    const prefetchCustomerDetails = useCallback(
        (id) => {
            queryClient.prefetchQuery({
                queryKey: ["customers", id],
                queryFn: async () => (await getCustomerById(id)).data,
                staleTime: 5 * 60 * 1000,
            });
        },
        [queryClient],
    );

    const isCustomDateMode = datePreset === "custom";
    const hasActiveFilters = datePreset !== "all" || searchTerm;

    if (isError) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-[var(--color-danger)] text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Error Loading Data
                    </h3>
                    <p className="text-[var(--color-danger)] mb-4">{error.message}</p>
                    <Button onClick={() => refetch()} variant="primary" size="sm">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Summary Stats — always visible, skeleton while loading */}
            {isLoading ? (
                <StatsSkeleton />
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-lg bg-orange-50 flex-shrink-0">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                Customers with Due
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                {formatNumber(totalItems)}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-lg bg-red-50 flex-shrink-0">
                            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                Total Due Amount
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-[var(--color-danger)] truncate">
                                {formatCurrency(totalDueAmount)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Unified Table Card — filters + table in one card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-4 space-y-3 border-b border-gray-100">
                    {/* Row 1: Search + Date Presets */}
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                        <div className="w-full lg:w-64 flex-shrink-0">
                            <SearchBar
                                onSearch={handleSearch}
                                placeholder="Search name, phone, ID..."
                            />
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap flex-1">
                            {DATE_PRESETS.map((preset) => {
                                const isActive = datePreset === preset.key;
                                return (
                                    <button
                                        key={preset.key}
                                        onClick={() => handlePresetChange(preset.key)}
                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${isActive
                                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Clear All — only when filters are active */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="text-xs text-[var(--color-danger)] hover:text-[var(--color-danger-dark)] font-medium flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
                            >
                                <X className="w-3.5 h-3.5" /> Clear
                            </button>
                        )}
                    </div>

                    {/* Row 2: Custom date inputs — only for custom mode */}
                    {isCustomDateMode && (
                        <div className="flex items-center gap-2 flex-wrap pl-0 lg:pl-[calc(16rem+0.75rem)]">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) =>
                                    handleCustomDateChange("from", e.target.value)
                                }
                                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] text-gray-600"
                            />
                            <span className="text-gray-400 text-xs">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) =>
                                    handleCustomDateChange("to", e.target.value)
                                }
                                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] text-gray-600"
                            />
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="min-h-[300px] sm:min-h-[400px]">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : customers.length === 0 ? (
                        <div className="text-center py-16">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-base font-medium text-gray-500">
                                No due customers found
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {hasActiveFilters
                                    ? "Try adjusting your search or date filter."
                                    : "All customers are paid up! 🎉"}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="mt-3 text-sm text-[var(--color-primary)] hover:underline font-medium"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <table className="min-w-[750px] w-full border-separate border-spacing-0">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="py-3 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 border-b border-gray-200"
                                                >
                                                    <SortableHeader
                                                        label="Customer"
                                                        value="name"
                                                        sortBy={sortBy}
                                                        sortOrder={sortOrder}
                                                        onSort={handleSort}
                                                    />
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                                                >
                                                    Phone
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-200"
                                                >
                                                    <SortableHeader
                                                        label="Due Amount"
                                                        value="totalDue"
                                                        align="right"
                                                        sortBy={sortBy}
                                                        sortOrder={sortOrder}
                                                        onSort={handleSort}
                                                    />
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200"
                                                >
                                                    <SortableHeader
                                                        label="Due Invoices"
                                                        value="dueSalesCount"
                                                        align="center"
                                                        sortBy={sortBy}
                                                        sortOrder={sortOrder}
                                                        onSort={handleSort}
                                                    />
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-200"
                                                >
                                                    <SortableHeader
                                                        label="Total Paid"
                                                        value="totalPaid"
                                                        align="right"
                                                        sortBy={sortBy}
                                                        sortOrder={sortOrder}
                                                        onSort={handleSort}
                                                    />
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-3 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200"
                                                >
                                                    <SortableHeader
                                                        label="Last Purchase"
                                                        value="lastPurchaseDate"
                                                        sortBy={sortBy}
                                                        sortOrder={sortOrder}
                                                        onSort={handleSort}
                                                    />
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="py-3 pl-3 pr-4 text-center text-sm font-semibold text-gray-900 sm:pr-6 border-b border-gray-200"
                                                >
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white relative">
                                            <AnimatePresence initial={false}>
                                                {customers.map((customer) => (
                                                    <motion.tr
                                                        key={customer._id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="hover:bg-gray-50 transition-colors group"
                                                        transition={{ duration: 0.12 }}
                                                        onMouseEnter={() =>
                                                            hasPermission("CUSTOMER_VIEW_DETAILS") &&
                                                            prefetchCustomerDetails(customer._id)
                                                        }
                                                    >
                                                        <td className="whitespace-nowrap py-3 sm:py-4 pl-4 pr-3 text-sm sm:pl-6 border-b border-gray-100">
                                                            {hasPermission("CUSTOMER_VIEW_DETAILS") ? (
                                                                <Link
                                                                    to={`/customer-details/${customer._id}`}
                                                                    className="text-[var(--color-primary)] hover:text-[#004b95] font-medium"
                                                                >
                                                                    <div
                                                                        className="max-w-[120px] sm:max-w-[180px] truncate"
                                                                        title={customer.name}
                                                                    >
                                                                        {customer.name}
                                                                    </div>
                                                                </Link>
                                                            ) : (
                                                                <div
                                                                    className="max-w-[120px] sm:max-w-[180px] truncate font-medium text-gray-900"
                                                                    title={customer.name}
                                                                >
                                                                    {customer.name}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                {customer.customerId}
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-sm border-b border-gray-100">
                                                            {customer.phone ? (
                                                                <a
                                                                    href={`tel:${customer.phone}`}
                                                                    className="text-gray-600 hover:text-[var(--color-primary)] inline-flex items-center gap-1.5 group/phone"
                                                                    title={`Call ${customer.phone}`}
                                                                >
                                                                    <Phone className="w-3.5 h-3.5 text-gray-400 group-hover/phone:text-[var(--color-primary)] flex-shrink-0" />
                                                                    <span>
                                                                        {customer.phone}
                                                                    </span>
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </td>

                                                        <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-sm text-right font-bold text-[var(--color-danger)] border-b border-gray-100">
                                                            {formatCurrency(customer.totalDue || 0)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-sm text-center text-gray-700 font-medium border-b border-gray-100">
                                                            {customer.dueSalesCount || 0}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-sm text-right text-green-600 font-medium border-b border-gray-100">
                                                            {formatCurrency(customer.totalPaid || 0)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-sm text-gray-500 border-b border-gray-100">
                                                            {customer.lastPurchaseDate
                                                                ? formatDate(customer.lastPurchaseDate)
                                                                : "—"}
                                                        </td>
                                                        <td className="whitespace-nowrap py-3 sm:py-4 pl-3 pr-4 text-sm text-center sm:pr-6 border-b border-gray-100">
                                                            {customer.customerStatus && (
                                                                <StatusBadge
                                                                    status={customer.customerStatus}
                                                                    size="sm"
                                                                    showIcon={false}
                                                                />
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {totalPages > 1 && (
                                <div className="px-4 sm:px-6">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        totalItems={totalItems}
                                        itemsPerPage={15}
                                        className="py-4 border-t border-gray-200"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DueCustomersReport;
