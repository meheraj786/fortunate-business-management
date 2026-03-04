import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
    Plus,
    Search,
    ArrowUp,
    ArrowDown,
    X,
    HandCoins,
    Trash,
    Clock,
    CheckCircle2,
    RotateCcw,
    ArrowRightLeft,
    CalendarDays,
} from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import Pagination from "@/components/ui/Pagination";
import StatBox from "@/components/ui/StatBox";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAdvancePayments, useAdvancePaymentStats } from "@/api/hooks/advancePayment";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import { useDebounce } from "@/hooks/useDebounce";
import { showErrorToast } from "@/utils/notifications";
import { formatAccountLabel } from "@/utils/format";
import CreateAdvancePaymentModal from "./CreateAdvancePaymentModal";

const sortOptions = [
    { value: "date", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "supplierName", label: "Supplier Name" },
];

const STATUS_CHIPS = [
    { key: "", label: "All", icon: HandCoins },
    { key: "Pending", label: "Pending", icon: Clock },
    { key: "Settled", label: "Settled", icon: CheckCircle2 },
    { key: "Refunded", label: "Refunded", icon: RotateCcw },
    { key: "Partially Settled", label: "Partial", icon: ArrowRightLeft },
];

const SkeletonRow = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
            <div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
        </div>
    </div>
);

