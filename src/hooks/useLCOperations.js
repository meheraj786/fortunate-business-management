import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/services/apiService";

export const useLCData = (id) => {
  const [lcData, setLcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLCData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/lc/get-lc/${id}`, { timeout: 10000 });
      if (response.data.success) {
        setLcData(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch LC data");
      }
    } catch (error) {
      console.error("Failed to fetch LC:", error);
      setError("Failed to load LC details. Please try again.");
      toast.error("Failed to load LC details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined || value === "") return "-";
    return Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  }, []);

  return {
    lcData,
    loading,
    error,
    refetch: fetchLCData,
    formatNumber,
    formatDate,
  };
};

export const useExportLC = (id) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportLC = useCallback(async () => {
    if (!id) return;

    setIsExporting(true);
    const toastId = toast.loading("Exporting LC...");

    try {
      const response = await api.get(`/lc/export-lc/${id}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LC-Details-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF exported successfully!", { id: toastId });
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.message || "Failed to export PDF.", {
        id: toastId,
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  }, [id]);

  return { exportLC, isExporting };
};

export const useDeleteLC = (id) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteLC = useCallback(async () => {
    if (!id) return;

    setIsDeleting(true);
    const toastId = toast.loading("Deleting LC...");

    try {
      const response = await api.delete(`/lc/delete-lc/${id}`);
      if (response.data.success) {
        toast.success("LC deleted successfully!", { id: toastId });
      } else {
        throw new Error(response.data.message || "Failed to delete LC");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete LC.", {
        id: toastId,
        duration: 5000,
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [id]);

  return { deleteLC, isDeleting };
};
