import React, { useState } from "react";
import FormDialog from "@/components/ui/FormDialog";
import { useSettleAdvancePayment } from "@/api/hooks/advancePayment";
import { useSettings } from "@/context/SettingsContext";

const SettleAdvanceModal = ({ isOpen, onClose, advancePayment, onSuccess }) => {
    const { formatCurrency } = useSettings();
    const settleMutation = useSettleAdvancePayment();
    const [settlementNote, setSettlementNote] = useState("");

    if (!advancePayment) return null;

    // Include additions in the calculation
    const addedAmount = (advancePayment.additions || []).reduce(
        (sum, a) => sum + (a.amount || 0),
        0,
    );
    const totalAmount = advancePayment.amount + addedAmount;
    const refundedAmount = (advancePayment.refunds || []).reduce(
        (sum, r) => sum + (r.amount || 0),
        0,
    );
    const remainingAmount = totalAmount - refundedAmount;
    const hasRemaining = remainingAmount > 0.01;

    const handleSubmit = () => {
        const data = { settledDate: new Date().toISOString() };
        if (hasRemaining) {
            data.settlementNote = settlementNote.trim();
        }
        settleMutation.mutate(
            { id: advancePayment._id, data },
            {
                onSuccess: () => {
                    setSettlementNote("");
                    onSuccess();
                },
            },
        );
    };

    const canSubmit = !hasRemaining || settlementNote.trim().length > 0;

    return (
        <FormDialog
            open={isOpen}
            onClose={() => {
                setSettlementNote("");
                onClose();
            }}
            title="Settle Advance Payment"
            primaryButtonText={
                settleMutation.isPending ? "Settling..." : "Confirm Settlement"
            }
            secondaryButtonText="Cancel"
            onSubmit={handleSubmit}
            isSubmitting={settleMutation.isPending}
            isPrimaryButtonDisabled={!canSubmit}
        >
            <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 text-sm font-medium mb-2">
                        Settling this advance means the supplier has delivered the goods.
                    </p>
                    <p className="text-green-600 text-xs">
                        No money will be moved. The advance payment will be marked as completed.
                    </p>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Advance ID</span>
                        <span className="font-medium">{advancePayment.advanceId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Supplier</span>
                        <span className="font-medium">{advancePayment.supplierName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Original Amount</span>
                        <span className="font-medium">
                            {formatCurrency(advancePayment.amount)}
                        </span>
                    </div>
                    {addedAmount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Added (Top-ups)</span>
                            <span className="font-medium text-amber-600">
                                +{formatCurrency(addedAmount)}
                            </span>
                        </div>
                    )}
                    {refundedAmount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total Refunded</span>
                            <span className="font-medium text-blue-600">
                                {formatCurrency(refundedAmount)}
                            </span>
                        </div>
                    )}
                    <hr className="border-gray-200" />
                    <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Effective Cost</span>
                        <span className="font-bold text-gray-800">
                            {formatCurrency(remainingAmount)}
                        </span>
                    </div>
                </div>

                {/* Settlement note — required when remaining > 0 */}
                {hasRemaining && (
                    <div className="space-y-2">
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-amber-800 text-xs font-medium">
                                This advance has a remaining amount of{" "}
                                <span className="font-bold">{formatCurrency(remainingAmount)}</span>.
                                Please describe what it was used for (e.g., which product or service was purchased).
                            </p>
                        </div>
                        <div>
                            <label
                                htmlFor="settlement-note"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Settlement Note <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="settlement-note"
                                value={settlementNote}
                                onChange={(e) => setSettlementNote(e.target.value)}
                                placeholder="e.g., Purchased 50 bags of cement for construction project"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] resize-none"
                            />
                        </div>
                    </div>
                )}
            </div>
        </FormDialog>
    );
};

export default SettleAdvanceModal;
