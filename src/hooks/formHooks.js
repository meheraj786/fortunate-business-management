import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/services/apiService";
import toast from "react-hot-toast";

// Hook for managing form data
export const useFormData = (isEditMode, id, accounts = []) => {
  const productIdCounter = useRef(0);
  const costIdCounter = useRef(0);

  const getNewProduct = () => ({
    id: productIdCounter.current++,
    itemName: "",
    thickness: "",
    width: "",
    length: "",
    grade: "",
    quantity: "",
    quantityUnit: "",
    unitPriceUsd: "",
    totalValueUsd: "",
  });

  const getNewCost = () => ({
    id: costIdCounter.current++,
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    accountId: "",
  });

  const initialFormData = {
    basicInfo: {
      lcNumber: "",
      lcOpeningDate: new Date().toISOString().split("T")[0],
      status: "Draft",
      accountId: "",
      supplierName: "",
      supplierCountry: "",
    },
    financialInfo: {
      lcAmountUsd: "",
      exchangeRate: "",
      lcAmountBdt: "",
      lcMarginPaidBdt: "",
      costs: [],
    },
    productInfo: [getNewProduct()],
    shippingCustomsInfo: {
      portOfShipment: "",
      expectedArrivalDate: "",
      costs: [],
    },
    agentTransportInfo: {
      costs: [],
    },
    documentsNotes: {
      note: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fetch LC data for edit mode
  useEffect(() => {
    if (isEditMode && id && accounts.length > 0) {
      fetchLCData();
    }
  }, [isEditMode, id, accounts]);

  const fetchLCData = async () => {
    try {
      const response = await api.get(`/lc/get-lc/${id}`);
      const lcData = response.data.data;
      processLCData(lcData);
    } catch (error) {
      console.error("Failed to fetch LC data:", error);
      toast.error("Failed to load LC data for editing");
    }
  };

  const processLCData = (lcData) => {
    // Processing logic from original LCForm
    const processedData = {
      basicInfo: {
        lcNumber: lcData.basicInfo?.lcNumber || "",
        lcOpeningDate: formatDateForInput(lcData.basicInfo?.lcOpeningDate),
        status: lcData.basicInfo?.status || "Draft",
        accountId:
          lcData.basicInfo?.accountId?._id || lcData.basicInfo?.accountId || "",
        supplierName: lcData.basicInfo?.supplierName || "",
        supplierCountry: lcData.basicInfo?.supplierCountry || "",
      },
      financialInfo: {
        lcAmountUsd: lcData.financialInfo?.lcAmountUsd || "",
        exchangeRate: lcData.financialInfo?.exchangeRate || "",
        lcAmountBdt: lcData.financialInfo?.lcAmountBdt || "",
        lcMarginPaidBdt: lcData.financialInfo?.lcMarginPaidBdt || "",
        costs: processCosts(lcData.financialInfo?.costs || [], "financialInfo"),
      },
      productInfo: (lcData.productInfo || []).map((p) => ({
        id: productIdCounter.current++,
        itemName: p.itemName || "",
        thickness: p.thickness || p.specification?.thickness_mm || "",
        width: p.width || p.specification?.width_mm || "",
        length: p.length || p.specification?.length_mm || "",
        grade: p.grade || p.specification?.grade || "",
        quantity: p.quantity || p.quantityValue || "",
        quantityUnit: p.quantityUnit?._id || p.quantityUnit || "",
        unitPriceUsd: p.unitPriceUsd || "",
        totalValueUsd: p.totalValueUsd || "",
      })),
      shippingCustomsInfo: {
        portOfShipment: lcData.shippingCustomsInfo?.portOfShipment || "",
        expectedArrivalDate: formatDateForInput(
          lcData.shippingCustomsInfo?.expectedArrivalDate
        ),
        costs: processCosts(
          lcData.shippingCustomsInfo?.costs || [],
          "shippingCustomsInfo"
        ),
      },
      agentTransportInfo: {
        costs: processCosts(
          lcData.agentTransportInfo?.costs || [],
          "agentTransportInfo"
        ),
      },
      documentsNotes: {
        note:
          lcData.documentsNotes?.note || lcData.documentsNotes?.remarks || "",
      },
    };

    setFormData(processedData);
  };

  const processCosts = (costs, section) => {
    return costs.map((cost) => ({
      ...cost,
      id: costIdCounter.current++,
      date: formatDateForInput(cost.date),
    }));
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Form handlers
  const handleInputChange = useCallback((section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, []);

  const handleProductChange = useCallback((id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      productInfo: prev.productInfo.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  }, []);

  const addProduct = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      productInfo: [...prev.productInfo, getNewProduct()],
    }));
  }, []);

  const removeProduct = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      productInfo: prev.productInfo.filter((p) => p.id !== id),
    }));
  }, []);

  const setProductInfo = useCallback((newProductInfo) => {
    setFormData((prev) => ({ ...prev, productInfo: newProductInfo }));
  }, []);

  const handleCostChange = useCallback((section, id, field, value) => {
    setFormData((prev) => {
      const updatedCosts = prev[section].costs.map((cost) =>
        cost.id === id ? { ...cost, [field]: value } : cost
      );

      if (field === "paymentMethod") {
        const targetCost = updatedCosts.find((c) => c.id === id);
        if (targetCost) targetCost.accountId = "";
      }

      return {
        ...prev,
        [section]: { ...prev[section], costs: updatedCosts },
      };
    });
  }, []);

  const addCost = useCallback((section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        costs: [...(prev[section].costs || []), getNewCost()],
      },
    }));
  }, []);

  const removeCost = useCallback((section, id) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        costs: prev[section].costs.filter((cost) => cost.id !== id),
      },
    }));
  }, []);

  // Validation
  const validateForm = useCallback(() => {
    const { basicInfo, financialInfo, productInfo } = formData;

    // Basic info validation
    if (
      !basicInfo.lcNumber.trim() ||
      !basicInfo.accountId ||
      !basicInfo.supplierName
    ) {
      return false;
    }

    // Financial info validation
    if (!financialInfo.lcAmountUsd || !financialInfo.exchangeRate) {
      return false;
    }

    // Product info validation
    if (
      productInfo.some(
        (p) => !p.itemName.trim() || !p.quantity || !p.unitPriceUsd
      )
    ) {
      return false;
    }

    return true;
  }, [formData]);

  // Format for submission
  const formatFormDataForSubmit = useCallback(() => {
    const dataToSend = JSON.parse(JSON.stringify(formData));

    // Handle LC Margin Paid as a cost
    if (dataToSend.financialInfo.lcMarginPaidBdt) {
      dataToSend.financialInfo.costs.push({
        name: "LC Margin Paid",
        amount: dataToSend.financialInfo.lcMarginPaidBdt,
        date: dataToSend.basicInfo.lcOpeningDate,
        paymentMethod: "Bank",
        accountId: dataToSend.basicInfo.accountId,
      });
    }
    delete dataToSend.financialInfo.lcMarginPaidBdt;

    // Remove client-side IDs
    dataToSend.productInfo = dataToSend.productInfo.map(({ id, ...p }) => p);
    ["financialInfo", "shippingCustomsInfo", "agentTransportInfo"].forEach(
      (section) => {
        if (dataToSend[section]?.costs) {
          dataToSend[section].costs = dataToSend[section].costs.map(
            ({ id, ...c }) => c
          );
        }
      }
    );

    return dataToSend;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setUploadedFiles([]);
    productIdCounter.current = 0;
    costIdCounter.current = 0;
  }, []);

  return {
    formData,
    uploadedFiles,
    setUploadedFiles,
    handleInputChange,
    handleProductChange,
    addProduct,
    removeProduct,
    setProductInfo,
    handleCostChange,
    addCost,
    removeCost,
    validateForm,
    formatFormDataForSubmit,
    resetForm,
  };
};

// Hook for fetching units
export const useUnits = () => {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/unit/get");
      setUnits(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch units:", error);
      toast.error("Failed to load units");
    } finally {
      setIsLoading(false);
    }
  };

  return { units, isLoading, refetch: fetchUnits };
};

// Hook for fetching accounts
export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/account/get-all-accounts");
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast.error("Failed to load bank accounts");
    } finally {
      setIsLoading(false);
    }
  };

  return { accounts, isLoading, refetch: fetchAccounts };
};

// Hook for cost management
export const useCostManagement = () => {
  const costIdCounter = useRef(0);

  const getNewCost = useCallback(
    () => ({
      id: costIdCounter.current++,
      name: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "Cash",
      accountId: "",
    }),
    []
  );

  return { getNewCost };
};
