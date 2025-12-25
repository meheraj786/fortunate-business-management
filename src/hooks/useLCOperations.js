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

export const useExportLC = (id, lcNumber) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportLC = useCallback(async () => {
    if (!id) {
      toast.error("No LC ID provided");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Exporting LC...");

    try {
      console.log('Requesting PDF export for LC:', id);
      
      const response = await api.get(`/lc/export-lc/${id}`, {
        responseType: "blob",
      });

      console.log('Response received:', {
        status: response.status,
        contentType: response.headers['content-type'],
        dataType: response.data.constructor.name,
        dataSize: response.data.size
      });

      // Check if the response is actually an error (JSON) instead of a PDF
      const contentType = response.headers['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        console.log('Received JSON error response');
        // It's a JSON error response
        const text = await response.data.text();
        console.log('Error response text:', text);
        const errorData = JSON.parse(text);
        toast.error(errorData.error || errorData.message || "Invalid LC data", { 
          id: toastId,
          duration: 5000
        });
        setIsExporting(false);
        return;
      }

      // Check if blob size is suspiciously small (might be error JSON)
      if (response.data.size < 1000) {
        console.log('Warning: Very small blob received, might be an error');
        try {
          const text = await response.data.text();
          const errorData = JSON.parse(text);
          console.log('Small blob was actually error JSON:', errorData);
          toast.error(errorData.error || errorData.message || "Invalid LC data", { 
            id: toastId,
            duration: 5000
          });
          setIsExporting(false);
          return;
        } catch (e) {
          console.log('Small blob is valid PDF, proceeding...');
          // Not JSON, proceed with download
        }
      }

      // It's a PDF - proceed with download
      console.log('Creating download link for PDF');
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
      console.log('PDF download initiated successfully');
      
    } catch (error) {
      console.error("Export error:", error);
      
      // Handle axios errors
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response headers:', error.response.headers);
        
        // If it's a blob response type, we need to read it as text
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            console.log('Error blob text:', text);
            const errorData = JSON.parse(text);
            toast.error(errorData.error || errorData.message || "Failed to export PDF.", { 
              id: toastId,
              duration: 5000
            });
          } catch (parseError) {
            console.error('Failed to parse error blob:', parseError);
            toast.error("Failed to export PDF. Check console for details.", { 
              id: toastId,
              duration: 5000
            });
          }
        } else {
          const errorMsg = error.response.data?.error || 
                          error.response.data?.message || 
                          "Failed to export PDF.";
          console.log('Error message:', errorMsg);
          toast.error(errorMsg, { id: toastId, duration: 5000 });
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error("No response from server. Please check your connection.", { 
          id: toastId,
          duration: 5000
        });
      } else {
        console.error('Request setup error:', error.message);
        toast.error("Failed to export PDF. Please try again.", { 
          id: toastId,
          duration: 5000
        });
      }
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
