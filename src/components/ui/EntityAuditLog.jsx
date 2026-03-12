import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/api/audit.api";
import { ChevronDown, ChevronUp, FileCode2, History, ArrowRight, User as UserIcon, Activity } from "lucide-react";
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import { useSettings } from "@/context/SettingsContext";

const EntityAuditLog = ({ moduleId, moduleName }) => {
    const { formatDateTime } = useSettings();
    const [expandedRows, setExpandedRows] = useState(new Set());

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ["entityAuditLogs", moduleId],
        queryFn: async () => {
            // Searching by documentId or displayId generally covers it.
            // We pass the exact exact string matching the backend's indexed documentId.
            const response = await getAuditLogs({
                limit: 50, // Grab a good chunk of history
                module: moduleName,
                documentId: moduleId,
            });
            return response.data;
        },
        enabled: !!moduleId && !!moduleName,
    });

    const auditLogs = responseData?.data?.logs || [];

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const hasData = (obj) => obj && typeof obj === 'object' && Object.keys(obj).length > 0;
    const hasChanges = (log) => log.changes && (hasData(log.changes.before) || hasData(log.changes.after));
    const hasMetadata = (log) => log.metadata && Object.keys(log.metadata).length > 0;
    const isExpandable = (log) => hasChanges(log) || hasMetadata(log);

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
        <CollapsibleCard
            title="Activity History"
            icon={<History className="text-[var(--color-primary)]" />}
            defaultOpen={false}
            ariaLabel="Activity History Section"
        >
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading history...</div>
                ) : isError ? (
                    <div className="p-8 text-center text-red-500">Failed to load history.</div>
                ) : auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <History className="w-8 h-8 text-gray-300 mb-2" />
                        No activity history found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {auditLogs.map((log) => (
                            <div key={log._id} className="px-3 py-3 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </div>
                                    {isExpandable(log) && (
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
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1 flex-wrap">
                                    <span className="font-medium">{log.userId?.name || "System"}</span>
                                    <span>·</span>
                                    <span className="truncate">{formatDateTime(log.timestamp)}</span>
                                </div>

                                {/* Expanded Details */}
                                {expandedRows.has(log._id) && isExpandable(log) && (
                                    <div className="mt-2 space-y-3">
                                        {hasChanges(log) && (
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
                                        {hasMetadata(log) && (
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
                            <th className="px-4 py-3 min-w-[300px]">Description</th>
                            <th className="px-4 py-3 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                    Loading history...
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-red-500">
                                    Failed to load history.
                                </td>
                            </tr>
                        ) : auditLogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500 flex flex-col items-center">
                                    <History className="w-8 h-8 text-gray-300 mb-2" />
                                    No activity history found.
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
                                        <td className="px-4 py-3 text-gray-800">
                                            {log.description}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {isExpandable(log) && (
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
                                    {expandedRows.has(log._id) && isExpandable(log) && (
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <td colSpan="5" className="px-4 py-3 bg-gray-50/30">
                                                <div className="flex flex-col gap-3 p-1">
                                                    {hasChanges(log) && (
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

                                                    {hasMetadata(log) && (
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
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </CollapsibleCard>
    );
};

export default EntityAuditLog;
