import { useState, useCallback } from "react";
import { showErrorToast } from "@/utils/notifications";
import api from "@/services/apiService";

export const useCustomerData = (id) => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomerData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/customer/get-customer/${id}`);
      if (response.data.success) {
        setCustomerData(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch customer data"
        );
      }
    } catch (error) {
      setError("Failed to load customer details. Please try again.");
      showErrorToast(error, "Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    customerData,
    loading,
    error,
    refetch: fetchCustomerData,
  };
};

export const useSalesData = (customerId) => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const fetchSales = useCallback(
    async (page = 1) => {
      if (!customerId) return;

      setLoading(true);

      try {
        const response = await api.get(
          `/sales/customer/${customerId}?page=${page}&limit=${pagination.limit}`
        );

        if (response.data.success) {
          const { sales, totalPages, currentPage, totalItems } =
            response.data.data;
          setSalesData(sales || []);
          setPagination((prev) => ({
            ...prev,
            currentPage,
            totalPages,
            totalItems,
          }));
        } else {
          throw new Error(
            response.data.message || "Failed to fetch sales data"
          );
        }
      } catch (error) {
        showErrorToast(error, "Failed to load sales data.");
      } finally {
        setLoading(false);
      }
    },
    [customerId, pagination.limit]
  );

  return {
    salesData,
    pagination,
    loading,
    fetchSales,
  };
};
