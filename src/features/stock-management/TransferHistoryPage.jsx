import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightLeft, ChevronDown, ChevronUp, FileCode2, History } from "lucide-react";
import { getAuditLogs } from "@/api/audit.api";
import { useWarehouse } from "@/api/hooks/warehouse";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/hooks/useAuth";
import { showErrorToast } from "@/utils/notifications";

const TransferHistoryPage = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { formatDateTime } = useSettings();
  const [expandedRows, setExpandedRows] = useState(new Set());

  React.useEffect(() => {
    if (!hasPermission("AUDIT_VIEW")) {
      showErrorToast("You don't have permission to view transfer history.");
      navigate(`/stock/${warehouseId}`);
    }
  }, [hasPermission, navigate, warehouseId]);

  const { data: warehouseData } = useWarehouse(warehouseId);
  const warehouse = warehouseData?.data;

  // Fetch ALL StockTransfer audit logs. The audit API's `search` param only
  // searches the `description` field, but descriptions always contain the
  // warehouse name (e.g. 'from "Warehouse A" to "Warehouse B"'), so we use
  // the warehouse name to filter server-side for relevance.
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["transferHistory", warehouseId, warehouse?.name],
    queryFn: async () => {
      const response = await getAuditLogs({
        limit: 100,
        module: "StockTransfer",
        ...(warehouse?.name ? { search: warehouse.name } : {}),
      });
      return response.data;
    },
    enabled: !!warehouseId && !!warehouse?.name,
  });

  const allLogs = responseData?.data?.logs || [];

  // Additional client-side filter: ensure logs actually involve this warehouse
  // by checking the metadata fields the stockTransfer.service populates.
  const transferLogs = useMemo(() => {
    return allLogs.filter((log) => {
      const meta = log.metadata || {};
      const desc = log.description || "";
      return (
        meta.sourceWarehouseId === warehouseId ||
        meta.destinationWarehouseId === warehouseId ||
        desc.includes(warehouse?.name)
      );
    });
  }, [allLogs, warehouseId, warehouse?.name]);

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getDirectionBadge = (log) => {
    const meta = log.metadata || {};
    if (meta.sourceWarehouseId === warehouseId) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border text-red-700 bg-red-50 border-red-200">
          ↑ Outgoing
        </span>
      );
    }
    if (meta.destinationWarehouseId === warehouseId) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border text-emerald-700 bg-emerald-50 border-emerald-200">
          ↓ Incoming
        </span>
      );
    }
    return null;
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: "Stock", path: "/stock-management" },
      { label: warehouse?.name || "Warehouse", path: `/stock/${warehouseId}` },
      { label: "Transfer History" },
    ],
    [warehouse?.name, warehouseId],
  );

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowRightLeft className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Transfer History
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                All stock transfers involving {warehouse?.name || "this warehouse"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Mobile View */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading transfer history...</div>
            ) : isError ? (
              <div className="p-8 text-center text-red-500">Failed to load transfer history.</div>
            ) : transferLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <History className="w-8 h-8 text-gray-300 mb-2" />
                No transfer history found.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transferLogs.map((log) => (
                  <div key={log._id} className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getDirectionBadge(log)}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border text-blue-700 bg-blue-50 border-blue-200 capitalize">
                          {log.metadata?.transferType || "—"}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleRow(log._id)}
                        className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                      >
                        {expandedRows.has(log._id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-800">{log.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-wrap">
                      <span className="font-medium">{log.userId?.name || "System"}</span>
                      <span>·</span>
                      <span>{formatDateTime(log.timestamp)}</span>
                    </div>
                    {expandedRows.has(log._id) && (
                      <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500 block">From</span>
                            <span className="font-medium text-gray-900">{log.metadata?.sourceWarehouseName || "—"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">To</span>
                            <span className="font-medium text-gray-900">{log.metadata?.destinationWarehouseName || "—"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Quantity</span>
                            <span className="font-medium text-gray-900">{log.metadata?.transferredQuantity || "—"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Type</span>
                            <span className="font-medium text-gray-900 capitalize">{log.metadata?.transferType || "—"}</span>
                          </div>
                        </div>
                        {log.metadata?.notes && (
                          <p className="text-xs text-gray-600 italic border-t border-gray-200 pt-2">
                            Note: {log.metadata.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-3 min-w-[160px]">Date</th>
                  <th className="px-4 py-3">Direction</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">From → To</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      Loading transfer history...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-red-500">
                      Failed to load transfer history.
                    </td>
                  </tr>
                ) : transferLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                      <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      No transfer history found for this warehouse.
                    </td>
                  </tr>
                ) : (
                  transferLogs.map((log) => (
                    <React.Fragment key={log._id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="px-4 py-3">{getDirectionBadge(log)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border text-blue-700 bg-blue-50 border-blue-200 capitalize">
                            {log.metadata?.transferType || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          <span className="font-medium">{log.metadata?.sourceWarehouseName || "—"}</span>
                          <span className="text-gray-400 mx-2">→</span>
                          <span className="font-medium">{log.metadata?.destinationWarehouseName || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {log.metadata?.transferredQuantity || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {log.userId?.name || "System"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleRow(log._id)}
                            className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                          >
                            {expandedRows.has(log._id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </td>
                      </tr>
                      {expandedRows.has(log._id) && (
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <td colSpan="7" className="px-4 py-3">
                            <div className="flex flex-col gap-2 p-2">
                              <p className="text-sm text-gray-700">{log.description}</p>
                              {log.metadata?.notes && (
                                <p className="text-sm text-gray-600 italic">
                                  Note: {log.metadata.notes}
                                </p>
                              )}
                              {log.changes && (
                                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm overflow-x-auto mt-1">
                                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <FileCode2 size={14} /> Changes
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-[10px] text-gray-500 mb-1">BEFORE</div>
                                      <pre className="text-xs text-red-600 bg-red-50/50 p-2 rounded whitespace-pre-wrap font-mono">
                                        {JSON.stringify(log.changes.before, null, 2)}
                                      </pre>
                                    </div>
                                    <div>
                                      <div className="text-[10px] text-gray-500 mb-1">AFTER</div>
                                      <pre className="text-xs text-emerald-600 bg-emerald-50/50 p-2 rounded whitespace-pre-wrap font-mono">
                                        {JSON.stringify(log.changes.after, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
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
        </div>
      </div>
    </div>
  );
};

export default TransferHistoryPage;
