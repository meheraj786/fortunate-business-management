import { useState, useCallback } from "react";
import { handleError } from "@/utils/handle-error";
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
      setError("Failed to load LC details. Please try again.");
      handleError(error, "Failed to load LC details.");
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

export const useExportLC = (id, lcNumber) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportLC = useCallback(async () => {
    if (!id) {
      handleError(null, "No LC ID provided"); // Use handleError for client-side errors too
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Exporting LC...");

    try {
      
      const response = await api.get(`/lc/export-lc/${id}`, {
        responseType: "blob",
      });

      // Check if the response is actually an error (JSON) instead of a PDF
      const contentType = response.headers['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        handleError({ response: { data: errorData } }, "Invalid LC data");
        toast.dismiss(toastId);
        setIsExporting(false);
        return;
      }

      // Check if blob size is suspiciously small (might be error JSON)
      if (response.data.size < 1000) {
        try {
          const text = await response.data.text();
          const errorData = JSON.parse(text);
          handleError({ response: { data: errorData } }, "Invalid LC data");
          toast.dismiss(toastId);
          setIsExporting(false);
          return;
        } catch (e) {
          // Not JSON, proceed with download
        }
      }

      // It's a PDF - proceed with download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LC-Details-${lcNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF exported successfully!", { id: toastId });
      
    } catch (error) {
      handleError(error, "Failed to export PDF.");
      toast.dismiss(toastId);
    } finally {
      setIsExporting(false);
    }
  }, [id, lcNumber]);

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
      handleError(error, "Failed to delete LC.");
      toast.dismiss(toastId);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [id]);

  return { deleteLC, isDeleting };
};
