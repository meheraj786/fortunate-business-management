import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/utils/handle-error";
import * as api from "@/api/lc.api";
import toast from "react-hot-toast";

// Fetch paginated, sorted, and filtered LC summary
export const useLCSummary = (params) =>
  useQuery({
    queryKey: ["lcs", "summary", params],
    queryFn: async () => (await api.getLCSummary(params)).data,
    keepPreviousData: true,
  });

// Fetch LC counts by status
export const useLCCountsByStatus = () =>
  useQuery({
    queryKey: ["lcs", "counts"],
    queryFn: async () => (await api.getLCCountsByStatus()).data,
  });

// Fetch a single LC by ID
export const useLC = (id) =>
  useQuery({
    queryKey: ["lcs", id],
    queryFn: async () => (await api.getLCById(id)).data,
    enabled: !!id,
  });

// Fetch all completed LCs
export const useCompletedLCs = () =>
  useQuery({
    queryKey: ["lcs", "completed"],
    queryFn: async () => (await api.getCompletedLCs()).data,
  });

// Create a new LC
export const useCreateLC = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createLC,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lcs", "summary"] });
      qc.invalidateQueries({ queryKey: ["lcs", "counts"] });
    },
    onError: (error) => handleError(error, "Failed to create LC.", "lcError"),
  });
};

// Update an existing LC
export const useUpdateLC = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.updateLC(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lcs", "summary"] });
      qc.invalidateQueries({ queryKey: ["lcs", "counts"] });
      qc.invalidateQueries({ queryKey: ["lcs", id] });
    },
    onError: (error) => handleError(error, "Failed to update LC.", "lcError"),
  });
};

// Delete an LC
export const useDeleteLC = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteLC,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lcs"] });
      toast.success("LC deleted successfully.");
    },
    onError: (error) => handleError(error, "Failed to delete LC.", "lcError"),
  });
};


// Add an expense to an LC
export const useAddExpenseToLC = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addExpenseToLC,
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["lcs", variables.lcId] });
      qc.invalidateQueries({ queryKey: ["lcs", "summary"] }); // to update total cost
      toast.success("Cost added successfully!");
    },
    onError: (error) => handleError(error, "Failed to add cost.", "lcError"),
  });
};

// Export LC as PDF
export const useExportLC = (lcId, lcNumber) =>
  useMutation({
    mutationFn: () => api.exportLCAsPDF(lcId),
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LC-${lcNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("LC exported as PDF successfully!");
    },
    onError: (error) => handleError(error, "Failed to export LC.", "lcError"),
  });
