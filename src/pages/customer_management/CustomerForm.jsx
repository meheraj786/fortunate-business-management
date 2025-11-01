import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router";
import FormSection from "../../components/common/FormSection";
import {
  Save,
  X,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  BadgeCheck,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useContext } from "react";
import { UrlContext } from "../../context/UrlContext";
import toast, { Toaster } from "react-hot-toast";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  icon: Icon,
  className = "",
  disabled = false,
}) => (
  <div className={`space-y-2 ${className}`}>
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
          Icon ? "pl-10" : ""
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
    </div>
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  icon: Icon,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
          Icon ? "pl-10" : ""
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
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

const CustomerForm = ({ onClose, onSave, editData = null }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [documents, setDocuments] = useState([]);
  const { baseUrl } = useContext(UrlContext);
  const sectionRefs = useRef({});
  const navigate = useNavigate();

  const initialFormData = {
    basicInfo: {
      fullName: "",
      companyName: "",
      customerType: "Retail Customer",
      customerStatus: "Active",
      joinDate: new Date().toISOString().split("T")[0],
      creditLimit: "",
    },
    contactInfo: {
      phoneNumber: "",
      alternativePhoneNumber: "",
      email: "",
      billingAddress: "",
    },
    others: {
      notes: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  const sections = [
    { id: "basic", title: "Basic Information", icon: User },
    { id: "contact", title: "Contact Information", icon: Phone },
    { id: "others", title: "Others", icon: FileText },
  ];

  const customerTypes = [
    { value: "Retail Customer", label: "Retail Customer" },
    { value: "Wholesale Customer", label: "Wholesale Customer" },
    { value: "manufacturer", label: "manufacturer" },
    { value: "Distributor", label: "Distributor" },
    { value: "Contractor", label: "Contractor" },
    { value: "Corporate Client", label: "Corporate Client" },
    { value: "Government Entity", label: "Government Entity" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Suspended", label: "Suspended" },
  ];

  useEffect(() => {
    if (editData) {
      setFormData(editData);
      setDocuments(editData.documents || []);
    }
  }, [editData]);

  useEffect(() => {
    setExpandedSections((prev) => ({ ...prev, [sections[0].id]: true }));
  }, []);

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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map((file) => ({
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      file: file,
    }));
    setDocuments((prev) => [...prev, ...newDocuments]);
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.basicInfo.fullName ||
      !formData.contactInfo.phoneNumber ||
      !formData.contactInfo.email
    ) {
      alert("Please fill in all required fields");
      return;
    }

 const payload = {
  name: formData.basicInfo.fullName,
  phone: formData.contactInfo.phoneNumber,
  location: "",

  basicInfo: {
    joinDate: formData.basicInfo.joinDate,
    profilePhoto: null, 
  },

  contactInfo: {
    phone: formData.contactInfo.phoneNumber,
    email: formData.contactInfo.email,
    billingAddress: formData.contactInfo.billingAddress,
    shippingAddress: "", 
    contactPerson: "", 
    contactPersonPhone: formData.contactInfo.alternativePhoneNumber,
    contactPersonEmail: "", 
    website: "", 
  },

  businessInfo: {
    companyName: formData.basicInfo.companyName,
    businessType: "", 
    tradeLicense: "", 
    tin: "", 
    vatInfo: "", 
    creditLimit: formData.basicInfo.creditLimit || 0,
    paymentTerms: "", 
    currency: "BDT",
  },

  bankInfo: {
    bankName: "",
    branch: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    iban: "",
  },

  documents: documents.map((doc) => ({
    name: doc.name,
    type: doc.type,
    size: doc.size,
    uploadDate: doc.uploadDate,
  })),

  notes: {
    remarks: formData.others.notes,
    assignedManager: "",
    managerContact: "",
    lastContact: null,
    nextFollowUp: null,
    specialInstructions: "",
  },

  transactions: [],
};


    await axios.post(`${baseUrl}customer/create-customer`, payload);
    toast.success("Customer Created");
    navigate("/customers");

    const completeData = {
      ...formData,
      documents,
    };

    onSave(completeData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editData ? "Edit Customer" : "Add New Customer"}
              </h1>
              <p className="text-gray-600">
                {editData
                  ? "Update customer information and details"
                  : "Complete the form below to add a new customer"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/customers">
                <button
                  onClick={onClose}
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
                <span>{editData ? "Update Customer" : "Save Customer"}</span>
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
              {section.id === "basic" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField
                    label="Full Name"
                    value={formData.basicInfo.fullName}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "fullName", v)
                    }
                    required
                    placeholder="Ahmed Hassan"
                    icon={User}
                  />
                  <InputField
                    label="Company Name"
                    value={formData.basicInfo.companyName}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "companyName", v)
                    }
                    placeholder="Hassan Trading"
                    icon={Building}
                  />
                  <SelectField
                    label="Customer Type"
                    value={formData.basicInfo.customerType}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "customerType", v)
                    }
                    options={customerTypes}
                    required
                    icon={Building}
                  />
                  <SelectField
                    label="Customer Status"
                    value={formData.basicInfo.customerStatus}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "customerStatus", v)
                    }
                    options={statusOptions}
                    required
                    icon={Shield}
                  />
                  <InputField
                    label="Customer Join"
                    type="date"
                    value={formData.basicInfo.joinDate}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "joinDate", v)
                    }
                    required
                    icon={Calendar}
                  />
                  <InputField
                    label="Credit Limit"
                    type="text"
                    value={formData.basicInfo.creditLimit}
                    onChange={(v) =>
                      handleInputChange("basicInfo", "creditLimit", v)
                    }
                    placeholder="5000"
                    icon={DollarSign}
                  />
                </div>
              )}
              {section.id === "contact" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField
                    label="Phone Number"
                    value={formData.contactInfo.phoneNumber}
                    onChange={(v) =>
                      handleInputChange("contactInfo", "phoneNumber", v)
                    }
                    required
                    placeholder="+880 1712-345678"
                    icon={Phone}
                  />
                  <InputField
                    label="Alternative Phone Number"
                    value={formData.contactInfo.alternativePhoneNumber}
                    onChange={(v) =>
                      handleInputChange(
                        "contactInfo",
                        "alternativePhoneNumber",
                        v
                      )
                    }
                    placeholder="+880 1712-345678"
                    icon={Phone}
                  />
                  <InputField
                    label="Email Address"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(v) =>
                      handleInputChange("contactInfo", "email", v)
                    }
                    required
                    placeholder="ahmed.hassan@email.com"
                    icon={Mail}
                  />
                  <div className="lg:col-span-2">
                    <TextAreaField
                      label="Billing Address"
                      value={formData.contactInfo.billingAddress}
                      onChange={(v) =>
                        handleInputChange("contactInfo", "billingAddress", v)
                      }
                      required
                      placeholder="45 Dhanmondi Road, Dhaka-1205, Bangladesh"
                      rows={2}
                    />
                  </div>
                </div>
              )}
              {section.id === "others" && (
                <div className="space-y-6">
                  <TextAreaField
                    label="Notes"
                    value={formData.others.notes}
                    onChange={(v) => handleInputChange("others", "notes", v)}
                    placeholder="Add any relevant notes here..."
                    rows={4}
                  />
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      Upload Documents
                    </h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-4">
                        Drag and drop files here or click to upload
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="document-upload"
                      />
                      <label
                        htmlFor="document-upload"
                        className="px-4 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 cursor-pointer inline-block"
                      >
                        Choose Files
                      </label>
                    </div>
                    {documents.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Uploaded Documents:
                        </h5>
                        <div className="space-y-2">
                          {documents.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {doc.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({doc.size})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDocument(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </FormSection>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl shadow-lg p-6 space-y-4 sm:space-y-0"
          >
            <Link to="/customers">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Complete all sections to save
              </span>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 font-medium"
            >
              {editData ? "Update Customer" : "Save Customer"}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerForm;
