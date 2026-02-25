import React from "react";
import FormDialog from "@/components/ui/FormDialog";
import { useSettleAdvancePayment } from "@/api/hooks/advancePayment";
import { useSettings } from "@/context/SettingsContext";

const SettleAdvanceModal = ({ isOpen, onClose, advancePayment, onSuccess }) => {
    const { formatCurrency } = useSettings();
    const settleMutation = useSettleAdvancePayment();

    if (!advancePayment) return null;

    const refundedAmount = (advancePayment.refunds || []).reduce(
        (sum, r) => sum + (r.amount || 0),
        0,
    );
    const remainingAmount = advancePayment.amount - refundedAmount;

    const handleSubmit = () => {
        settleMutation.mutate(
            {
                id: advancePayment._id,
                data: { settledDate: new Date().toISOString() },
            },
            {
                onSuccess: () => onSuccess(),
            },
        );
    };

    return (
        <FormDialog
            open={isOpen}
            onClose={onClose}
            title="Settle Advance Payment"
            primaryButtonText={
                settleMutation.isPending ? "Settling..." : "Confirm Settlement"
            }
            secondaryButtonText="Cancel"
            onSubmit={handleSubmit}
            isSubmitting={settleMutation.isPending}
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
            </div>
        </FormDialog>
    );
};

export default SettleAdvanceModal;
