import React, { useState, useEffect, useRef, useContext } from "react";
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
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
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

let productIdCounter = 0;
let expenseIdCounter = 0;

const getNewProduct = () => ({
  id: productIdCounter++,
  itemName: "",
  specification: {
    thickness_mm: "",
    width_mm: "",
    length_mm: "",
    grade: "",
  },
  quantityUnit: "",
  quantityValue: "",
  unitPriceUsd: "",
  totalValueUsd: "",
});

const getNewExpense = () => ({
  id: expenseIdCounter++,
  name: "",
  amount: "",
});

const LCForm = ({ onSave }) => {
  const { baseUrl } = useContext(UrlContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const initialFormData = {
    basicInfo: {
      lcNumber: "",
      lcOpeningDate: "",
      status: "Active",
      bankName: "",
      supplierName: "",
      supplierCountry: "China",
    },
    financialInfo: {
      lcAmountUsd: "",
      exchangeRate: "",
      lcAmountBdt: "",
      lcMarginPaidBdt: "",
      bankChargesBdt: "",
      insuranceCostBdt: "",
      otherExpenses: [],
    },
    productInfo: [getNewProduct()],
    shippingCustomsInfo: {
      portOfShipment: "Chittagong",
      expectedArrivalDate: "",
      customsDutyBdt: "",
      vatBdt: "",
      aitBdt: "",
      otherExpenses: [],
    },
    agentTransportInfo: {
      cnfAgentName: "",
      cnfAgentCommissionBdt: "",
      indentingAgentCommissionBdt: "",
      transportCostBdt: "",
      otherExpenses: [],
    },
    documentsNotes: {
      remarks: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [units, setUnits] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    basic_info: true,
  });
  const sectionRefs = useRef({});

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    axios
      .get(`${baseUrl}unit/get`)
      .then((res) => setUnits(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load units");
      });
  }, [baseUrl]);

  useEffect(() => {
    if (isEditMode) {
      axios
        .get(`${baseUrl}lc/get-lc/${id}`)
        .then((res) => {
          const lcData = res.data.data;
          const processedData = {
            basicInfo: {
              lcNumber: lcData.basicInfo.lcNumber,
              lcOpeningDate: formatDateForInput(lcData.basicInfo.lcOpeningDate),
              status: lcData.basicInfo.status,
              bankName: lcData.basicInfo.bankName,
              supplierName: lcData.basicInfo.supplierName,
              supplierCountry: lcData.basicInfo.supplierCountry,
            },
            financialInfo: {
              lcAmountUsd: lcData.financialInfo.lcAmountUsd,
              exchangeRate: lcData.financialInfo.exchangeRate,
              lcAmountBdt: lcData.financialInfo.lcAmountBdt,
              lcMarginPaidBdt: lcData.financialInfo.lcMarginPaidBdt,
              bankChargesBdt: lcData.financialInfo.bankChargesBdt,
              insuranceCostBdt: lcData.financialInfo.insuranceCostBdt,
              otherExpenses: (lcData.financialInfo?.otherExpenses || []).map(
                (e) => ({
                  ...e,
                  id: expenseIdCounter++,
                })
              ),
            },
            productInfo: (lcData.productInfo || []).map((p) => ({
              ...p,
              quantityUnit: p.quantityUnit?._id || "",
              id: productIdCounter++,
            })),
            shippingCustomsInfo: {
              portOfShipment: lcData.shippingCustomsInfo.portOfShipment,
              expectedArrivalDate: formatDateForInput(
                lcData.shippingCustomsInfo?.expectedArrivalDate
              ),
              customsDutyBdt: lcData.shippingCustomsInfo.customsDutyBdt,
              vatBdt: lcData.shippingCustomsInfo.vatBdt,
              aitBdt: lcData.shippingCustomsInfo.aitBdt,
              otherExpenses: (
                lcData.shippingCustomsInfo?.otherExpenses || []
              ).map((e) => ({
                ...e,
                id: expenseIdCounter++,
              })),
            },
            agentTransportInfo: {
              cnfAgentName: lcData.agentTransportInfo.cnfAgentName,
              cnfAgentCommissionBdt:
                lcData.agentTransportInfo.cnfAgentCommissionBdt,
              indentingAgentCommissionBdt:
                lcData.agentTransportInfo.indentingAgentCommissionBdt,
              transportCostBdt: lcData.agentTransportInfo.transportCostBdt,
              otherExpenses: (
                lcData.agentTransportInfo?.otherExpenses || []
              ).map((e) => ({
                ...e,
                id: expenseIdCounter++,
              })),
            },
            documentsNotes: {
              remarks: lcData.documentsNotes.remarks,
            },
            _id: lcData._id,
            createdAt: lcData.createdAt,
            updatedAt: lcData.updatedAt,
            __v: lcData.__v,
          };
          setFormData(processedData);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to fetch LC data for editing.");
        });
    }
  }, [id, isEditMode, baseUrl]);

  useEffect(() => {
    const { lcAmountUsd, exchangeRate } = formData.financialInfo;
    if (lcAmountUsd && exchangeRate) {
      const bdtAmount = parseFloat(lcAmountUsd) * parseFloat(exchangeRate);
      handleInputChange("financialInfo", "lcAmountBdt", bdtAmount.toFixed(2));
    }
  }, [formData.financialInfo.lcAmountUsd, formData.financialInfo.exchangeRate]);

  useEffect(() => {
    const updatedProducts = formData.productInfo.map((product) => {
      const { quantityValue, unitPriceUsd } = product;
      if (quantityValue && unitPriceUsd) {
        const totalValue = parseFloat(quantityValue) * parseFloat(unitPriceUsd);
        return { ...product, totalValueUsd: totalValue.toFixed(2) };
      }
      return product;
    });

    if (
      JSON.stringify(updatedProducts) !== JSON.stringify(formData.productInfo)
    ) {
      setFormData((prev) => ({ ...prev, productInfo: updatedProducts }));
    }
  }, [JSON.stringify(formData.productInfo)]);

  const sections = [
    { id: "basicInfo", title: "Basic Information", icon: FileText },
    {
      id: "financialInfo",
      title: "Financial Information",
      icon: DollarSign,
    },
    { id: "productInfo", title: "Product Information", icon: Package },
    { id: "shippingCustomsInfo", title: "Shipping & Customs", icon: Truck },
    { id: "agentTransportInfo", title: "Agent & Transport", icon: User },
    { id: "documentsNotes", title: "Documents & Notes", icon: Clipboard },
  ];

  const toggleSection = (sectionId) => {
    const isOpening = !expandedSections[sectionId];
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));

    if (isOpening) {
      setTimeout(() => {
        sectionRefs.current[sectionId]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleProductChange = (id, field, value) => {
    const updatedProducts = formData.productInfo.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setFormData((prev) => ({ ...prev, productInfo: updatedProducts }));
  };

  const handleProductSpecChange = (id, field, value) => {
    const updatedProducts = formData.productInfo.map((p) =>
      p.id === id
        ? { ...p, specification: { ...p.specification, [field]: value } }
        : p
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
      const updatedProducts = formData.productInfo.filter((p) => p.id !== id);
      setFormData((prev) => ({ ...prev, productInfo: updatedProducts }));
    }
  };

  const handleOtherExpenseChange = (section, id, field, value) => {
    setFormData((prev) => {
      const updatedExpenses = prev[section].otherExpenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      );
      return {
        ...prev,
        [section]: {
          ...prev[section],
          otherExpenses: updatedExpenses,
        },
      };
    });
  };

  const addOtherExpense = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        otherExpenses: [...prev[section].otherExpenses, getNewExpense()],
      },
    }));
  };

  const removeOtherExpense = (section, id) => {
    setFormData((prev) => {
      const updatedExpenses = prev[section].otherExpenses.filter(
        (expense) => expense.id !== id
      );
      return {
        ...prev,
        [section]: {
          ...prev[section],
          otherExpenses: updatedExpenses,
        },
      };
    });
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
      const dataToSend = {
        ...formData,
        productInfo: formData.productInfo.map(({ id, ...product }) => product),
        financialInfo: {
          ...formData.financialInfo,
          otherExpenses: formData.financialInfo.otherExpenses.map(
            ({ id, ...expense }) => expense
          ),
        },
        shippingCustomsInfo: {
          ...formData.shippingCustomsInfo,
          otherExpenses: formData.shippingCustomsInfo.otherExpenses.map(
            ({ id, ...expense }) => expense
          ),
        },
        agentTransportInfo: {
          ...formData.agentTransportInfo,
          otherExpenses: formData.agentTransportInfo.otherExpenses.map(
            ({ id, ...expense }) => expense
          ),
        },
      };

      const payload = new FormData();
      payload.append("lc_data", JSON.stringify(dataToSend));
      uploadedFiles.forEach((file) => {
        payload.append("documents", file);
      });

      if (isEditMode) {
        await axios.patch(`${baseUrl}lc/update-lc/${id}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("LC Updated");
        navigate(`/lc-details/${id}`);
      } else {
        await axios.post(`${baseUrl}lc/create-lc`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
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

  const renderOtherExpenses = (section) => (
    <div className="space-y-4 col-span-1 md:col-span-2">
      <h4 className="font-semibold text-gray-800">Other Expenses</h4>
      <AnimatePresence>
        {formData[section].otherExpenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            {...sectionAnimation}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-3 bg-gray-100 rounded-lg"
          >
            <div className="sm:col-span-6">
              <InputField
                label={`Expense Name ${index + 1}`}
                value={expense.name}
                onChange={(v) =>
                  handleOtherExpenseChange(section, expense.id, "name", v)
                }
                placeholder="e.g., Port Fees"
                required
              />
            </div>
            <div className="sm:col-span-5">
              <InputField
                label="Amount (BDT)"
                type="number"
                value={expense.amount}
                onChange={(v) =>
                  handleOtherExpenseChange(section, expense.id, "amount", v)
                }
                placeholder="e.g., 5000"
                required
              />
            </div>
            <div className="sm:col-span-1 flex items-end justify-end">
              <button
                type="button"
                onClick={() => removeOtherExpense(section, expense.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                title="Remove Expense"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => addOtherExpense(section)}
        className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 hover:border-gray-500 hover:text-gray-800 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Other Expense</span>
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
                {isEditMode
                  ? "Edit Letter of Credit"
                  : "Create New Letter of Credit"}
              </h1>
              <p className="text-gray-600">
                Fill in the details below to {isEditMode ? "update" : "create"}{" "}
                a new LC
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/lc-management">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </Link>
              <button
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
                    onChange={(v) =>
                      handleInputChange("basicInfo", "lcNumber", v)
                    }
                    required
                  />
                  <InputField
                    label="LC Opening Date"
                    type="date"
                    value={formData.basicInfo.lcOpeningDate}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "lcOpeningDate", v)
                    }
                    required
                  />
                  <SelectField
                    label="Status"
                    value={formData.basicInfo.status}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "status", v)
                    }
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Completed", label: "Completed" },
                      { value: "Cancelled", label: "Cancelled" },
                      { value: "Draft", label: "Draft" },
                    ]}
                    required
                  />
                  <InputField
                    label="Bank Name"
                    value={formData.basicInfo.bankName}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "bankName", v)
                    }
                    required
                  />
                  <InputField
                    label="Supplier Name"
                    value={formData.basicInfo.supplierName}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "supplierName", v)
                    }
                    required
                  />
                  <SelectField
                    label="Supplier Country"
                    value={formData.basicInfo.supplierCountry}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "supplierCountry", v)
                    }
                    options={[
                      { value: "China", label: "China" },
                      { value: "India", label: "India" },
                      { value: "US", label: "United States" },
                    ]}
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
                    onChange={(v) =>
                      handleInputChange("financialInfo", "lcAmountUsd", v)
                    }
                    required
                  />
                  <InputField
                    label="Exchange Rate"
                    type="number"
                    value={formData.financialInfo.exchangeRate}
                    onChange={(v) =>
                      handleInputChange("financialInfo", "exchangeRate", v)
                    }
                    required
                  />
                  <InputField
                    label="LC Amount (BDT)"
                    type="number"
                    value={formData.financialInfo.lcAmountBdt}
                    onChange={(v) =>
                      handleInputChange("financialInfo", "lcAmountBdt", v)
                    }
                    disabled
                  />
                  <InputField
                    label="LC Margin Paid (BDT)"
                    type="number"
                    value={formData.financialInfo.lcMarginPaidBdt}
                    onChange={(v) =>
                      handleInputChange("financialInfo", "lcMarginPaidBdt", v)
                    }
                    required
                  />
                  <InputField
                    label="Bank Charges (BDT)"
                    type="number"
                    value={formData.financialInfo.bankChargesBdt}
                    onChange={(v) =>
                      handleInputChange("financialInfo", "bankChargesBdt", v)
                    }
                    required
                  />
                  <InputField
                    label="Insurance Cost (BDT)"
                    type="number"
                    value={formData.financialInfo.insuranceCostBdt}
                    onChange={(v) =>
                      handleInputChange("financialInfo", "insuranceCostBdt", v)
                    }
                    required
                  />
                  {renderOtherExpenses("financialInfo")}
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
                            label="Product Name"
                            value={product.itemName}
                            onChange={(v) =>
                              handleProductChange(product.id, "itemName", v)
                            }
                            required
                          />
                          <InputField
                            label="Thickness (mm)"
                            type="number"
                            value={product.specification.thickness_mm}
                            onChange={(v) =>
                              handleProductSpecChange(
                                product.id,
                                "thickness_mm",
                                v
                              )
                            }
                          />
                          <InputField
                            label="Width (mm)"
                            type="number"
                            value={product.specification.width_mm}
                            onChange={(v) =>
                              handleProductSpecChange(product.id, "width_mm", v)
                            }
                          />
                          <InputField
                            label="Length (mm)"
                            type="number"
                            value={product.specification.length_mm}
                            onChange={(v) =>
                              handleProductSpecChange(
                                product.id,
                                "length_mm",
                                v
                              )
                            }
                          />
                          <InputField
                            label="Grade"
                            value={product.specification.grade}
                            onChange={(v) =>
                              handleProductSpecChange(product.id, "grade", v)
                            }
                          />
                          <SelectField
                            label="Quantity Unit"
                            value={product.quantityUnit}
                            onChange={(v) =>
                              handleProductChange(product.id, "quantityUnit", v)
                            }
                            options={units}
                            placeholder="Select Unit"
                            required
                          />
                          <InputField
                            label="Product Quantity"
                            type="number"
                            value={product.quantityValue}
                            onChange={(v) =>
                              handleProductChange(
                                product.id,
                                "quantityValue",
                                v
                              )
                            }
                            required
                          />
                          <InputField
                            label="Unit Price (USD)"
                            type="number"
                            value={product.unitPriceUsd}
                            onChange={(v) =>
                              handleProductChange(product.id, "unitPriceUsd", v)
                            }
                            required
                          />
                          <InputField
                            label="Total Value (USD)"
                            type="number"
                            value={product.totalValueUsd}
                            onChange={(v) =>
                              handleProductChange(
                                product.id,
                                "totalValueUsd",
                                v
                              )
                            }
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
                  <SelectField
                    label="Port of Shipment"
                    value={formData.shippingCustomsInfo.portOfShipment}
                    onChange={(v) =>
                      handleInputChange(
                        "shippingCustomsInfo",
                        "portOfShipment",
                        v
                      )
                    }
                    options={[
                      { value: "Chittagong", label: "Chittagong Port" },
                      { value: "Mongla", label: "Mongla Port" },
                      { value: "Payra", label: "Payra Port" },
                      { value: "Matarbari", label: "Matarbari Port" },
                    ]}
                  />
                  <InputField
                    label="Expected Arrival Date"
                    type="date"
                    value={formData.shippingCustomsInfo.expectedArrivalDate}
                    onChange={(v) =>
                      handleInputChange(
                        "shippingCustomsInfo",
                        "expectedArrivalDate",
                        v
                      )
                    }
                  />
                  <InputField
                    label="Customs Duty (BDT)"
                    type="number"
                    value={formData.shippingCustomsInfo.customsDutyBdt}
                    onChange={(v) =>
                      handleInputChange(
                        "shippingCustomsInfo",
                        "customsDutyBdt",
                        v
                      )
                    }
                  />
                  <InputField
                    label="VAT (BDT)"
                    type="number"
                    value={formData.shippingCustomsInfo.vatBdt}
                    onChange={(v) =>
                      handleInputChange("shippingCustomsInfo", "vatBdt", v)
                    }
                  />
                  <InputField
                    label="AIT (BDT)"
                    type="number"
                    value={formData.shippingCustomsInfo.aitBdt}
                    onChange={(v) =>
                      handleInputChange("shippingCustomsInfo", "aitBdt", v)
                    }
                  />
                  {renderOtherExpenses("shippingCustomsInfo")}
                </div>
              )}

              {section.id === "agentTransportInfo" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="C&F Agent Name"
                    value={formData.agentTransportInfo.cnfAgentName}
                    onChange={(v) =>
                      handleInputChange("agentTransportInfo", "cnfAgentName", v)
                    }
                  />
                  <InputField
                    label="C&F Agent Commission (BDT)"
                    type="number"
                    value={formData.agentTransportInfo.cnfAgentCommissionBdt}
                    onChange={(v) =>
                      handleInputChange(
                        "agentTransportInfo",
                        "cnfAgentCommissionBdt",
                        v
                      )
                    }
                  />
                  <InputField
                    label="Indenting Agent Commission (BDT)"
                    type="number"
                    value={
                      formData.agentTransportInfo.indentingAgentCommissionBdt
                    }
                    onChange={(v) =>
                      handleInputChange(
                        "agentTransportInfo",
                        "indentingAgentCommissionBdt",
                        v
                      )
                    }
                  />
                  <InputField
                    label="Transport Cost (BDT)"
                    type="number"
                    value={formData.agentTransportInfo.transportCostBdt}
                    onChange={(v) =>
                      handleInputChange(
                        "agentTransportInfo",
                        "transportCostBdt",
                        v
                      )
                    }
                  />
                  {renderOtherExpenses("agentTransportInfo")}
                </div>
              )}
              {section.id === "documentsNotes" && (
                <div className="space-y-4">
                  <TextAreaField
                    label="Remarks"
                    value={formData.documentsNotes.remarks}
                    onChange={(v) =>
                      handleInputChange("documentsNotes", "remarks", v)
                    }
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
            <Link to="/lc-management">
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
