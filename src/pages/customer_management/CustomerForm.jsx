import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
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
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CustomerForm = ({ onClose, onSave, editData = null }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [documents, setDocuments] = useState([]);
  const [lcLinks, setLcLinks] = useState([]);

  const initialFormData = {
    // Basic Customer Info
    name: "",
    phone: "",
    location: "",
    totalPurchased: "",
    lastPurchase: "",
    status: "Active",

    // Detailed Customer Info
    basicInfo: {
      customerId: "",
      name: "",
      type: "Retail",
      status: "Active",
      profilePhoto: null,
      joinDate: new Date().toISOString().split('T')[0],
      customerTier: "Bronze",
    },
    contactInfo: {
      phone: "",
      email: "",
      website: "",
      billingAddress: "",
      shippingAddress: "",
      contactPerson: "",
      contactPersonPhone: "",
      contactPersonEmail: "",
    },
    businessInfo: {
      companyName: "",
      businessType: "Local Trader",
      tradeLicense: "",
      tin: "",
      vatInfo: "",
      creditLimit: "",
      paymentTerms: "Cash on Delivery",
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
    transactionHistory: {
      totalPurchases: "",
      outstandingDues: "",
      advancePaid: "",
      lastPurchaseDate: "",
      lastPurchaseAmount: "",
      totalTransactions: "",
      averageOrderValue: "",
    },
    notes: {
      remarks: "",
      assignedManager: "",
      managerContact: "",
      lastContact: "",
      nextFollowUp: "",
      specialInstructions: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  const sections = [
    { id: 'basic', title: 'Basic Information', icon: User },
    { id: 'contact', title: 'Contact Information', icon: Phone },
    { id: 'business', title: 'Business Details', icon: Building },
    { id: 'bank', title: 'Bank Information', icon: CreditCard },
    { id: 'transactions', title: 'Transaction History', icon: DollarSign },
    { id: 'notes', title: 'Notes & Follow-up', icon: FileText },
  ];

  const customerTypes = [
    { value: "Retail", label: "Retail Customer" },
    { value: "Wholesale", label: "Wholesale Customer" },
    { value: "Corporate", label: "Corporate Client" },
    { value: "Government", label: "Government Entity" },
    { value: "Export", label: "Export Customer" },
    { value: "Import", label: "Import Customer" },
  ];

  const businessTypes = [
    "Local Trader",
    "Import & Export",
    "Manufacturer",
    "Distributor",
    "Retailer",
    "Wholesaler",
    "Service Provider",
    "Contractor",
    "Other"
  ];

  const customerTiers = [
    { value: "Bronze", label: "Bronze" },
    { value: "Silver", label: "Silver" },
    { value: "Gold", label: "Gold" },
    { value: "Platinum", label: "Platinum" },
    { value: "VIP", label: "VIP" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Pending", label: "Pending" },
    { value: "Suspended", label: "Suspended" },
    { value: "Blacklisted", label: "Blacklisted" },
  ];

  const paymentTerms = [
    "Cash on Delivery",
    "Net 7 days",
    "Net 15 days",
    "Net 30 days",
    "Net 45 days",
    "Net 60 days",
    "Advance Payment",
    "50% Advance, 50% on Delivery",
    "Custom Terms"
  ];

  const currencyOptions = [
    { value: "BDT", label: "BDT - Bangladeshi Taka" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "INR", label: "INR - Indian Rupee" },
  ];

  // Initialize form data
  useEffect(() => {
    if (editData) {
      setFormData(editData);
      setDocuments(editData.documents || []);
      setLcLinks(editData.lcLinks || []);
    } else {
      // Generate customer ID for new customer
      const customerId = `CUST-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setFormData(prev => ({
        ...prev,
        basicInfo: { ...prev.basicInfo, customerId }
      }));
    }
  }, [editData]);

  // Auto-expand first section
  useEffect(() => {
    setExpandedSections(prev => ({ ...prev, [sections[0].id]: true }));
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (mainSection, subSection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [mainSection]: {
        ...prev[mainSection],
        [subSection]: {
          ...prev[mainSection][subSection],
          [field]: value
        }
      }
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map(file => ({
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      file: file
    }));
    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const addLcLink = () => {
    setLcLinks(prev => [...prev, {
      lcNumber: "",
      status: "Active",
      value: "",
      issueDate: new Date().toISOString().split('T')[0],
    }]);
  };

  const updateLcLink = (index, field, value) => {
    setLcLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ));
  };

  const removeLcLink = (index) => {
    setLcLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.basicInfo.name || !formData.contactInfo.phone || !formData.contactInfo.email) {
      alert('Please fill in all required fields');
      setCurrentSection(0);
      return;
    }

    const completeData = {
      ...formData,
      documents,
      lcLinks
    };

    onSave(completeData);
  };

  const SectionHeader = ({ section, index }) => {
    const Icon = section.icon;
    const isExpanded = expandedSections[section.id];
    
    return (
      <motion.div
        className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => toggleSection(section.id)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-[#003b75] rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            <p className="text-sm text-gray-600">Section {index + 1} of {sections.length}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </motion.div>
    );
  };

  const InputField = ({ label, type = "text", value, onChange, required = false, placeholder = "", icon: Icon, className = "" }) => (
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
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
            Icon ? 'pl-10' : ''
          }`}
        />
      </div>
    </div>
  );

  const SelectField = ({ label, value, onChange, options, required = false, icon: Icon }) => (
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
            Icon ? 'pl-10' : ''
          }`}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const TextAreaField = ({ label, value, onChange, required = false, placeholder = "", rows = 3 }) => (
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editData ? 'Edit Customer' : 'Add New Customer'}
              </h1>
              <p className="text-gray-600">
                {editData ? 'Update customer information and details' : 'Complete the form below to add a new customer'}
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
                <span>{editData ? 'Update Customer' : 'Save Customer'}</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <motion.section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <SectionHeader section={sections[0]} index={0} />
            
            <AnimatePresence>
              {expandedSections.basic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField
                      label="Customer ID"
                      value={formData.basicInfo.customerId}
                      onChange={(value) => handleNestedInputChange('basicInfo', 'customerId', value)}
                      required
                      placeholder="CUST-2023-0001"
                      icon={BadgeCheck}
                      disabled
                    />
                    
                    <InputField
                      label="Full Name"
                      value={formData.basicInfo.name}
                      onChange={(value) => handleNestedInputChange('basicInfo', 'name', value)}
                      required
                      placeholder="Ahmed Hassan"
                      icon={User}
                    />
                    
                    <SelectField
                      label="Customer Type"
                      value={formData.basicInfo.type}
                      onChange={(value) => handleNestedInputChange('basicInfo', 'type', value)}
                      options={customerTypes}
                      required
                      icon={Building}
                    />
                    
                    <SelectField
                      label="Status"
                      value={formData.basicInfo.status}
                      onChange={(value) => handleNestedInputChange('basicInfo', 'status', value)}
                      options={statusOptions}
                      required
                      icon={Shield}
                    />
                    
                    <InputField
                      label="Join Date"
                      type="date"
                      value={formData.basicInfo.joinDate}
                      onChange={(value) => handleNestedInputChange('basicInfo', 'joinDate', value)}
                      required
                      icon={Calendar}
                    />
                    
                    <SelectField
                      label="Customer Tier"
                      value={formData.basicInfo.customerTier}
                      onChange={(value) => handleNestedInputChange('basicInfo', 'customerTier', value)}
                      options={customerTiers}
                      icon={Shield}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Contact Information */}
          <motion.section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <SectionHeader section={sections[1]} index={1} />
            
            <AnimatePresence>
              {expandedSections.contact && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField
                      label="Phone Number"
                      value={formData.contactInfo.phone}
                      onChange={(value) => handleNestedInputChange('contactInfo', 'phone', value)}
                      required
                      placeholder="+880 1712-345678"
                      icon={Phone}
                    />
                    
                    <InputField
                      label="Email Address"
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(value) => handleNestedInputChange('contactInfo', 'email', value)}
                      required
                      placeholder="ahmed.hassan@email.com"
                      icon={Mail}
                    />
                    
                    <InputField
                      label="Website"
                      value={formData.contactInfo.website}
                      onChange={(value) => handleNestedInputChange('contactInfo', 'website', value)}
                      placeholder="www.company.com"
                      icon={Building}
                    />
                    
                    <InputField
                      label="Contact Person"
                      value={formData.contactInfo.contactPerson}
                      onChange={(value) => handleNestedInputChange('contactInfo', 'contactPerson', value)}
                      placeholder="Ahmed Hassan"
                      icon={User}
                    />
                    
                    <InputField
                      label="Contact Person Phone"
                      value={formData.contactInfo.contactPersonPhone}
                      onChange={(value) => handleNestedInputChange('contactInfo', 'contactPersonPhone', value)}
                      placeholder="+880 1712-345678"
                      icon={Phone}
                    />
                    
                    <InputField
                      label="Contact Person Email"
                      type="email"
                      value={formData.contactInfo.contactPersonEmail}
                      onChange={(value) => handleNestedInputChange('contactInfo', 'contactPersonEmail', value)}
                      placeholder="ahmed.hassan@email.com"
                      icon={Mail}
                    />
                    
                    <div className="lg:col-span-2">
                      <TextAreaField
                        label="Billing Address"
                        value={formData.contactInfo.billingAddress}
                        onChange={(value) => handleNestedInputChange('contactInfo', 'billingAddress', value)}
                        required
                        placeholder="45 Dhanmondi Road, Dhaka-1205, Bangladesh"
                        rows={2}
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <TextAreaField
                        label="Shipping Address"
                        value={formData.contactInfo.shippingAddress}
                        onChange={(value) => handleNestedInputChange('contactInfo', 'shippingAddress', value)}
                        placeholder="45 Dhanmondi Road, Dhaka-1205, Bangladesh"
                        rows={2}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Business Details */}
          <motion.section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <SectionHeader section={sections[2]} index={2} />
            
            <AnimatePresence>
              {expandedSections.business && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField
                      label="Company Name"
                      value={formData.businessInfo.companyName}
                      onChange={(value) => handleNestedInputChange('businessInfo', 'companyName', value)}
                      placeholder="Hassan Trading"
                      icon={Building}
                    />
                    
                    <SelectField
                      label="Business Type"
                      value={formData.businessInfo.businessType}
                      onChange={(value) => handleNestedInputChange('businessInfo', 'businessType', value)}
                      options={businessTypes}
                      icon={Building}
                    />
                    
                    <InputField
                      label="Trade License Number"
                      value={formData.businessInfo.tradeLicense}
                      onChange={(value) => handleNestedInputChange('businessInfo', 'tradeLicense', value)}
                      placeholder="TL-BD-456123"
                      icon={FileText}
                    />
                    
                    <InputField
                      label="TIN Number"
                      value={formData.businessInfo.tin}
                      onChange={(value) => handleNestedInputChange('businessInfo', 'tin', value)}
                      placeholder="TIN-BD-123456789"
                      icon={FileText}
                    />
                    
                    <InputField
                      label="VAT Information"
                      value={formData.businessInfo.vatInfo}
                      onChange={(value) => handleNestedInputChange('businessInfo', 'vatInfo', value)}
                      placeholder="VAT Registered (BD-456789)"
                      icon={FileText}
                    />
                    
                    <InputField
                      label="Credit Limit"
                      type="number"
                      value={formData.businessInfo.creditLimit}
                      onChange={(value) => handleNestedInputChange('businessInfo', 'creditLimit', value)}
                      placeholder="5000"
                      icon={DollarSign}
                    />
                    
                    <SelectField
                      label="Payment Terms"
                      value={formData.businessInfo.paymentTerms}
                      onChange={(value) => handleNestedInputChange('businessInfo', 'paymentTerms', value)}
                      options={paymentTerms}
                      icon={CreditCard}
                    />
                    
                    <SelectField
                      label="Currency"
                      value={formData.businessInfo.currency}
                      onChange={(value) => handleNestedInputChange('businessInfo', 'currency', value)}
                      options={currencyOptions}
                      icon={DollarSign}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Bank Information */}
          <motion.section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <SectionHeader section={sections[3]} index={3} />
            
            <AnimatePresence>
              {expandedSections.bank && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField
                      label="Bank Name"
                      value={formData.bankInfo.bankName}
                      onChange={(value) => handleNestedInputChange('bankInfo', 'bankName', value)}
                      placeholder="Dutch Bangla Bank"
                      icon={Building}
                    />
                    
                    <InputField
                      label="Branch"
                      value={formData.bankInfo.branch}
                      onChange={(value) => handleNestedInputChange('bankInfo', 'branch', value)}
                      placeholder="Dhanmondi Branch"
                      icon={MapPin}
                    />
                    
                    <InputField
                      label="Account Number"
                      value={formData.bankInfo.accountNumber}
                      onChange={(value) => handleNestedInputChange('bankInfo', 'accountNumber', value)}
                      placeholder="********7890"
                      icon={CreditCard}
                    />
                    
                    <InputField
                      label="Routing Number"
                      value={formData.bankInfo.routingNumber}
                      onChange={(value) => handleNestedInputChange('bankInfo', 'routingNumber', value)}
                      placeholder="090260456"
                      icon={CreditCard}
                    />
                    
                    <InputField
                      label="SWIFT Code"
                      value={formData.bankInfo.swiftCode}
                      onChange={(value) => handleNestedInputChange('bankInfo', 'swiftCode', value)}
                      placeholder="DBBLBDDHXXX"
                      icon={CreditCard}
                    />
                    
                    <InputField
                      label="IBAN"
                      value={formData.bankInfo.iban}
                      onChange={(value) => handleNestedInputChange('bankInfo', 'iban', value)}
                      placeholder="BD33DBBL1234567890"
                      icon={CreditCard}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Transaction History */}
          <motion.section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <SectionHeader section={sections[4]} index={4} />
            
            <AnimatePresence>
              {expandedSections.transactions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField
                      label="Total Purchases"
                      type="number"
                      value={formData.transactionHistory.totalPurchases}
                      onChange={(value) => handleNestedInputChange('transactionHistory', 'totalPurchases', value)}
                      placeholder="260000"
                      icon={DollarSign}
                    />
                    
                    <InputField
                      label="Outstanding Dues"
                      type="number"
                      value={formData.transactionHistory.outstandingDues}
                      onChange={(value) => handleNestedInputChange('transactionHistory', 'outstandingDues', value)}
                      placeholder="0"
                      icon={DollarSign}
                    />
                    
                    <InputField
                      label="Advance Paid"
                      type="number"
                      value={formData.transactionHistory.advancePaid}
                      onChange={(value) => handleNestedInputChange('transactionHistory', 'advancePaid', value)}
                      placeholder="0"
                      icon={DollarSign}
                    />
                    
                    <InputField
                      label="Last Purchase Date"
                      type="date"
                      value={formData.transactionHistory.lastPurchaseDate}
                      onChange={(value) => handleNestedInputChange('transactionHistory', 'lastPurchaseDate', value)}
                      icon={Calendar}
                    />
                    
                    <InputField
                      label="Last Purchase Amount"
                      type="number"
                      value={formData.transactionHistory.lastPurchaseAmount}
                      onChange={(value) => handleNestedInputChange('transactionHistory', 'lastPurchaseAmount', value)}
                      placeholder="3250"
                      icon={DollarSign}
                    />
                    
                    <InputField
                      label="Total Transactions"
                      type="number"
                      value={formData.transactionHistory.totalTransactions}
                      onChange={(value) => handleNestedInputChange('transactionHistory', 'totalTransactions', value)}
                      placeholder="12"
                      icon={FileText}
                    />
                    
                    <InputField
                      label="Average Order Value"
                      type="number"
                      value={formData.transactionHistory.averageOrderValue}
                      onChange={(value) => handleNestedInputChange('transactionHistory', 'averageOrderValue', value)}
                      placeholder="2708"
                      icon={DollarSign}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Notes & Follow-up */}
          <motion.section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <SectionHeader section={sections[5]} index={5} />
            
            <AnimatePresence>
              {expandedSections.notes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border-t border-gray-200"
                >
                  <div className="space-y-6">
                    <TextAreaField
                      label="Remarks"
                      value={formData.notes.remarks}
                      onChange={(value) => handleNestedInputChange('notes', 'remarks', value)}
                      placeholder="Regular customer. Prefers Bengali communication. Usually orders textile items."
                      rows={3}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <InputField
                        label="Assigned Manager"
                        value={formData.notes.assignedManager}
                        onChange={(value) => handleNestedInputChange('notes', 'assignedManager', value)}
                        placeholder="Rashid Khan"
                        icon={User}
                      />
                      
                      <InputField
                        label="Manager Contact"
                        value={formData.notes.managerContact}
                        onChange={(value) => handleNestedInputChange('notes', 'managerContact', value)}
                        placeholder="rashid@company.com"
                        icon={Mail}
                      />
                      
                      <InputField
                        label="Last Contact Date"
                        type="date"
                        value={formData.notes.lastContact}
                        onChange={(value) => handleNestedInputChange('notes', 'lastContact', value)}
                        icon={Calendar}
                      />
                      
                      <InputField
                        label="Next Follow-up Date"
                        type="date"
                        value={formData.notes.nextFollowUp}
                        onChange={(value) => handleNestedInputChange('notes', 'nextFollowUp', value)}
                        icon={Calendar}
                      />
                    </div>
                    
                    <TextAreaField
                      label="Special Instructions"
                      value={formData.notes.specialInstructions}
                      onChange={(value) => handleNestedInputChange('notes', 'specialInstructions', value)}
                      placeholder="Provide local delivery option. Accept mobile banking payments."
                      rows={2}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Documents Section */}
          <motion.section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#003b75] rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Documents & LC Links</h3>
                  <p className="text-sm text-gray-600">Upload documents and link LCs</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              {/* Documents Upload */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Upload Documents</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">Drag and drop files here or click to upload</p>
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
                
                {/* Uploaded Documents List */}
                {documents.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h5>
                    <div className="space-y-2">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{doc.name}</span>
                            <span className="text-xs text-gray-500">({doc.size})</span>
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

              {/* LC Links */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">LC Links</h4>
                  <button
                    type="button"
                    onClick={addLcLink}
                    className="flex items-center space-x-2 px-3 py-1 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add LC</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {lcLinks.map((lc, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">LC Link {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeLcLink(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <InputField
                          label="LC Number"
                          value={lc.lcNumber}
                          onChange={(value) => updateLcLink(index, 'lcNumber', value)}
                          placeholder="LC-2023-001"
                        />
                        <SelectField
                          label="Status"
                          value={lc.status}
                          onChange={(value) => updateLcLink(index, 'status', value)}
                          options={[
                            { value: "Active", label: "Active" },
                            { value: "Expired", label: "Expired" },
                            { value: "Pending", label: "Pending" },
                            { value: "Completed", label: "Completed" },
                            { value: "Closed", label: "Closed" }
                          ]}
                        />
                        <InputField
                          label="LC Value"
                          type="number"
                          value={lc.value}
                          onChange={(value) => updateLcLink(index, 'value', value)}
                          placeholder="45250"
                        />
                        <InputField
                          label="Issue Date"
                          type="date"
                          value={lc.issueDate}
                          onChange={(value) => updateLcLink(index, 'issueDate', value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Form Actions */}
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
              {editData ? 'Update Customer' : 'Save Customer'}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerForm;