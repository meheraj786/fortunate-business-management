import { useState, useCallback } from 'react';

import api from '@/services/apiService';

const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/account/get-all-accounts");
      if (response.data.success) {
        setAccounts(response.data.data || []);
      } else {
        throw new Error("Failed to fetch accounts");
      }
    } catch (error) {
      handleError(error, "Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { accounts, loading, fetchAccounts };
};

export default useAccounts;
