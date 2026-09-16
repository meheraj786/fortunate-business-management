import React from "react";
import { History, PackagePlus } from "lucide-react";
import { useProductRestockHistory } from "@/api/hooks/products";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import { useSettings } from "@/context/SettingsContext";

const formatQuantity = (value) => Number.isFinite(value) ? parseFloat(value.toFixed(3)) : value;

const RestockHistory = ({ warehouseId, productId, unit, initialQuantity }) => {
  const { formatDate } = useSettings();
  const { data, isLoading, isError } = useProductRestockHistory(warehouseId, productId, { limit: 50 });
  const restocks = data?.data?.restocks || [];
  return <section className="mt-6 rounded-lg bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2"><History size={20} className="text-[var(--color-primary)]" /><h2 className="text-lg font-semibold text-gray-800">Stock Receiving History</h2></div>
    {isLoading ? <div className="space-y-3"><ValueSkeleton width="w-full" /><ValueSkeleton width="w-4/5" /></div> : isError ? <p className="text-sm text-red-600">Could not load receiving history. Please try again.</p> : <><div className="mb-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{initialQuantity === null || initialQuantity === undefined ? "Opening quantity was not recorded for this existing product." : <>Opening quantity: <strong>{formatQuantity(initialQuantity)} {unit}</strong></>}</div>{restocks.length === 0 ? <div className="py-7 text-center text-sm text-gray-500"><PackagePlus className="mx-auto mb-2 text-gray-300" size={28} />No receiving records yet. New stock additions will appear here.</div> : <div className="space-y-3">{restocks.map((restock) => <article key={restock._id} className="rounded-lg border border-gray-100 p-3 sm:p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-semibold text-gray-900">+{formatQuantity(restock.quantityAdded)} {unit}</p><time className="text-xs text-gray-500">Received {formatDate(restock.receivedAt)}</time></div><p className="mt-1 text-sm text-gray-600">Balance: {formatQuantity(restock.quantityBefore)} → {formatQuantity(restock.quantityAfter)} {unit}</p>{restock.notes && <p className="mt-2 text-sm text-gray-600">{restock.notes}</p>}<p className="mt-2 text-xs text-gray-400">Recorded by {restock.performedBy?.name || "System user"}</p></article>)}</div>}</>}
  </section>;
};

export default RestockHistory;
