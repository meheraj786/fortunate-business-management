import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/api/audit.api";
import { Filter, Search, ChevronDown, ChevronUp, FileCode2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSettings } from "@/context/SettingsContext";

const MODULES = [
    "All", "User", "Sale", "Customer", "Product", "LC",
    "Account", "Transaction", "Warehouse", "Category", "Unit", "DailyCash", "System",
];

const ACTIONS = [
    "All", "CREATE", "UPDATE", "DELETE", "RESTORE", "CANCEL",
    "LOGIN", "LOGOUT", "PAYMENT", "TRANSFER", "BACKUP", "SETTINGS_UPDATE",
    "OPEN", "CLOSE", "WIPE"
];

const AuditLogsPage = () => {
    const { formatDateTime } = useSettings();
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [module, setModule] = useState("");
    const [action, setAction] = useState("");
    const [search, setSearch] = useState("");
    const [expandedRows, setExpandedRows] = useState(new Set());

    // Use debounce for search input
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ["auditLogs", { page, limit, module, action, search: debouncedSearch }],
        queryFn: async () => {
            const response = await getAuditLogs({
                page,
                limit,
                module: module === "All" ? "" : module,
                action: action === "All" ? "" : action,
                search: debouncedSearch
            });
            return response.data; // ApiResponse object
        },
        keepPreviousData: true,
    });

    const auditLogs = responseData?.data?.logs || [];
    const pagination = {
        total: responseData?.data?.totalItems || 0,
        pages: responseData?.data?.totalPages || 1
    };

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPage(1); // Reset page on filter change
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const getActionColor = (actionType) => {
        switch (actionType) {
            case "CREATE": return "text-emerald-700 bg-emerald-50 border-emerald-200";
            case "UPDATE": return "text-blue-700 bg-blue-50 border-blue-200";
            case "DELETE": return "text-red-700 bg-red-50 border-red-200";
            case "RESTORE": return "text-amber-700 bg-amber-50 border-amber-200";
            case "CANCEL": return "text-gray-700 bg-gray-100 border-gray-300";
            case "LOGIN": case "LOGOUT": return "text-indigo-700 bg-indigo-50 border-indigo-200";
            default: return "text-gray-700 bg-gray-50 border-gray-200";
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">System Audit Trail</h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search descriptions..."
                            className="w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {/* Module Filter */}
                        <div className="relative flex-1 sm:flex-none">
                            <select
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
                                value={module}
                                onChange={handleFilterChange(setModule)}
                            >
                                <option value="" disabled hidden>Module</option>
                                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <Filter className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                        </div>

                        {/* Action Filter */}
                        <div className="relative flex-1 sm:flex-none">
                            <select
                                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
                                value={action}
                                onChange={handleFilterChange(setAction)}
                            >
                                <option value="" disabled hidden>Action Type</option>
                                {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="block md:hidden">
                {isLoading ? (
                    <div className="px-4 py-8 text-center text-gray-500">Loading audit logs...</div>
                ) : isError ? (
                    <div className="px-4 py-8 text-center text-red-500">Failed to load audit logs.</div>
                ) : auditLogs.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">No audit logs found matching the filters.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {auditLogs.map((log) => (
                            <div key={log._id} className="px-3 py-3 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                                            {log.module}
                                        </span>
                                    </div>
                                    {(log.changes || log.metadata) && (
                                        <button
                                            onClick={() => toggleRow(log._id)}
                                            className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors flex-shrink-0"
                                            title="View Details"
                                        >
                                            {expandedRows.has(log._id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-800">
                                    {log.description}
                                    {log.displayId && (
                                        <span className="ml-2 text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded">
                                            {log.displayId}
                                        </span>
                                    )}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1 flex-wrap">
                                    <span className="font-medium">{log.userId?.name || "System"}</span>
                                    <span>·</span>
                                    <span className="truncate">{formatDateTime(log.timestamp)}</span>
                                </div>

                                {/* Expanded Details */}
                                {expandedRows.has(log._id) && (log.changes || log.metadata) && (
                                    <div className="mt-2 space-y-3">
                                        {log.changes && (
                                            <div className="bg-white p-3 rounded border border-gray-200 shadow-sm overflow-x-auto">
                                                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <FileCode2 size={14} /> Changes
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="text-[10px] text-gray-500 mb-1">BEFORE</div>
                                                        <pre className="text-xs text-red-600 bg-red-50/50 p-2 rounded whitespace-pre-wrap font-mono overflow-x-auto">
                                                            {JSON.stringify(log.changes.before, null, 2)}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-gray-500 mb-1">AFTER</div>
                                                        <pre className="text-xs text-emerald-600 bg-emerald-50/50 p-2 rounded whitespace-pre-wrap font-mono overflow-x-auto">
                                                            {JSON.stringify(log.changes.after, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {log.metadata && !log.changes && (
                                            <div className="bg-white p-3 rounded border border-gray-200 shadow-sm overflow-x-auto">
                                                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <FileCode2 size={14} /> Metadata
                                                </div>
                                                <pre className="text-xs text-gray-700 p-2 rounded whitespace-pre-wrap font-mono bg-gray-50">
                                                    {JSON.stringify(log.metadata, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                        <tr>
                            <th className="px-4 py-3 min-w-[160px]">Timestamp</th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Module</th>
                            <th className="px-4 py-3 min-w-[300px]">Description</th>
                            <th className="px-4 py-3 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                    Loading audit logs...
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-red-500">
                                    Failed to load audit logs.
                                </td>
                            </tr>
                        ) : auditLogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                    No audit logs found matching the filters.
                                </td>
                            </tr>
                        ) : (
                            auditLogs.map((log) => (
                                <React.Fragment key={log._id}>
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                            {formatDateTime(log.timestamp)}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {log.userId?.name || "System"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">
                                            {log.description}
                                            {log.displayId && (
                                                <span className="ml-2 text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded">
                                                    {log.displayId}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {(log.changes || log.metadata) && (
                                                <button
                                                    onClick={() => toggleRow(log._id)}
                                                    className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                                                    title="View Details"
                                                >
                                                    {expandedRows.has(log._id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Expanded Row for JSON details */}
                                    {expandedRows.has(log._id) && (log.changes || log.metadata) && (
                                        <tr className="bg-gray-50/80 border-b border-gray-100">
                                            <td colSpan="6" className="px-4 py-3">
                                                <div className="flex flex-col lg:flex-row gap-4">
                                                    {log.changes && (
                                                        <div className="flex-1 bg-white p-3 rounded border border-gray-200 shadow-sm overflow-x-auto min-w-0">
                                                            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                <FileCode2 size={14} /> Changes
                                                            </div>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                <div className="min-w-0">
                                                                    <div className="text-[10px] text-gray-500 mb-1">BEFORE</div>
                                                                    <pre className="text-xs text-red-600 bg-red-50/50 p-2 rounded whitespace-pre-wrap font-mono overflow-x-auto">
                                                                        {JSON.stringify(log.changes.before, null, 2)}
                                                                    </pre>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="text-[10px] text-gray-500 mb-1">AFTER</div>
                                                                    <pre className="text-xs text-emerald-600 bg-emerald-50/50 p-2 rounded whitespace-pre-wrap font-mono overflow-x-auto">
                                                                        {JSON.stringify(log.changes.after, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {log.metadata && !log.changes && (
                                                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm w-full overflow-x-auto">
                                                            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                                <FileCode2 size={14} /> Metadata
                                                            </div>
                                                            <pre className="text-xs text-gray-700 p-2 rounded whitespace-pre-wrap font-mono bg-gray-50">
                                                                {JSON.stringify(log.metadata, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-sm text-gray-500 text-center sm:text-left">
                        Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to <span className="font-medium">{Math.min(page * limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <div className="text-sm px-2 text-gray-600 whitespace-nowrap">
                            Page {page} of {pagination.pages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === pagination.pages}
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogsPage;
