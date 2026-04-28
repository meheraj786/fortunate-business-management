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

// Quick-update LC status only
export const useUpdateLCStatus = (id) => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: (status) => api.updateLCStatus(id, status),
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
    mutationFn: async () => {
      const response = await api.exportLCAsPDF(lcId);

      // When the backend returns a non-PDF error (e.g. 400/500 JSON) but Axios
      // received it as a blob due to responseType: "blob", we need to detect it
      // and re-throw so the error toast shows the real message.
      const blob = response.data;
      if (blob instanceof Blob && blob.type && blob.type.includes("application/json")) {
        const text = await blob.text();
        let parsed;
        try { parsed = JSON.parse(text); } catch { /* not JSON */ }
        throw new Error(parsed?.message || parsed?.error || "PDF export failed.");
      }

      return response;
    },
    successMessage: "LC exported as PDF successfully!",
    onSuccess: (response) => {
      // Axios with responseType: "blob" returns the Blob inside response.data
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LC-${lcNumber || "Export"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the object URL asynchronously to allow the download to start
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    },
  });

