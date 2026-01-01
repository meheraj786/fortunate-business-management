import { useState, useEffect, useCallback, useRef } from "react";

// Hook for managing form data
export const useFormData = (initialData) => {
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

  const initialFormDataState = {
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
      uploadedDocuments: [],
    },
    otherExpenses: {
      costs: [],
    }
  };

  const [formData, setFormData] = useState(initialFormDataState);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    if (initialData) {
      processLCData(initialData);
    } else {
      resetForm();
    }
  }, [initialData]);

  const processLCData = (lcData) => {
    const processedData = {
      basicInfo: {
        lcNumber: lcData.basicInfo?.lcNumber || "",
        lcOpeningDate: formatDateForInput(lcData.basicInfo?.lcOpeningDate),
        status: lcData.basicInfo?.status || "Draft",
        accountId: lcData.basicInfo?.accountId?._id || lcData.basicInfo?.accountId || "",
        supplierName: lcData.basicInfo?.supplierName || "",
        supplierCountry: lcData.basicInfo?.supplierCountry || "",
      },
      financialInfo: {
        lcAmountUsd: lcData.financialInfo?.lcAmountUsd || "",
        exchangeRate: lcData.financialInfo?.exchangeRate || "",
        lcAmountBdt: lcData.financialInfo?.lcAmountBdt || "",
        costs: processCosts(lcData.financialInfo?.costs || []),
      },
      productInfo: (lcData.productInfo || []).map((p) => ({
        ...p,
        id: productIdCounter.current++,
        quantityUnit: p.quantityUnit?._id || p.quantityUnit || "",
      })),
      shippingCustomsInfo: {
        portOfShipment: lcData.shippingCustomsInfo?.portOfShipment || "",
        expectedArrivalDate: formatDateForInput(lcData.shippingCustomsInfo?.expectedArrivalDate),
        costs: processCosts(lcData.shippingCustomsInfo?.costs || []),
      },
      agentTransportInfo: {
        costs: processCosts(lcData.agentTransportInfo?.costs || []),
      },
      documentsNotes: {
        note: lcData.documentsNotes?.note || "",
        uploadedDocuments: lcData.documentsNotes?.uploadedDocuments || [],
      },
      otherExpenses: {
        costs: processCosts(lcData.otherExpenses?.costs || []),
      }
    };
    setFormData(processedData);
  };

  const processCosts = (costs) => {
    return costs.map((cost) => ({
      ...cost,
      id: costIdCounter.current++,
      date: formatDateForInput(cost.date),
      accountId: cost.accountId?._id || cost.accountId,
    }));
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

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
      return { ...prev, [section]: { ...prev[section], costs: updatedCosts } };
    });
  }, []);

  const addCost = useCallback((section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], costs: [...(prev[section].costs || []), getNewCost()] },
    }));
  }, []);

  const removeCost = useCallback((section, id) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], costs: prev[section].costs.filter((cost) => cost.id !== id) },
    }));
  }, []);

  const validateForm = useCallback(() => {
    const { basicInfo, financialInfo, productInfo } = formData;
    if (!basicInfo.lcNumber.trim() || !basicInfo.accountId || !basicInfo.supplierName) return false;
    if (!financialInfo.lcAmountUsd || !financialInfo.exchangeRate) return false;
    if (productInfo.some((p) => !p.itemName.trim() || !p.quantity || !p.unitPriceUsd)) return false;
    return true;
  }, [formData]);

  const formatFormDataForSubmit = useCallback(() => {
    const dataToSend = JSON.parse(JSON.stringify(formData));

    const cleanCosts = (costs) => costs.map(({ id, ...c }) => c);

    if (dataToSend.financialInfo?.costs) {
      dataToSend.financialInfo.costs = cleanCosts(dataToSend.financialInfo.costs);
    }
    if (dataToSend.shippingCustomsInfo?.costs) {
      dataToSend.shippingCustomsInfo.costs = cleanCosts(dataToSend.shippingCustomsInfo.costs);
    }
    if (dataToSend.agentTransportInfo?.costs) {
      dataToSend.agentTransportInfo.costs = cleanCosts(dataToSend.agentTransportInfo.costs);
    }
     if (dataToSend.otherExpenses?.costs) {
      dataToSend.otherExpenses.costs = cleanCosts(dataToSend.otherExpenses.costs);
    }

    dataToSend.productInfo = dataToSend.productInfo.map(({ id, ...p }) => p);
    
    // Remove client-side only fields from uploadedDocuments
    if(dataToSend.documentsNotes.uploadedDocuments) {
        dataToSend.documentsNotes.uploadedDocuments = dataToSend.documentsNotes.uploadedDocuments.map(doc => {
            const { _id, ...rest } = doc; // Assuming _id is a client-side identifier for existing files
            return rest;
        });
    }


    return dataToSend;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormDataState);
    setUploadedFiles([]);
    productIdCounter.current = 0;
    costIdCounter.current = 0;
  }, []);

  return {
    formData, setFormData, uploadedFiles, setUploadedFiles, handleInputChange, handleProductChange,
    addProduct, removeProduct, setProductInfo, handleCostChange, addCost, removeCost,
    validateForm, formatFormDataForSubmit, resetForm
  };
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
