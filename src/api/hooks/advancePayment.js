import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/advancePayment.api";
import { useApiMutation } from "@/hooks/useApiMutation";

// List with pagination/filters
export const useAdvancePayments = (params) =>
    useQuery({
        queryKey: ["advancePayments", params],
        queryFn: async () => (await api.getAllAdvancePayments(params)).data,
        keepPreviousData: true,
    });

// Single advance payment details
export const useAdvancePayment = (id) =>
    useQuery({
        queryKey: ["advancePayments", id],
        queryFn: async () => (await api.getAdvancePaymentById(id)).data,
        enabled: !!id,
    });

// Stats
export const useAdvancePaymentStats = () =>
    useQuery({
        queryKey: ["advancePayments", "stats"],
        queryFn: async () => (await api.getAdvancePaymentStats()).data,
    });

// Create
export const useCreateAdvancePayment = () => {
    const qc = useQueryClient();
    return useApiMutation({
        mutationFn: api.createAdvancePayment,
        successMessage: "Advance payment created successfully!",
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["advancePayments"] });
            qc.invalidateQueries({ queryKey: ["accounts"] });
            qc.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
};

// Settle
export const useSettleAdvancePayment = () => {
    const qc = useQueryClient();
    return useApiMutation({
        mutationFn: ({ id, data }) => api.settleAdvancePayment(id, data),
        successMessage: "Advance payment settled successfully!",
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["advancePayments"] });
        },
    });
};

// Refund
export const useRefundAdvancePayment = () => {
    const qc = useQueryClient();
    return useApiMutation({
        mutationFn: ({ id, data }) => api.refundAdvancePayment(id, data),
        successMessage: "Refund processed successfully!",
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["advancePayments"] });
            qc.invalidateQueries({ queryKey: ["accounts"] });
            qc.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
};

// Add More (Top Up)
export const useAddToAdvancePayment = () => {
    const qc = useQueryClient();
    return useApiMutation({
        mutationFn: ({ id, data }) => api.addToAdvancePayment(id, data),
        successMessage: "Amount added to advance payment successfully!",
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["advancePayments"] });
            qc.invalidateQueries({ queryKey: ["accounts"] });
            qc.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
};

// Delete
export const useDeleteAdvancePayment = () => {
    const qc = useQueryClient();
    return useApiMutation({
        mutationFn: api.deleteAdvancePayment,
        successMessage: "Advance payment deleted successfully!",
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["advancePayments"] });
            qc.invalidateQueries({ queryKey: ["accounts"] });
            qc.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
};
