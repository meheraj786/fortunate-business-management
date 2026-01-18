import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/lc.api";
import { useApiMutation } from "@/hooks/useApiMutation";

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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  return useApiMutation({
    mutationFn: api.createLC,
    successMessage: "LC created successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lcs", "summary"] });
      qc.invalidateQueries({ queryKey: ["lcs", "counts"] });
    },
  });
};

// Update an existing LC
export const useUpdateLC = (id) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => api.updateLC(id, data),
    successMessage: "LC updated successfully!",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lcs", "summary"] });
      qc.invalidateQueries({ queryKey: ["lcs", "counts"] });
      qc.invalidateQueries({ queryKey: ["lcs", id] });
    },
  });
};

// Delete an LC
export const useDeleteLC = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteLC,
    successMessage: "LC deleted successfully.",
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lcs"] });
    },
  });
};

// Add an expense to an LC
export const useAddExpenseToLC = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.addExpenseToLC,
    successMessage: "Cost added successfully!",
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["lcs", variables.lcId] });
      qc.invalidateQueries({ queryKey: ["lcs", "summary"] }); // to update total cost
    },
  });
};

// Delete an LC document
export const useDeleteLCDocument = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ lcId, docId }) => api.deleteLCDocument(lcId, docId),
    successMessage: "Document deleted successfully.",
    onSuccess: (data, { lcId }) => {
      qc.invalidateQueries({ queryKey: ["lcs", lcId] });
    },
  });
};

// Export LC as PDF
export const useExportLC = (lcId, lcNumber) =>
  useApiMutation({
    mutationFn: () => api.exportLCAsPDF(lcId),
    successMessage: "LC exported as PDF successfully!",
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LC-${lcNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
