import React, { useState } from "react";
import { useCreditHistory } from "@/api/hooks/customer";
import { useSettings } from "@/context/SettingsContext";
import Pagination from "@/components/ui/Pagination";
import ValueSkeleton from "@/components/ui/ValueSkeleton";

const CreditHistoryTable = ({ customerId }) => {
    const [page, setPage] = useState(1);
    const { formatCurrency, formatDate } = useSettings();
    const { data: historyData, isLoading } = useCreditHistory(customerId, {
        page,
        limit: 10,
    });

    const history = historyData?.data?.history || [];
    const total = historyData?.data?.total || 0;
    const totalPages = Math.ceil(total / 10);

    if (isLoading) {
        return <ValueSkeleton width="w-full" height="h-32" />;
    }

    if (history.length === 0) {
        return (
            <p className="text-gray-500 text-center py-4">
                No credit history found.
            </p>
        );
    }

    return (
        <div className="w-full">
            {/* Mobile View (Cards) */}
            <div className="sm:hidden space-y-3">
                {history.map((item) => (
                    <div key={item._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.type === "Credit"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {item.type}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatDate(item.date)}
                                </span>
                            </div>
                            <span className="font-medium text-gray-900 text-sm">
                                {formatCurrency(item.amount)}
                            </span>
                        </div>
                        <div className="text-sm font-medium text-gray-800 mb-1">
                            {item.reason}
                        </div>
                        <div className="text-xs text-gray-600 break-words mb-2">
                            {item.description}
                        </div>
                        <div className="text-xs text-gray-400">
                            Processed by: {item.createdBy?.name || "System"}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reason
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Processed By
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {history.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    {formatDate(item.date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${item.type === "Credit"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatCurrency(item.amount)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 break-words">
                                    {item.reason}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 break-words">
                                    {item.description}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {item.createdBy?.name || "System"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        isLoading={isLoading}
                        totalItems={total}
                    />
                </div>
            )}
        </div>
    );
};

export default CreditHistoryTable;
