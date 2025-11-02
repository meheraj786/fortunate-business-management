import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router";
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
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
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

let productIdCounter = 0;

const LCForm = ({ onSave, editData = null }) => {
  const { baseUrl } = useContext(UrlContext);
  const navigate = useNavigate();

  const getNewProduct = () => ({
    id: productIdCounter++,
    item_name: "",
    specification: {
      thickness_mm: "",
      width_mm: "",
      length_mm: "",
      grade: "",
    },
    quantity_ton: "",
    unit_price_usd: "",
    total_value_usd: "",
    total_value_bdt: "",
  });

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
    },
    product_info: [getNewProduct()],
    shipping_customs_info: {
      port_of_shipment: "Chittagong",
      port_of_arrival: "",
      expected_arrival_date: "",
      customs_duty_bdt: "",
      vat_bdt: "",
      ait_bdt: "",
      other_port_expenses_bdt: "",
    },
    agent_transport_info: {
      cnf_agent_name: "",
      cnf_agent_commission_bdt: "",
      indenting_agent_commission_bdt: "",
      transport_cost_bdt: "",
    },
    documents_notes: {
      uploaded_documents: [],
      remarks: "",
    },
  };

  const [formData, setFormData] = useState(editData || initialFormData);
  const [expandedSections, setExpandedSections] = useState({
    basic_info: true,
  });
  const sectionRefs = useRef({});

  useEffect(() => {
    if (editData) {
      // If editData has product_info as object, convert to array
      const productsArray = Array.isArray(editData.product_info)
        ? editData.product_info.map((p) => (p.id ? p : { ...p, id: productIdCounter++ }))
        : [{ ...editData.product_info, id: productIdCounter++ }];
      
      setFormData({ ...editData, product_info: productsArray });
    }
  }, [editData]);

  const sections = [
    { id: "basic_info", title: "Basic Information", icon: FileText },
    { id: "financial_info", title: "Financial Information", icon: DollarSign },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Remove 'id' field from products before sending to backend
      const dataToSend = {
        ...formData,
        product_info: formData.product_info.map(({ id, ...product }) => product),
      };

      await axios.post(`${baseUrl}lc/create-lc`, dataToSend);
      toast.success("LC Created");
      navigate("/lc-management");
      if (onSave) onSave(formData);
    } catch (error) {
      toast.error("Failed to create LC");
      console.error(error);
    }
  };

  const sectionAnimation = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1, transition: { duration: 0.3 } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editData
                  ? "Edit Letter of Credit"
                  : "Create New Letter of Credit"}
              </h1>
              <p className="text-gray-600">
                Fill in the details below to {editData ? "update" : "create"} a
                new LC
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/lc-management">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </Link>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editData ? "Update LC" : "Save LC"}</span>
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
                  />
                  <InputField
                    label="Bank Name"
                    value={formData.basic_info.bank_name}
                    onChange={(v) =>
                      handleInputChange("basic_info", "bank_name", v)
                    }
                  />
                  <InputField
                    label="Supplier Name"
                    value={formData.basic_info.supplier_name}
                    onChange={(v) =>
                      handleInputChange("basic_info", "supplier_name", v)
                    }
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
                  />
                  <InputField
                    label="Exchange Rate"
                    type="number"
                    value={formData.financial_info.exchange_rate}
                    onChange={(v) =>
                      handleInputChange("financial_info", "exchange_rate", v)
                    }
                  />
                  <InputField
                    label="LC Amount (BDT)"
                    type="number"
                    value={formData.financial_info.lc_amount_bdt}
                    onChange={(v) =>
                      handleInputChange("financial_info", "lc_amount_bdt", v)
                    }
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
                  />
                  <InputField
                    label="Bank Charges (BDT)"
                    type="number"
                    value={formData.financial_info.bank_charges_bdt}
                    onChange={(v) =>
                      handleInputChange("financial_info", "bank_charges_bdt", v)
                    }
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
                  />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <InputField
                            label="Item Name"
                            value={product.item_name}
                            onChange={(v) =>
                              handleProductChange(product.id, "item_name", v)
                            }
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
                          <InputField
                            label="Quantity (Ton)"
                            type="number"
                            value={product.quantity_ton}
                            onChange={(v) =>
                              handleProductChange(product.id, "quantity_ton", v)
                            }
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
                          />
                          <InputField
                            label="Total Value (BDT)"
                            type="number"
                            value={product.total_value_bdt}
                            onChange={(v) =>
                              handleProductChange(
                                product.id,
                                "total_value_bdt",
                                v
                              )
                            }
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
                    label="Port of Arrival"
                    value={formData.shipping_customs_info.port_of_arrival}
                    onChange={(v) =>
                      handleInputChange(
                        "shipping_customs_info",
                        "port_of_arrival",
                        v
                      )
                    }
                  />
                  <InputField
                    label="Expected Arrival Date"
                    type="date"
                    value={formData.shipping_customs_info.expected_arrival_date}
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
                  <InputField
                    label="Other Port Expenses (BDT)"
                    type="number"
                    value={
                      formData.shipping_customs_info.other_port_expenses_bdt
                    }
                    onChange={(v) =>
                      handleInputChange(
                        "shipping_customs_info",
                        "other_port_expenses_bdt",
                        v
                      )
                    }
                  />
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documents
                    </label>
                    <button
                      type="button"
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-[#003b75] hover:text-[#003b75] transition-colors"
                    >
                      <UploadCloud className="w-5 h-5" />
                      <span>Upload Documents</span>
                    </button>
                  </div>
                </div>
              )}
            </FormSection>
          ))}

          <div className="flex justify-end gap-4">
            <Link to="/lc-management">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 font-medium"
              >
              Save LC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LCForm;