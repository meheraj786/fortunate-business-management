import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import FormSection from "../../components/common/FormSection";
import {
  Plus,
  Trash2,
  Save,
  X,
  FileText,
  DollarSign,
  Truck,
  User,
  Package,
  Clipboard,
  UploadCloud,
  Paperclip,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const InputField = ({
  label,
  type = "text",
  inputMode,
  value,
  onChange,
  required = false,
  placeholder = "",
  className = "",
  disabled = false,
}) => (
  <div className={`space-y-2 ${className}`}>
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option, index) => (
        <option
          key={option.value || option._id || index}
          value={option.value || option._id}
        >
          {option.label || option.name}
        </option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  rows = 3,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 resize-vertical"
    />
  </div>
);

const FileInput = ({ files, onFileChange, onFileRemove }) => {
  const fileInputRef = useRef(null);

  const handleLabelClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Documents
      </label>
      <div className="flex items-center justify-center w-full">
        <div
          onClick={handleLabelClick}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              Any format (PDF, Excel, Image, etc.)
            </p>
          </div>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-gray-800">Selected Files:</h4>
          <ul className="space-y-2">
            {Array.from(files).map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-100 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onFileRemove(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const LCForm = ({ onSave }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
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
      lcMarginPaidBdt: "", // Kept for input, but will be converted to a cost on submit
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
  const [units, setUnits] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    financialInfo: true,
    productInfo: true,
    shippingCustomsInfo: true,
    agentTransportInfo: true,
    documentsNotes: true,
  });
  const sectionRefs = useRef({});

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    api
      .get(`/unit/get`)
      .then((res) => setUnits(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load units");
      });

    api
      .get(`/account/get-all-accounts`)
      .then((res) => {
        setAccounts(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load bank accounts");
      });
  }, []);

  useEffect(() => {
    if (isEditMode && accounts.length > 0) {
      api
        .get(`/lc/get-lc/${id}`)
        .then((res) => {
          const lcData = res.data.data;

          const findAccountIdByName = (name) => {
            const account = accounts.find(acc => acc.accountName === name && acc.accountType === 'Bank');
            return account ? account._id : '';
          };

          // --- Process Costs ---
          const processSectionCosts = (sectionData, hardcodedCostMap) => {
            if (sectionData.costs && sectionData.costs.length > 0) {
              return sectionData.costs.map(c => ({...c, id: costIdCounter.current++}));
            }
            // Legacy fallback
            let costs = [];
            for (const [key, name] of Object.entries(hardcodedCostMap)) {
              if (sectionData[key]) {
                costs.push({
                  id: costIdCounter.current++,
                  name: name,
                  amount: sectionData[key],
                  date: formatDateForInput(lcData.basicInfo.lcOpeningDate),
                  paymentMethod: "Cash",
                  accountId: "",
                });
              }
            }
            const otherCosts = (sectionData.otherExpenses || []).map((e) => ({
              ...e,
              id: costIdCounter.current++,
              date: formatDateForInput(lcData.basicInfo.lcOpeningDate),
              paymentMethod: "Cash",
              accountId: e.accountId || "",
            }));
            return [...costs, ...otherCosts];
          }

          // --- Financial Info ---
          let marginPaidAmount = '';
          let financialCosts = [];
          if (lcData.financialInfo.costs && lcData.financialInfo.costs.length > 0) {
              const marginCost = lcData.financialInfo.costs.find(c => c.name === 'LC Margin Paid');
              if (marginCost) {
                  marginPaidAmount = marginCost.amount;
              }
              financialCosts = lcData.financialInfo.costs
                  .filter(c => c.name !== 'LC Margin Paid')
                  .map(c => ({...c, id: costIdCounter.current++, date: formatDateForInput(c.date)}));
          } else { // Legacy
              marginPaidAmount = lcData.financialInfo.lcMarginPaidBdt || '';
              financialCosts = processSectionCosts(lcData.financialInfo, { bankChargesBdt: "Bank Charges", insuranceCostBdt: "Insurance Cost" });
          }

          // --- Shipping & Customs Info ---
          const shippingCosts = processSectionCosts(lcData.shippingCustomsInfo, { customsDutyBdt: "Customs Duty", vatBdt: "VAT", aitBdt: "AIT" });
          
          // --- Agent & Transport Info ---
          const agentCosts = processSectionCosts(lcData.agentTransportInfo, { cnfAgentCommissionBdt: "C&F Agent Commission", indentingAgentCommissionBdt: "Indenting Agent Commission", transportCostBdt: "Transport Cost" });
          if (lcData.agentTransportInfo.cnfAgentName) {
            agentCosts.unshift({
              id: costIdCounter.current++,
              name: `C&F Agent Name: ${lcData.agentTransportInfo.cnfAgentName}`,
              amount: "0",
              date: formatDateForInput(lcData.basicInfo.lcOpeningDate),
              paymentMethod: "Cash",
              accountId: "",
            });
          }

          // --- Construct final processed data for state ---
          const processedData = {
            basicInfo: {
              lcNumber: lcData.basicInfo.lcNumber,
              lcOpeningDate: formatDateForInput(lcData.basicInfo.lcOpeningDate),
              status: lcData.basicInfo.status,
              accountId: lcData.basicInfo.accountId?._id || lcData.basicInfo.accountId || findAccountIdByName(lcData.basicInfo.bankName),
              supplierName: lcData.basicInfo.supplierName,
              supplierCountry: lcData.basicInfo.supplierCountry,
            },
            financialInfo: {
              lcAmountUsd: lcData.financialInfo.lcAmountUsd,
              exchangeRate: lcData.financialInfo.exchangeRate,
              lcAmountBdt: lcData.financialInfo.lcAmountBdt,
              lcMarginPaidBdt: marginPaidAmount,
              costs: financialCosts,
            },
            productInfo: (lcData.productInfo || []).map((p) => ({
              id: productIdCounter.current++,
              itemName: p.itemName,
              thickness: p.thickness || p.specification?.thickness_mm || '',
              width: p.width || p.specification?.width_mm || '',
              length: p.length || p.specification?.length_mm || '',
              grade: p.grade || p.specification?.grade || '',
              quantity: p.quantity || p.quantityValue || '',
              quantityUnit: p.quantityUnit?._id || p.quantityUnit || "",
              unitPriceUsd: p.unitPriceUsd,
              totalValueUsd: p.totalValueUsd,
            })),
            shippingCustomsInfo: {
              portOfShipment: lcData.shippingCustomsInfo.portOfShipment,
              expectedArrivalDate: formatDateForInput(
                lcData.shippingCustomsInfo?.expectedArrivalDate
              ),
              costs: shippingCosts,
            },
            agentTransportInfo: {
              costs: agentCosts,
            },
            documentsNotes: {
              note: lcData.documentsNotes.note || lcData.documentsNotes.remarks || "",
            },
          };

          setFormData(processedData);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to fetch LC data for editing.");
        });
    }
  }, [id, isEditMode, accounts]);

  useEffect(() => {
    const { lcAmountUsd, exchangeRate } = formData.financialInfo;
    if (lcAmountUsd && exchangeRate) {
      const bdtAmount = parseFloat(lcAmountUsd) * parseFloat(exchangeRate);
      handleInputChange("financialInfo", "lcAmountBdt", bdtAmount.toFixed(2));
    }
  }, [formData.financialInfo.lcAmountUsd, formData.financialInfo.exchangeRate]);

  useEffect(() => {
    const updatedProducts = formData.productInfo.map((product) => {
      const { quantity, unitPriceUsd } = product;
      if (quantity && unitPriceUsd) {
        const totalValue = parseFloat(quantity) * parseFloat(unitPriceUsd);
        return { ...product, totalValueUsd: totalValue.toFixed(2) };
      }
      return product;
    });

    if (JSON.stringify(updatedProducts) !== JSON.stringify(formData.productInfo)) {
      setFormData((prev) => ({ ...prev, productInfo: updatedProducts }));
    }
  }, [formData.productInfo]);

  const sections = [
    { id: "basicInfo", title: "Basic Information", icon: FileText },
    { id: "financialInfo", title: "Financial Information", icon: DollarSign },
    { id: "productInfo", title: "Product Information", icon: Package },
    { id: "shippingCustomsInfo", title: "Shipping & Customs", icon: Truck },
    { id: "agentTransportInfo", title: "Agent & Transport", icon: User },
    { id: "documentsNotes", title: "Documents & Notes", icon: Clipboard },
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleProductChange = (id, field, value) => {
    const updatedProducts = formData.productInfo.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setFormData((prev) => ({ ...prev, productInfo: updatedProducts }));
  };

  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      productInfo: [...prev.productInfo, getNewProduct()],
    }));
  };

  const removeProduct = (id) => {
    if (formData.productInfo.length > 1) {
      setFormData((prev) => ({
        ...prev,
        productInfo: prev.productInfo.filter((p) => p.id !== id),
      }));
    }
  };

  const handleCostChange = (section, id, field, value) => {
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
  };

  const addCost = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        costs: [...(prev[section].costs || []), getNewCost()],
      },
    }));
  };

  const removeCost = (section, id) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        costs: prev[section].costs.filter((cost) => cost.id !== id),
      },
    }));
  };

  const handleFileChange = (e) => {
    setUploadedFiles((prevFiles) => [...prevFiles, ...e.target.files]);
  };

  const handleFileRemove = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Deep copy to avoid mutating state, especially for nested objects
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
      // Remove the temporary field before sending
      delete dataToSend.financialInfo.lcMarginPaidBdt;

      // Clean up client-side IDs
      dataToSend.productInfo = dataToSend.productInfo.map(({ id, ...p }) => p);
      dataToSend.financialInfo.costs = dataToSend.financialInfo.costs.map(({ id, ...c }) => c);
      dataToSend.shippingCustomsInfo.costs = dataToSend.shippingCustomsInfo.costs.map(({ id, ...c }) => c);
      dataToSend.agentTransportInfo.costs = dataToSend.agentTransportInfo.costs.map(({ id, ...c }) => c);
      
      const payload = new FormData();
      payload.append("lc_data", JSON.stringify(dataToSend));
      uploadedFiles.forEach((file) => {
        payload.append("documents", file);
      });

      if (isEditMode) {
        await api.patch(`/lc/update-lc/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("LC Updated");
        navigate(`/lc-details/${id}`);
      } else {
        await api.post(`/lc/create-lc`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("LC Created");
        navigate("/lc-management");
      }

      if (onSave) onSave(formData);
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} LC`);
      console.error(error);
    }
  };

  const sectionAnimation = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1, transition: { duration: 0.3 } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.3 } },
  };

  const renderCosts = (section) => (
    <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
      <h4 className="font-semibold text-gray-800">Costs</h4>
      <AnimatePresence>
        {(formData[section].costs || []).map((cost, index) => (
          <motion.div
            key={cost.id}
            {...sectionAnimation}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start p-3 bg-gray-100 rounded-lg"
          >
            <div className="sm:col-span-3">
              <InputField
                label={`Cost Name ${index + 1}`}
                value={cost.name}
                onChange={(v) => handleCostChange(section, cost.id, "name", v)}
                placeholder="e.g., Port Fees"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <InputField
                label="Amount (BDT)"
                type="number"
                value={cost.amount}
                onChange={(v) => handleCostChange(section, cost.id, "amount", v)}
                placeholder="e.g., 5000"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <InputField
                label="Date"
                type="date"
                value={cost.date}
                onChange={(v) => handleCostChange(section, cost.id, "date", v)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <SelectField
                label="Payment Method"
                value={cost.paymentMethod}
                onChange={(v) => handleCostChange(section, cost.id, "paymentMethod", v)}
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "Bank", label: "Bank" },
                  { value: "Mobile Banking", label: "Mobile Banking" },
                ]}
                required
              />
            </div>
            <div className="sm:col-span-2">
              {(cost.paymentMethod === "Bank" || cost.paymentMethod === "Mobile Banking") && (
                <SelectField
                  label="Select Account"
                  value={cost.accountId}
                  onChange={(v) => handleCostChange(section, cost.id, "accountId", v)}
                  options={accounts
                    .filter((acc) => acc.accountType === cost.paymentMethod)
                    .map((acc) => ({ value: acc._id, label: acc.accountName }))}
                  placeholder="Choose account"
                  required
                />
              )}
            </div>
            <div className="sm:col-span-1 flex items-end justify-end h-full">
              <button
                type="button"
                onClick={() => removeCost(section, cost.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors mt-6"
                title="Remove Cost"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => addCost(section)}
        className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 hover:border-gray-500 hover:text-gray-800 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Cost</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Letter of Credit" : "Create New Letter of Credit"}
              </h1>
              <p className="text-gray-600">
                Fill in the details below to {isEditMode ? "update" : "create"} a new LC
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
                          <Link to={isEditMode ? `/lc-details/${id}` : "/lc-management"}>
                            <button
                              type="button"
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </Link>              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isEditMode ? "Update LC" : "Save LC"}</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.map((section) => (
            <FormSection
              key={section.id}
              title={section.title}
              icon={section.icon}
              isExpanded={!!expandedSections[section.id]}
              onToggle={() => toggleSection(section.id)}
              sectionRef={(el) => (sectionRefs.current[section.id] = el)}
            >
              {section.id === "basicInfo" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    label="LC Number"
                    value={formData.basicInfo.lcNumber}
                    onChange={(v) => handleInputChange("basicInfo", "lcNumber", v)}
                    required
                  />
                  <InputField
                    label="LC Opening Date"
                    type="date"
                    value={formData.basicInfo.lcOpeningDate}
                    onChange={(v) => handleInputChange("basicInfo", "lcOpeningDate", v)}
                    required
                  />
                  <SelectField
                    label="Status"
                    value={formData.basicInfo.status}
                    onChange={(v) => handleInputChange("basicInfo", "status", v)}
                    options={[
                      { value: "Draft", label: "Draft" },
                      { value: "Active", label: "Active" },
                      { value: "Completed", label: "Completed" },
                      { value: "Cancelled", label: "Cancelled" },
                    ]}
                    required
                  />
                  <SelectField
                    label="Choose a bank account"
                    value={formData.basicInfo.accountId}
                    onChange={(v) => handleInputChange("basicInfo", "accountId", v)}
                    options={accounts
                      .filter((acc) => acc.accountType === "Bank")
                      .map((acc) => ({ value: acc._id, label: acc.accountName }))}
                    placeholder="Select Bank"
                    required
                  />
                  <InputField
                    label="Supplier Name"
                    value={formData.basicInfo.supplierName}
                    onChange={(v) => handleInputChange("basicInfo", "supplierName", v)}
                    required
                  />
                  <InputField
                    label="Supplier Country"
                    value={formData.basicInfo.supplierCountry}
                    onChange={(v) => handleInputChange("basicInfo", "supplierCountry", v)}
                    required
                  />
                </div>
              )}

              {section.id === "financialInfo" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    label="LC Amount (USD)"
                    type="number"
                    value={formData.financialInfo.lcAmountUsd}
                    onChange={(v) => handleInputChange("financialInfo", "lcAmountUsd", v)}
                    required
                  />
                  <InputField
                    label="Exchange Rate"
                    type="number"
                    value={formData.financialInfo.exchangeRate}
                    onChange={(v) => handleInputChange("financialInfo", "exchangeRate", v)}
                    required
                  />
                  <InputField
                    label="LC Amount (BDT)"
                    type="number"
                    value={formData.financialInfo.lcAmountBdt}
                    disabled
                  />
                  <InputField
                    label="LC Margin Paid (BDT)"
                    type="number"
                    value={formData.financialInfo.lcMarginPaidBdt}
                    onChange={(v) => handleInputChange("financialInfo", "lcMarginPaidBdt", v)}
                    required
                  />
                  {renderCosts("financialInfo")}
                </div>
              )}

              {section.id === "productInfo" && (
                <div className="space-y-6">
                  <AnimatePresence>
                    {formData.productInfo.map((product, index) => (
                      <motion.div
                        key={product.id}
                        {...sectionAnimation}
                        className="p-4 border border-gray-200 rounded-lg relative bg-gray-50"
                      >
                        {formData.productInfo.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Product {index + 1}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <InputField
                            label="Item Name"
                            value={product.itemName}
                            onChange={(v) => handleProductChange(product.id, "itemName", v)}
                            required
                          />
                          <InputField
                            label="Thickness"
                            type="text"
                            value={product.thickness}
                            onChange={(v) => handleProductChange(product.id, "thickness", v)}
                          />
                          <InputField
                            label="Width"
                            type="text"
                            value={product.width}
                            onChange={(v) => handleProductChange(product.id, "width", v)}
                          />
                          <InputField
                            label="Length"
                            type="text"
                            value={product.length}
                            onChange={(v) => handleProductChange(product.id, "length", v)}
                          />
                          <InputField
                            label="Grade"
                            value={product.grade}
                            onChange={(v) => handleProductChange(product.id, "grade", v)}
                          />
                          <SelectField
                            label="Quantity Unit"
                            value={product.quantityUnit}
                            onChange={(v) => handleProductChange(product.id, "quantityUnit", v)}
                            options={units}
                            placeholder="Select Unit"
                            required
                          />
                          <InputField
                            label="Quantity"
                            type="number"
                            value={product.quantity}
                            onChange={(v) => handleProductChange(product.id, "quantity", v)}
                            required
                          />
                          <InputField
                            label="Unit Price (USD)"
                            type="number"
                            value={product.unitPriceUsd}
                            onChange={(v) => handleProductChange(product.id, "unitPriceUsd", v)}
                            required
                          />
                          <InputField
                            label="Total Value (USD)"
                            type="number"
                            value={product.totalValueUsd}
                            disabled
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-[#003b75] hover:text-[#003b75] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Another Product</span>
                  </button>
                </div>
              )}

              {section.id === "shippingCustomsInfo" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Port of Shipment"
                    value={formData.shippingCustomsInfo.portOfShipment}
                    onChange={(v) => handleInputChange("shippingCustomsInfo", "portOfShipment", v)}
                  />
                  <InputField
                    label="Expected Arrival Date"
                    type="date"
                    value={formData.shippingCustomsInfo.expectedArrivalDate}
                    onChange={(v) => handleInputChange("shippingCustomsInfo", "expectedArrivalDate", v)}
                  />
                  {renderCosts("shippingCustomsInfo")}
                </div>
              )}

              {section.id === "agentTransportInfo" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderCosts("agentTransportInfo")}
                </div>
              )}
              {section.id === "documentsNotes" && (
                <div className="space-y-4">
                  <TextAreaField
                    label="Note"
                    value={formData.documentsNotes.note}
                    onChange={(v) => handleInputChange("documentsNotes", "note", v)}
                  />
                  <FileInput
                    files={uploadedFiles}
                    onFileChange={handleFileChange}
                    onFileRemove={handleFileRemove}
                  />
                </div>
              )}
            </FormSection>
          ))}

          <div className="flex justify-end gap-4 mt-8">
            <Link to={isEditMode ? `/lc-details/${id}` : "/lc-management"}>
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-[#003b75] text-white font-semibold rounded-lg hover:bg-[#002a54] transition-colors"
            >
              {isEditMode ? "Update LC" : "Save LC"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LCForm;
