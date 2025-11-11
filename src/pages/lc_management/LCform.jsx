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
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
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
  item_name: "",
  specification: {
    thickness_mm: "",
    width_mm: "",
    length_mm: "",
    grade: "",
  },
  quantity_unit: "",
  quantity_ton: "",
  unit_price_usd: "",
  total_value_usd: "",
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
    basic_info: {
      lc_number: "",
      lc_opening_date: "",
      status: "Active",
      bank_name: "",
      supplier_name: "",
      supplier_country: "China",
    },
    financial_info: {
      lc_amount_usd: "",
      exchange_rate: "",
      lc_amount_bdt: "",
      lc_margin_paid_bdt: "",
      bank_charges_bdt: "",
      insurance_cost_bdt: "",
      other_expenses: [],
    },
    product_info: [getNewProduct()],
    shipping_customs_info: {
      port_of_shipment: "Chittagong",
      expected_arrival_date: "",
      customs_duty_bdt: "",
      vat_bdt: "",
      ait_bdt: "",
      other_expenses: [],
    },
    agent_transport_info: {
      cnf_agent_name: "",
      cnf_agent_commission_bdt: "",
      indenting_agent_commission_bdt: "",
      transport_cost_bdt: "",
      other_expenses: [],
    },
    documents_notes: {
      remarks: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState([]);
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
    if (isEditMode) {
      axios
        .get(`${baseUrl}lc/get-lc/${id}`)
        .then((res) => {
          const lcData = res.data.data;
          const processedData = {
            ...lcData,
            basic_info: {
              ...lcData.basic_info,
              lc_opening_date: formatDateForInput(
                lcData.basic_info.lc_opening_date
              ),
            },
            product_info: (lcData.product_info || []).map((p) => ({
              ...p,
              id: productIdCounter++,
            })),
            financial_info: {
              ...lcData.financial_info,
              other_expenses: (lcData.financial_info?.other_expenses || []).map(
                (e) => ({
                  ...e,
                  id: expenseIdCounter++,
                })
              ),
            },
            shipping_customs_info: {
              ...lcData.shipping_customs_info,
              expected_arrival_date: formatDateForInput(
                lcData.shipping_customs_info?.expected_arrival_date
              ),
              other_expenses: (
                lcData.shipping_customs_info?.other_expenses || []
              ).map((e) => ({
                ...e,
                id: expenseIdCounter++,
              })),
            },
            agent_transport_info: {
              ...lcData.agent_transport_info,
              other_expenses: (
                lcData.agent_transport_info?.other_expenses || []
              ).map((e) => ({
                ...e,
                id: expenseIdCounter++,
              })),
            },
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
    const { lc_amount_usd, exchange_rate } = formData.financial_info;
    if (lc_amount_usd && exchange_rate) {
      const bdtAmount = parseFloat(lc_amount_usd) * parseFloat(exchange_rate);
      handleInputChange(
        "financial_info",
        "lc_amount_bdt",
        bdtAmount.toFixed(2)
      );
    }
  }, [
    formData.financial_info.lc_amount_usd,
    formData.financial_info.exchange_rate,
  ]);

  useEffect(() => {
    const updatedProducts = formData.product_info.map((product) => {
      const { quantity_ton, unit_price_usd } = product;
      if (quantity_ton && unit_price_usd) {
        const totalValue =
          parseFloat(quantity_ton) * parseFloat(unit_price_usd);
        return { ...product, total_value_usd: totalValue.toFixed(2) };
      }
      return product;
    });

    if (
      JSON.stringify(updatedProducts) !== JSON.stringify(formData.product_info)
    ) {
      setFormData((prev) => ({ ...prev, product_info: updatedProducts }));
    }
  }, [JSON.stringify(formData.product_info)]);

  const sections = [
    { id: "basic_info", title: "Basic Information", icon: FileText },
    {
      id: "financial_info",
      title: "Financial Information",
      icon: DollarSign,
    },
    { id: "product_info", title: "Product Information", icon: Package },
    { id: "shipping_customs_info", title: "Shipping & Customs", icon: Truck },
    { id: "agent_transport_info", title: "Agent & Transport", icon: User },
    { id: "documents_notes", title: "Documents & Notes", icon: Clipboard },
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
    const updatedProducts = formData.product_info.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setFormData((prev) => ({ ...prev, product_info: updatedProducts }));
  };

  const handleProductSpecChange = (id, field, value) => {
    const updatedProducts = formData.product_info.map((p) =>
      p.id === id
        ? { ...p, specification: { ...p.specification, [field]: value } }
        : p
    );
    setFormData((prev) => ({ ...prev, product_info: updatedProducts }));
  };

  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      product_info: [...prev.product_info, getNewProduct()],
    }));
  };

  const removeProduct = (id) => {
    if (formData.product_info.length > 1) {
      const updatedProducts = formData.product_info.filter((p) => p.id !== id);
      setFormData((prev) => ({ ...prev, product_info: updatedProducts }));
    }
  };

  const handleOtherExpenseChange = (section, id, field, value) => {
    setFormData((prev) => {
      const updatedExpenses = prev[section].other_expenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      );
      return {
        ...prev,
        [section]: {
          ...prev[section],
          other_expenses: updatedExpenses,
        },
      };
    });
  };

  const addOtherExpense = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        other_expenses: [...prev[section].other_expenses, getNewExpense()],
      },
    }));
  };

  const removeOtherExpense = (section, id) => {
    setFormData((prev) => {
      const updatedExpenses = prev[section].other_expenses.filter(
        (expense) => expense.id !== id
      );
      return {
        ...prev,
        [section]: {
          ...prev[section],
          other_expenses: updatedExpenses,
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
        product_info: formData.product_info.map(
          ({ id, ...product }) => product
        ),
        financial_info: {
          ...formData.financial_info,
          other_expenses: formData.financial_info.other_expenses.map(
            ({ id, ...expense }) => expense
          ),
        },
        shipping_customs_info: {
          ...formData.shipping_customs_info,
          other_expenses: formData.shipping_customs_info.other_expenses.map(
            ({ id, ...expense }) => expense
          ),
        },
        agent_transport_info: {
          ...formData.agent_transport_info,
          other_expenses: formData.agent_transport_info.other_expenses.map(
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
        {formData[section].other_expenses.map((expense, index) => (
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
              {section.id === "basic_info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    label="LC Number"
                    value={formData.basic_info.lc_number}
                    onChange={(v) =>
                      handleInputChange("basic_info", "lc_number", v)
                    }
                    required
                  />
                  <InputField
                    label="LC Opening Date"
                    type="date"
                    value={formData.basic_info.lc_opening_date}
                    onChange={(v) =>
                      handleInputChange("basic_info", "lc_opening_date", v)
                    }
                    required
                  />
                  <SelectField
                    label="Status"
                    value={formData.basic_info.status}
                    onChange={(v) =>
                      handleInputChange("basic_info", "status", v)
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
                    value={formData.basic_info.bank_name}
                    onChange={(v) =>
                      handleInputChange("basic_info", "bank_name", v)
                    }
                    required
                  />
                  <InputField
                    label="Supplier Name"
                    value={formData.basic_info.supplier_name}
                    onChange={(v) =>
                      handleInputChange("basic_info", "supplier_name", v)
                    }
                    required
                  />
                  <SelectField
                    label="Supplier Country"
                    value={formData.basic_info.supplier_country}
                    onChange={(v) =>
                      handleInputChange("basic_info", "supplier_country", v)
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

              {section.id === "financial_info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    label="LC Amount (USD)"
                    type="number"
                    value={formData.financial_info.lc_amount_usd}
                    onChange={(v) =>
                      handleInputChange("financial_info", "lc_amount_usd", v)
                    }
                    required
                  />
                  <InputField
                    label="Exchange Rate"
                    type="number"
                    value={formData.financial_info.exchange_rate}
                    onChange={(v) =>
                      handleInputChange("financial_info", "exchange_rate", v)
                    }
                    required
                  />
                  <InputField
                    label="LC Amount (BDT)"
                    type="number"
                    value={formData.financial_info.lc_amount_bdt}
                    onChange={(v) =>
                      handleInputChange("financial_info", "lc_amount_bdt", v)
                    }
                    disabled
                  />
                  <InputField
                    label="LC Margin Paid (BDT)"
                    type="number"
                    value={formData.financial_info.lc_margin_paid_bdt}
                    onChange={(v) =>
                      handleInputChange(
                        "financial_info",
                        "lc_margin_paid_bdt",
                        v
                      )
                    }
                    required
                  />
                  <InputField
                    label="Bank Charges (BDT)"
                    type="number"
                    value={formData.financial_info.bank_charges_bdt}
                    onChange={(v) =>
                      handleInputChange("financial_info", "bank_charges_bdt", v)
                    }
                    required
                  />
                  <InputField
                    label="Insurance Cost (BDT)"
                    type="number"
                    value={formData.financial_info.insurance_cost_bdt}
                    onChange={(v) =>
                      handleInputChange(
                        "financial_info",
                        "insurance_cost_bdt",
                        v
                      )
                    }
                    required
                  />
                  {renderOtherExpenses("financial_info")}
                </div>
              )}

              {section.id === "product_info" && (
                <div className="space-y-6">
                  <AnimatePresence>
                    {formData.product_info.map((product, index) => (
                      <motion.div
                        key={product.id}
                        {...sectionAnimation}
                        className="p-4 border border-gray-200 rounded-lg relative bg-gray-50"
                      >
                        {formData.product_info.length > 1 && (
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
                            value={product.item_name}
                            onChange={(v) =>
                              handleProductChange(product.id, "item_name", v)
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
                            value={product.quantity_unit}
                            onChange={(v) =>
                              handleProductChange(
                                product.id,
                                "quantity_unit",
                                v
                              )
                            }
                            options={[
                              { value: "Ton", label: "Ton" },
                              { value: "KG", label: "KG" },
                              { value: "PCS", label: "PCS" },
                            ]}
                            placeholder="Select Unit"
                            required
                          />
                          <InputField
                            label="Product Quantity"
                            type="number"
                            value={product.quantity_ton}
                            onChange={(v) =>
                              handleProductChange(product.id, "quantity_ton", v)
                            }
                            required
                          />
                          <InputField
                            label="Unit Price (USD)"
                            type="number"
                            value={product.unit_price_usd}
                            onChange={(v) =>
                              handleProductChange(
                                product.id,
                                "unit_price_usd",
                                v
                              )
                            }
                            required
                          />
                          <InputField
                            label="Total Value (USD)"
                            type="number"
                            value={product.total_value_usd}
                            onChange={(v) =>
                              handleProductChange(
                                product.id,
                                "total_value_usd",
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

              {section.id === "shipping_customs_info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Port of Shipment"
                    value={formData.shipping_customs_info.port_of_shipment}
                    onChange={(v) =>
                      handleInputChange(
                        "shipping_customs_info",
                        "port_of_shipment",
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
                    value={
                      formData.shipping_customs_info.expected_arrival_date
                    }
                    onChange={(v) =>
                      handleInputChange(
                        "shipping_customs_info",
                        "expected_arrival_date",
                        v
                      )
                    }
                  />
                  <InputField
                    label="Customs Duty (BDT)"
                    type="number"
                    value={formData.shipping_customs_info.customs_duty_bdt}
                    onChange={(v) =>
                      handleInputChange(
                        "shipping_customs_info",
                        "customs_duty_bdt",
                        v
                      )
                    }
                  />
                  <InputField
                    label="VAT (BDT)"
                    type="number"
                    value={formData.shipping_customs_info.vat_bdt}
                    onChange={(v) =>
                      handleInputChange("shipping_customs_info", "vat_bdt", v)
                    }
                  />
                  <InputField
                    label="AIT (BDT)"
                    type="number"
                    value={formData.shipping_customs_info.ait_bdt}
                    onChange={(v) =>
                      handleInputChange("shipping_customs_info", "ait_bdt", v)
                    }
                  />
                  {renderOtherExpenses("shipping_customs_info")}
                </div>
              )}

              {section.id === "agent_transport_info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="C&F Agent Name"
                    value={formData.agent_transport_info.cnf_agent_name}
                    onChange={(v) =>
                      handleInputChange(
                        "agent_transport_info",
                        "cnf_agent_name",
                        v
                      )
                    }
                  />
                  <InputField
                    label="C&F Agent Commission (BDT)"
                    type="number"
                    value={
                      formData.agent_transport_info.cnf_agent_commission_bdt
                    }
                    onChange={(v) =>
                      handleInputChange(
                        "agent_transport_info",
                        "cnf_agent_commission_bdt",
                        v
                      )
                    }
                  />
                  <InputField
                    label="Indenting Agent Commission (BDT)"
                    type="number"
                    value={
                      formData.agent_transport_info
                        .indenting_agent_commission_bdt
                    }
                    onChange={(v) =>
                      handleInputChange(
                        "agent_transport_info",
                        "indenting_agent_commission_bdt",
                        v
                      )
                    }
                  />
                  <InputField
                    label="Transport Cost (BDT)"
                    type="number"
                    value={formData.agent_transport_info.transport_cost_bdt}
                    onChange={(v) =>
                      handleInputChange(
                        "agent_transport_info",
                        "transport_cost_bdt",
                        v
                      )
                    }
                  />
                  {renderOtherExpenses("agent_transport_info")}
                </div>
              )}
              {section.id === "documents_notes" && (
                <div className="space-y-4">
                  <TextAreaField
                    label="Remarks"
                    value={formData.documents_notes.remarks}
                    onChange={(v) =>
                      handleInputChange("documents_notes", "remarks", v)
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