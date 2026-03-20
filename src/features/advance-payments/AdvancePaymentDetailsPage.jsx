import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Trash2,
    DollarSign,
    CheckCircle2,
    RotateCcw,
    User,
    Phone,
    Calendar,
    CreditCard,
    Clipboard,
    PieChart,
    HandCoins,
    FileText,
    PlusCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import CollapsibleCard from "@/components/ui/CollapsibleCard";
import DataField from "@/components/ui/DataField";
import StatusBadge from "@/components/ui/StatusBadge";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import EntityAuditLog from "@/components/ui/EntityAuditLog";
import {
    useAdvancePayment,
    useDeleteAdvancePayment,
} from "@/api/hooks/advancePayment";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";
import { showErrorToast } from "@/utils/notifications";
import SettleAdvanceModal from "./SettleAdvanceModal";
import RefundAdvanceModal from "./RefundAdvanceModal";
import AddToAdvanceModal from "./AddToAdvanceModal";

const AdvancePaymentDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const { formatCurrency, formatDate } = useSettings();

    const { data: response, isLoading, isError, error } = useAdvancePayment(id);
    const deleteMutation = useDeleteAdvancePayment();

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        action: null,
        title: "",
        description: "",
    });
    const [isSettleOpen, setIsSettleOpen] = useState(false);
    const [isRefundOpen, setIsRefundOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    useEffect(() => {
        if (!hasPermission("ADVANCE_PAYMENT_VIEW_DETAILS")) {
            showErrorToast("You don't have permission to view advance payment details.");
            navigate("/advance-payments");
        }
    }, [hasPermission, navigate]);

    const adv = response?.data;

    // Amounts factoring in additions
    const addedAmount = useMemo(() => {
        return (adv?.additions || []).reduce((sum, a) => sum + (a.amount || 0), 0);
    }, [adv?.additions]);

    const totalAmount = useMemo(() => {
        return (adv?.amount || 0) + addedAmount;
    }, [adv?.amount, addedAmount]);

    const refundedAmount = useMemo(() => {
        return (adv?.refunds || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    }, [adv?.refunds]);

    const remainingAmount = useMemo(() => {
        return totalAmount - refundedAmount;
    }, [totalAmount, refundedAmount]);

    const refundPercentage = useMemo(() => {
        if (!totalAmount || totalAmount === 0) return 0;
        return Math.min(100, Math.round((refundedAmount / totalAmount) * 100));
    }, [totalAmount, refundedAmount]);

    const canSettle = adv?.status === "Pending" || adv?.status === "Partially Settled";
    const canRefund = adv?.status === "Pending" || adv?.status === "Partially Settled";
    const canAddMore = adv?.status === "Pending" || adv?.status === "Partially Settled";
    const hasActions = canSettle || canRefund || canAddMore || hasPermission("ADVANCE_PAYMENT_DELETE");

    const handleOpenConfirmation = (action) => {
        const actions = {
            delete: {
                title: "Confirm Deletion",
                description: `Are you sure you want to delete this advance payment (${adv?.advanceId})? This can only be done on the same day. All associated transactions will be removed and balances restored.`,
            },
        };
        setConfirmModal({ isOpen: true, action, ...actions[action] });
    };

    const handleConfirm = () => {
        if (confirmModal.action === "delete") {
            deleteMutation.mutate(id, {
                onSuccess: () => navigate("/advance-payments"),
            });
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    if (isError) {
        return (
            <div className="h-full flex flex-col justify-center items-center p-4">
                <div className="bg-[var(--color-danger-light)] border border-[var(--color-danger-light)] rounded-lg p-6 max-w-md">
                    <h3 className="text-lg font-semibold text-[var(--color-danger)] mb-2">
                        Error Loading Advance Payment
                    </h3>
                    <p className="text-[var(--color-danger)] mb-4">{error.message}</p>
                    <Button
                        onClick={() => navigate("/advance-payments")}
                        variant="secondary"
                        size="sm"
                    >
                        Back to Advance Payments
                    </Button>
                </div>
            </div>
        );
    }

    if (!adv && !isLoading) return null;

    // === Financial Summary Component (reused in mobile + desktop sidebar) ===
    const FinancialSummaryContent = ({ showQuickActions = false }) => (
        <div className="space-y-4">
            {/* Visual Progress Bar */}
            {!isLoading && adv && (
                <div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
                        <span>Refunded: {refundPercentage}%</span>
                        <span>Remaining: {100 - refundPercentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${refundPercentage}%`,
                                backgroundColor:
                                    adv.status === "Settled"
                                        ? "var(--color-success)"
                                        : adv.status === "Refunded"
                                            ? "var(--color-primary)"
                                            : "var(--color-warning)",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Financial Rows */}
            <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Original Amount</span>
                    <span className="text-sm font-medium">
                        {isLoading ? (
                            <ValueSkeleton width="w-20" />
                        ) : (
                            formatCurrency(adv?.amount)
                        )}
                    </span>
                </div>
                {addedAmount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                            Added ({adv?.additions?.length || 0} top-ups)
                        </span>
                        <span className="text-sm font-medium text-amber-600">
                            +{formatCurrency(addedAmount)}
                        </span>
                    </div>
                )}
                {addedAmount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-700 font-medium">Effective Total</span>
                        <span className="text-sm font-semibold">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Refunded</span>
                    <span className="text-sm font-medium text-[var(--color-primary)]">
                        {isLoading ? (
                            <ValueSkeleton width="w-20" />
                        ) : (
                            formatCurrency(refundedAmount)
                        )}
                    </span>
                </div>
                {adv?.settledDate && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Settled Date</span>
                        <span className="text-sm font-medium">
                            {formatDate(adv.settledDate)}
                        </span>
                    </div>
                )}
                {adv?.settlementNote && (
                    <div className="py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600 block mb-1">Settlement Note</span>
                        <p className="text-sm text-amber-800 bg-amber-50 rounded-md px-3 py-2 whitespace-pre-wrap">
                            {adv.settlementNote}
                        </p>
                    </div>
                )}
            </div>

            <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                    <span className="font-bold text-gray-800">Remaining</span>
                    <span className="font-bold text-lg text-[var(--color-primary)]">
                        {isLoading ? (
                            <ValueSkeleton width="w-24" />
                        ) : (
                            formatCurrency(remainingAmount)
                        )}
                    </span>
                </div>
            </div>

            {/* Quick Actions — only in desktop sidebar */}
            {showQuickActions && !isLoading && (canSettle || canRefund || canAddMore) && (
                <div className="pt-2 border-t border-gray-200 space-y-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Quick Actions
                    </p>
                    <div className="flex flex-col gap-2">
                        {canAddMore && hasPermission("ADVANCE_PAYMENT_CREATE") && (
                            <Button
                                onClick={() => setIsAddOpen(true)}
                                variant="secondary"
                                size="sm"
                                className="w-full flex items-center justify-center"
                            >
                                <PlusCircle className="mr-2 w-4 h-4" />
                                Add More
                            </Button>
                        )}
                        {canSettle && hasPermission("ADVANCE_PAYMENT_SETTLE") && (
                            <Button
                                onClick={() => setIsSettleOpen(true)}
                                variant="primary"
                                size="sm"
                                className="w-full flex items-center justify-center"
                            >
                                <CheckCircle2 className="mr-2 w-4 h-4" />
                                Mark as Settled
                            </Button>
                        )}
                        {canRefund && hasPermission("ADVANCE_PAYMENT_REFUND") && (
                            <Button
                                onClick={() => setIsRefundOpen(true)}
                                variant="secondary"
                                size="sm"
                                className="w-full flex items-center justify-center"
                            >
                                <RotateCcw className="mr-2 w-4 h-4" />
                                Process Refund
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="pb-20 lg:pb-0">
            <div className="max-w-7xl mx-auto">
                {/* Back Navigation */}
                <Link
                    to="/advance-payments"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-3"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Advance Payments
                </Link>

                {/* Header — compact on mobile */}
                <motion.div
                    className="mb-4 sm:mb-6 p-4 sm:p-5 bg-white rounded-lg shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <div
                                    className="hidden sm:flex p-2 bg-[var(--color-primary)] rounded-lg flex-shrink-0"
                                    aria-hidden="true"
                                >
                                    <HandCoins className="text-white w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                                            {isLoading ? (
                                                <ValueSkeleton width="w-36 sm:w-48" height="h-7 sm:h-8" />
                                            ) : (
                                                adv?.advanceId || "Advance Payment Details"
                                            )}
                                        </h1>
                                        {!isLoading && adv?.status && (
                                            <StatusBadge status={adv.status} size="sm" />
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-xs sm:text-sm mt-0.5 truncate">
                                        {isLoading ? (
                                            <ValueSkeleton width="w-48 sm:w-64" height="h-4 sm:h-5" />
                                        ) : (
                                            <>
                                                <span className="sm:hidden">To {adv?.supplierName}</span>
                                                <span className="hidden sm:inline">Advance payment to {adv?.supplierName}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Action buttons — hidden on mobile (shown in sticky bar instead) */}
                        <div className="hidden sm:flex flex-wrap gap-2">
                            {canAddMore && hasPermission("ADVANCE_PAYMENT_CREATE") && (
                                <Button
                                    onClick={() => setIsAddOpen(true)}
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center"
                                    aria-label="Add More to Advance"
                                >
                                    <PlusCircle className="mr-2 w-4 h-4" aria-hidden="true" />
                                    Add More
                                </Button>
                            )}
                            {canSettle && hasPermission("ADVANCE_PAYMENT_SETTLE") && (
                                <Button
                                    onClick={() => setIsSettleOpen(true)}
                                    variant="primary"
                                    size="sm"
                                    className="flex items-center"
                                    aria-label="Settle Advance Payment"
                                >
                                    <CheckCircle2 className="mr-2 w-4 h-4" aria-hidden="true" />
                                    Settle
                                </Button>
                            )}
                            {canRefund && hasPermission("ADVANCE_PAYMENT_REFUND") && (
                                <Button
                                    onClick={() => setIsRefundOpen(true)}
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center"
                                    aria-label="Refund Advance Payment"
                                >
                                    <RotateCcw className="mr-2 w-4 h-4" aria-hidden="true" />
                                    Refund
                                </Button>
                            )}
                            {hasPermission("ADVANCE_PAYMENT_DELETE") && (
                                <Button
                                    onClick={() => handleOpenConfirmation("delete")}
                                    disabled={deleteMutation.isPending}
                                    isLoading={deleteMutation.isPending}
                                    variant="danger"
                                    size="sm"
                                    className="flex items-center"
                                    aria-label="Delete Advance Payment"
                                >
                                    <Trash2 className="mr-2 w-4 h-4" aria-hidden="true" />
                                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Mobile Financial Summary — shown FIRST on mobile, hidden on desktop */}
                <div className="lg:hidden mb-4">
                    <CollapsibleCard
                        title="Financial Summary"
                        icon={<PieChart className="text-[var(--color-primary)]" />}
                        defaultOpen={true}
                        ariaLabel="Financial Summary Section"
                    >
                        <FinancialSummaryContent showQuickActions={false} />
                    </CollapsibleCard>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Payment Details Card */}
                        <CollapsibleCard
                            title="Payment Details"
                            icon={<DollarSign className="text-[var(--color-primary)]" />}
                            defaultOpen={true}
                            ariaLabel="Payment Details Section"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <DataField
                                    label="Supplier Name"
                                    value={adv?.supplierName}
                                    icon={User}
                                    loading={isLoading}
                                />
                                <DataField
                                    label="Supplier Phone"
                                    value={adv?.supplierPhone}
                                    icon={Phone}
                                    loading={isLoading}
                                />
                                <DataField
                                    label="Purpose"
                                    value={adv?.purpose}
                                    icon={Clipboard}
                                    loading={isLoading}
                                />
                                <DataField
                                    label="Payment Date"
                                    value={adv?.date}
                                    format="date"
                                    icon={Calendar}
                                    loading={isLoading}
                                />
                                <DataField
                                    label="Payment Method"
                                    value={adv?.paymentMethod}
                                    icon={CreditCard}
                                    loading={isLoading}
                                />
                                <DataField
                                    label="Account"
                                    value={
                                        adv?.accountId
                                            ? formatAccountLabel(adv.accountId)
                                            : null
                                    }
                                    icon={CreditCard}
                                    loading={isLoading}
                                />
                                <DataField
                                    label="Original Amount"
                                    value={adv?.amount}
                                    format="currency"
                                    loading={isLoading}
                                />
                            </div>
                            {adv?.notes && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-700">
                                            Notes
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{adv.notes}</p>
                                </div>
                            )}
                        </CollapsibleCard>

                        {/* Additions History Card — shows when there are additions */}
                        {adv?.additions && adv.additions.length > 0 && (
                            <CollapsibleCard
                                title={`Top-Up History (${adv.additions.length})`}
                                icon={<PlusCircle className="text-amber-500" />}
                                defaultOpen={true}
                                ariaLabel="Top-Up History Section"
                            >
                                <div className="space-y-3">
                                    {adv.additions.map((addition, index) => {
                                        const runningTotal = adv.amount + adv.additions
                                            .slice(0, index + 1)
                                            .reduce((sum, a) => sum + (a.amount || 0), 0);
                                        return (
                                            <div
                                                key={addition._id || index}
                                                className="p-3 bg-amber-50 rounded-lg border border-amber-200"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="font-semibold text-gray-800 text-sm">
                                                                Top-Up #{index + 1}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(addition.date)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            Via {addition.paymentMethod}
                                                            {addition.accountId &&
                                                                typeof addition.accountId === "object" &&
                                                                ` · ${formatAccountLabel(addition.accountId)}`}
                                                        </p>
                                                        {addition.note && (
                                                            <p className="text-xs text-gray-400 mt-1 italic truncate">
                                                                {addition.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-left sm:text-right flex sm:block items-center gap-3 sm:gap-0">
                                                        <span className="text-base sm:text-lg font-semibold text-amber-600">
                                                            +{formatCurrency(addition.amount)}
                                                        </span>
                                                        <div className="text-xs text-gray-400">
                                                            Total: {formatCurrency(runningTotal)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CollapsibleCard>
                        )}

                        {/* Refund History Card */}
                        <CollapsibleCard
                            title={`Refund History ${adv?.refunds?.length ? `(${adv.refunds.length})` : ""}`}
                            icon={<RotateCcw className="text-[var(--color-primary)]" />}
                            defaultOpen={true}
                            ariaLabel="Refund History Section"
                        >
                            {adv?.refunds && adv.refunds.length > 0 ? (
                                <div className="space-y-3">
                                    {adv.refunds.map((refund, index) => {
                                        const runningTotal = adv.refunds
                                            .slice(0, index + 1)
                                            .reduce((sum, r) => sum + (r.amount || 0), 0);
                                        return (
                                            <div
                                                key={refund._id || index}
                                                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="font-semibold text-gray-800 text-sm">
                                                                Refund #{index + 1}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(refund.date)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            Via {refund.paymentMethod}
                                                            {refund.accountId &&
                                                                typeof refund.accountId === "object" &&
                                                                ` · ${formatAccountLabel(refund.accountId)}`}
                                                        </p>
                                                        {refund.note && (
                                                            <p className="text-xs text-gray-400 mt-1 italic truncate">
                                                                {refund.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-left sm:text-right flex sm:block items-center gap-3 sm:gap-0">
                                                        <span className="text-base sm:text-lg font-semibold text-[var(--color-primary)]">
                                                            {formatCurrency(refund.amount)}
                                                        </span>
                                                        <div className="text-xs text-gray-400">
                                                            Total: {formatCurrency(runningTotal)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    <RotateCcw className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No refunds yet</p>
                                    {canRefund && hasPermission("ADVANCE_PAYMENT_REFUND") && (
                                        <Button
                                            onClick={() => setIsRefundOpen(true)}
                                            variant="secondary"
                                            size="sm"
                                            className="mt-3"
                                        >
                                            Process First Refund
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CollapsibleCard>
                    </div>

                    {/* Desktop Sidebar — hidden on mobile (shown above instead) */}
                    <div className="hidden lg:block space-y-4 sm:space-y-6">
                        <CollapsibleCard
                            title="Financial Summary"
                            icon={<PieChart className="text-[var(--color-primary)]" />}
                            defaultOpen={true}
                            ariaLabel="Financial Summary Section"
                        >
                            <FinancialSummaryContent showQuickActions={true} />
                        </CollapsibleCard>
                    </div>
                </div>

                {hasPermission("AUDIT_VIEW") && (
                    <div className="mt-6">
                        <EntityAuditLog moduleId={id} moduleName="AdvancePayment" />
                    </div>
                )}
            </div>

            {/* Mobile Sticky Bottom Action Bar */}
            {!isLoading && hasActions && (
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
                    {canAddMore && hasPermission("ADVANCE_PAYMENT_CREATE") && (
                        <Button
                            onClick={() => setIsAddOpen(true)}
                            variant="secondary"
                            size="sm"
                            className="flex-1 flex items-center justify-center"
                        >
                            <PlusCircle className="mr-1.5 w-4 h-4" />
                            Add
                        </Button>
                    )}
                    {canSettle && hasPermission("ADVANCE_PAYMENT_SETTLE") && (
                        <Button
                            onClick={() => setIsSettleOpen(true)}
                            variant="primary"
                            size="sm"
                            className="flex-1 flex items-center justify-center"
                        >
                            <CheckCircle2 className="mr-1.5 w-4 h-4" />
                            Settle
                        </Button>
                    )}
                    {canRefund && hasPermission("ADVANCE_PAYMENT_REFUND") && (
                        <Button
                            onClick={() => setIsRefundOpen(true)}
                            variant="secondary"
                            size="sm"
                            className="flex-1 flex items-center justify-center"
                        >
                            <RotateCcw className="mr-1.5 w-4 h-4" />
                            Refund
                        </Button>
                    )}
                    {hasPermission("ADVANCE_PAYMENT_DELETE") && (
                        <Button
                            onClick={() => handleOpenConfirmation("delete")}
                            disabled={deleteMutation.isPending}
                            isLoading={deleteMutation.isPending}
                            variant="danger"
                            size="sm"
                            className="flex items-center justify-center px-3"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}

            {/* Modals */}
            <SettleAdvanceModal
                isOpen={isSettleOpen}
                onClose={() => setIsSettleOpen(false)}
                advancePayment={adv}
                onSuccess={() => setIsSettleOpen(false)}
            />

            <RefundAdvanceModal
                isOpen={isRefundOpen}
                onClose={() => setIsRefundOpen(false)}
                advancePayment={adv}
                onSuccess={() => setIsRefundOpen(false)}
            />

            <AddToAdvanceModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                advancePayment={adv}
                onSuccess={() => setIsAddOpen(false)}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() =>
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                onConfirm={handleConfirm}
                title={confirmModal.title}
                message={confirmModal.description}
                confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
                type="danger"
            />
        </div>
    );
};

export default AdvancePaymentDetailsPage;