const AdvancePaymentsPage = () => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const { formatCurrency } = useSettings();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filters
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sorting, setSorting] = useState({ sortBy: "date", sortOrder: "desc" });

    useEffect(() => {
        if (!hasPermission("ADVANCE_PAYMENT_VIEW")) {
            showErrorToast("You don't have permission to view advance payments.");
            navigate("/");
        }
    }, [hasPermission, navigate]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter, dateFrom, dateTo]);

    const queryParams = {
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
    };

    const { data: response, isLoading } = useAdvancePayments(queryParams);
    const { data: statsResponse, isLoading: isLoadingStats } = useAdvancePaymentStats();

    const advances = response?.data?.docs || [];
    const pagination = response?.data || {};
    const stats = statsResponse?.data || {};

    const hasActiveFilters = statusFilter || dateFrom || dateTo || searchTerm;

    const handleSortByChange = useCallback((val) => {
        setSorting((prev) => ({ ...prev, sortBy: val }));
        setPage(1);
    }, []);

    const toggleSortOrder = useCallback(() => {
        setSorting((prev) => ({
            ...prev,
            sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
        }));
        setPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setStatusFilter("");
        setSearchTerm("");
        setDateFrom("");
        setDateTo("");
        setSorting({ sortBy: "date", sortOrder: "desc" });
        setPage(1);
    }, []);

    // Clicking a stat card filters by that status
    const handleStatClick = useCallback((status) => {
        setStatusFilter((prev) => (prev === status ? "" : status));
        setPage(1);
    }, []);

    const handlePageChange = useCallback(
        (newPage) => {
            if (newPage >= 1 && newPage <= (pagination.totalPages || 1)) {
                setPage(newPage);
            }
        },
        [pagination.totalPages],
    );

    return (
        <motion.div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Advance Payments
                    </h1>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">
                        Track advance payments (tokens) to local suppliers
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasPermission("TRASH_VIEW_ADVANCE_PAYMENT") && (
                        <Link to="/trash/AdvancePayment">
                            <Button
                                variant="danger"
                                size="sm"
                                className="flex items-center gap-2"
                                aria-label="Trash Advance Payment"
                            >
                                <Trash className="w-5 h-5" /> Trash
                            </Button>
                        </Link>
                    )}
                    {hasPermission("ADVANCE_PAYMENT_CREATE") && (
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            variant="primary"
                            size="sm"
                            className="flex items-center gap-2"
                            aria-label="New Advance Payment"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">New Advance</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Clickable Stats — acts as quick status filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <div
                    onClick={() => handleStatClick("")}
                    className={`cursor-pointer rounded-lg transition-all ${statusFilter === ""
                        ? "ring-2 ring-[var(--color-primary)] ring-offset-2"
                        : "hover:ring-1 hover:ring-gray-300"
                        }`}
                >
                    <StatBox
                        title="Total Advances"
                        number={stats.totalCount || 0}
                        Icon={HandCoins}
                        textColor="primary"
                        loading={isLoadingStats}
                    />
                </div>
                <div
                    onClick={() => handleStatClick("Pending")}
                    className={`cursor-pointer rounded-lg transition-all ${statusFilter === "Pending"
                        ? "ring-2 ring-[var(--color-warning)] ring-offset-2"
                        : "hover:ring-1 hover:ring-gray-300"
                        }`}
                >
                    <StatBox
                        title="Pending Amount"
                        number={formatCurrency(stats.totalPendingAmount || 0)}
                        Icon={Clock}
                        textColor="warning"
                        loading={isLoadingStats}
                    />
                </div>
                <div
                    onClick={() => handleStatClick("Settled")}
                    className={`cursor-pointer rounded-lg transition-all ${statusFilter === "Settled"
                        ? "ring-2 ring-[var(--color-success)] ring-offset-2"
                        : "hover:ring-1 hover:ring-gray-300"
                        }`}
                >
                    <StatBox
                        title="Settled"
                        number={stats.byStatus?.Settled?.count || 0}
                        Icon={CheckCircle2}
                        textColor="success"
                        loading={isLoadingStats}
                    />
                </div>
                <div
                    onClick={() => handleStatClick("Refunded")}
                    className={`cursor-pointer rounded-lg transition-all ${statusFilter === "Refunded"
                        ? "ring-2 ring-[var(--color-primary)] ring-offset-2"
                        : "hover:ring-1 hover:ring-gray-300"
                        }`}
                >
                    <StatBox
                        title="Refunded"
                        number={stats.byStatus?.Refunded?.count || 0}
                        Icon={RotateCcw}
                        textColor="primary"
                        loading={isLoadingStats}
                    />
                </div>
            </div>

            {/* Search + Filters — all inline, no hidden panels */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                {/* Row 1: Search + Sort */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <InputField
                            id="advance-search"
                            name="search"
                            placeholder="Search by supplier, ID, or purpose..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={Search}
                            className="w-full"
                        />
                    </div>

                    <div className="relative w-full md:w-48">
                        <SelectField
                            name="sortBy"
                            value={sorting.sortBy}
                            onChange={handleSortByChange}
                            options={sortOptions}
                            className="mb-0"
                        />
                    </div>

                    <Button
                        onClick={toggleSortOrder}
                        variant="secondary"
                        size="sm"
                        className="flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                        {sorting.sortOrder === "asc" ? (
                            <>
                                <ArrowUp className="w-4 h-4" />
                                <span className="hidden sm:inline">Ascending</span>
                            </>
                        ) : (
                            <>
                                <ArrowDown className="w-4 h-4" />
                                <span className="hidden sm:inline">Descending</span>
                            </>
                        )}
                    </Button>
                </div>

                {/* Row 2: Status chips + Date range — always visible, no clicks to expand */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Status Chips — 1-click filtering */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {STATUS_CHIPS.map((chip) => {
                            const isActive = statusFilter === chip.key;
                            const ChipIcon = chip.icon;
                            return (
                                <button
                                    key={chip.key}
                                    onClick={() => setStatusFilter(isActive && chip.key !== "" ? "" : chip.key)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isActive
                                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                        }`}
                                >
                                    <ChipIcon className="w-3 h-3" />
                                    {chip.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider on desktop */}
                    <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

                    {/* Date Range — inline, always visible */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <CalendarDays className="w-4 h-4 text-gray-400 hidden sm:block" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] text-gray-600"
                            placeholder="From"
                        />
                        <span className="text-gray-400 text-xs">to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] text-gray-600"
                            placeholder="To"
                        />
                    </div>
                </div>

                {/* Active Filters Bar — only shows when filters are active */}
                {hasActiveFilters && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Active:</span>
                        {statusFilter && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full text-xs font-medium">
                                {statusFilter}
                                <button onClick={() => setStatusFilter("")} className="hover:text-[var(--color-primary-hover)]">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {dateFrom && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                From: {dateFrom}
                                <button onClick={() => setDateFrom("")} className="hover:text-gray-800">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {dateTo && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                To: {dateTo}
                                <button onClick={() => setDateTo("")} className="hover:text-gray-800">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                &ldquo;{searchTerm}&rdquo;
                                <button onClick={() => setSearchTerm("")} className="hover:text-gray-800">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="ml-auto text-xs text-[var(--color-danger)] hover:text-[var(--color-danger-dark)] font-medium flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div>
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonRow key={i} />
                        ))}
                    </div>
                ) : advances.length > 0 ? (
                    <motion.div initial="hidden" animate="visible">
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Supplier</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Purpose</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Amount</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Remaining</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Account</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {advances.map((adv) => (
                                        <tr
                                            key={adv._id}
                                            onClick={() => hasPermission("ADVANCE_PAYMENT_VIEW_DETAILS") && navigate(`/advance-payments/${adv._id}`)}
                                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${hasPermission("ADVANCE_PAYMENT_VIEW_DETAILS") ? "cursor-pointer" : "cursor-default"}`}
                                        >
                                            <td className="py-3 px-4 font-mono text-xs text-[var(--color-primary)] font-medium">
                                                {adv.advanceId}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-800">{adv.supplierName}</div>
                                                {adv.supplierPhone && (
                                                    <div className="text-xs text-gray-400">{adv.supplierPhone}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                                                {adv.purpose || "—"}
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium">
                                                {formatCurrency(adv.amount)}
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium">
                                                {formatCurrency(adv.remainingAmount)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <StatusBadge status={adv.status} size="sm" />
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {new Date(adv.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 text-xs">
                                                {adv.accountId ? formatAccountLabel(adv.accountId) : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {advances.map((adv) => (
                                <div
                                    key={adv._id}
                                    onClick={() => hasPermission("ADVANCE_PAYMENT_VIEW_DETAILS") && navigate(`/advance-payments/${adv._id}`)}
                                    className={`block bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors ${hasPermission("ADVANCE_PAYMENT_VIEW_DETAILS") ? "cursor-pointer" : "cursor-default"}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                            <span className="font-mono text-xs text-[var(--color-primary)] font-medium">
                                                {adv.advanceId}
                                            </span>
                                            <div className="font-medium text-gray-800 mt-0.5 truncate">
                                                {adv.supplierName}
                                            </div>
                                            {adv.purpose && (
                                                <div className="text-xs text-gray-500 mt-0.5 truncate">{adv.purpose}</div>
                                            )}
                                        </div>
                                        <StatusBadge status={adv.status} size="sm" />
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-xs text-gray-500">Amount</div>
                                                <div className="font-medium text-gray-900">{formatCurrency(adv.amount)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Remaining</div>
                                                <div className="font-medium text-gray-900">
                                                    {formatCurrency(adv.remainingAmount)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2">
                                            {new Date(adv.date).toLocaleDateString()}
                                            {adv.accountId && ` • ${formatAccountLabel(adv.accountId)}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <HandCoins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No Advance Payments Found
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {hasActiveFilters
                                ? "Try adjusting your search or filters."
                                : "Get started by creating your first advance payment."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {hasActiveFilters && (
                                <Button
                                    onClick={clearFilters}
                                    variant="secondary"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    Clear Filters
                                </Button>
                            )}
                            {hasPermission("ADVANCE_PAYMENT_CREATE") && (
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    variant="primary"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    New Advance Payment
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <Pagination
                    currentPage={page}
                    totalPages={pagination.totalPages || 1}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    totalItems={pagination.totalDocs || 0}
                    itemsPerPage={10}
                />
            </div>

            {/* Create Modal */}
            <CreateAdvancePaymentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => setIsCreateModalOpen(false)}
            />
        </motion.div>
    );
};

export default AdvancePaymentsPage;
