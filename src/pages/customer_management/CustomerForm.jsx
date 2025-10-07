import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import FormSection from '../../components/common/FormSection';
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
  Trash2
} from 'lucide-react';

// Helper components moved outside the main component to prevent re-creation on re-renders
const InputField = ({ label, type = "text", value, onChange, required = false, placeholder = "", icon: Icon, className = "", disabled = false }) => (
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
          Icon ? 'pl-10' : ''
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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

const CustomerForm = ({ onClose, onSave, editData = null }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [documents, setDocuments] = useState([]);
  const [lcLinks, setLcLinks] = useState([]);
  const sectionRefs = useRef({});

  const initialFormData = {
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
    { value: "Retail", label: "Retail Customer" }, { value: "Wholesale", label: "Wholesale Customer" }, { value: "Corporate", label: "Corporate Client" }, { value: "Government", label: "Government Entity" }, { value: "Export", label: "Export Customer" }, { value: "Import", label: "Import Customer" },
  ];

  const businessTypes = [
    "Local Trader", "Import & Export", "Manufacturer", "Distributor", "Retailer", "Wholesaler", "Service Provider", "Contractor", "Other"
  ];

  const customerTiers = [
    { value: "Bronze", label: "Bronze" }, { value: "Silver", label: "Silver" }, { value: "Gold", label: "Gold" }, { value: "Platinum", label: "Platinum" }, { value: "VIP", label: "VIP" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Pending", label: "Pending" }, { value: "Suspended", label: "Suspended" }, { value: "Blacklisted", label: "Blacklisted" },
  ];

  const paymentTerms = [
    "Cash on Delivery", "Net 7 days", "Net 15 days", "Net 30 days", "Net 45 days", "Net 60 days", "Advance Payment", "50% Advance, 50% on Delivery", "Custom Terms"
  ];

  const currencyOptions = [
    { value: "BDT", label: "BDT - Bangladeshi Taka" }, { value: "USD", label: "USD - US Dollar" }, { value: "EUR", label: "EUR - Euro" }, { value: "GBP", label: "GBP - British Pound" }, { value: "INR", label: "INR - Indian Rupee" },
  ];

  useEffect(() => {
    if (editData) {
      setFormData(editData);
      setDocuments(editData.documents || []);
      setLcLinks(editData.lcLinks || []);
    } else {
      const customerId = `CUST-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setFormData(prev => ({
        ...prev,
        basicInfo: { ...prev.basicInfo, customerId }
      }));
    }
  }, [editData]);

  useEffect(() => {
    setExpandedSections(prev => ({ ...prev, [sections[0].id]: true }));
  }, []);

  const toggleSection = (sectionId) => {
    const isOpening = !expandedSections[sectionId];
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    if (isOpening) {
      setTimeout(() => {
        sectionRefs.current[sectionId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    }
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
    
    if (!formData.basicInfo.name || !formData.contactInfo.phone || !formData.contactInfo.email) {
      alert('Please fill in all required fields');
      return;
    }

    const completeData = {
      ...formData,
      documents,
      lcLinks
    };

    onSave(completeData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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
          {sections.map((section) => (
            <FormSection
              key={section.id}
              title={section.title}
              icon={section.icon}
              isExpanded={!!expandedSections[section.id]}
              onToggle={() => toggleSection(section.id)}
              sectionRef={el => sectionRefs.current[section.id] = el}
            >
              {section.id === 'basic' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField label="Customer ID" value={formData.basicInfo.customerId} onChange={(v) => handleInputChange('basicInfo', 'customerId', v)} required icon={BadgeCheck} disabled />
                  <InputField label="Full Name" value={formData.basicInfo.name} onChange={(v) => handleInputChange('basicInfo', 'name', v)} required placeholder="Ahmed Hassan" icon={User} />
                  <SelectField label="Customer Type" value={formData.basicInfo.type} onChange={(v) => handleInputChange('basicInfo', 'type', v)} options={customerTypes} required icon={Building} />
                  <SelectField label="Status" value={formData.basicInfo.status} onChange={(v) => handleInputChange('basicInfo', 'status', v)} options={statusOptions} required icon={Shield} />
                  <InputField label="Join Date" type="date" value={formData.basicInfo.joinDate} onChange={(v) => handleInputChange('basicInfo', 'joinDate', v)} required icon={Calendar} />
                  <SelectField label="Customer Tier" value={formData.basicInfo.customerTier} onChange={(v) => handleInputChange('basicInfo', 'customerTier', v)} options={customerTiers} icon={Shield} />
                </div>
              )}
              {section.id === 'contact' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField label="Phone Number" value={formData.contactInfo.phone} onChange={(v) => handleInputChange('contactInfo', 'phone', v)} required placeholder="+880 1712-345678" icon={Phone} />
                  <InputField label="Email Address" type="email" value={formData.contactInfo.email} onChange={(v) => handleInputChange('contactInfo', 'email', v)} required placeholder="ahmed.hassan@email.com" icon={Mail} />
                  <InputField label="Website" value={formData.contactInfo.website} onChange={(v) => handleInputChange('contactInfo', 'website', v)} placeholder="www.company.com" icon={Building} />
                  <InputField label="Contact Person" value={formData.contactInfo.contactPerson} onChange={(v) => handleInputChange('contactInfo', 'contactPerson', v)} placeholder="Ahmed Hassan" icon={User} />
                  <InputField label="Contact Person Phone" value={formData.contactInfo.contactPersonPhone} onChange={(v) => handleInputChange('contactInfo', 'contactPersonPhone', v)} placeholder="+880 1712-345678" icon={Phone} />
                  <InputField label="Contact Person Email" type="email" value={formData.contactInfo.contactPersonEmail} onChange={(v) => handleInputChange('contactInfo', 'contactPersonEmail', v)} placeholder="ahmed.hassan@email.com" icon={Mail} />
                  <div className="lg:col-span-2"><TextAreaField label="Billing Address" value={formData.contactInfo.billingAddress} onChange={(v) => handleInputChange('contactInfo', 'billingAddress', v)} required placeholder="45 Dhanmondi Road, Dhaka-1205, Bangladesh" rows={2} /></div>
                  <div className="lg:col-span-2"><TextAreaField label="Shipping Address" value={formData.contactInfo.shippingAddress} onChange={(v) => handleInputChange('contactInfo', 'shippingAddress', v)} placeholder="45 Dhanmondi Road, Dhaka-1205, Bangladesh" rows={2} /></div>
                </div>
              )}
              {section.id === 'business' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField label="Company Name" value={formData.businessInfo.companyName} onChange={(v) => handleInputChange('businessInfo', 'companyName', v)} placeholder="Hassan Trading" icon={Building} />
                  <SelectField label="Business Type" value={formData.businessInfo.businessType} onChange={(v) => handleInputChange('businessInfo', 'businessType', v)} options={businessTypes} icon={Building} />
                  <InputField label="Trade License Number" value={formData.businessInfo.tradeLicense} onChange={(v) => handleInputChange('businessInfo', 'tradeLicense', v)} placeholder="TL-BD-456123" icon={FileText} />
                  <InputField label="TIN Number" value={formData.businessInfo.tin} onChange={(v) => handleInputChange('businessInfo', 'tin', v)} placeholder="TIN-BD-123456789" icon={FileText} />
                  <InputField label="VAT Information" value={formData.businessInfo.vatInfo} onChange={(v) => handleInputChange('businessInfo', 'vatInfo', v)} placeholder="VAT Registered (BD-456789)" icon={FileText} />
                  <InputField label="Credit Limit" type="text" value={formData.businessInfo.creditLimit} onChange={(v) => handleInputChange('businessInfo', 'creditLimit', v)} placeholder="5000" icon={DollarSign} />
                  <SelectField label="Payment Terms" value={formData.businessInfo.paymentTerms} onChange={(v) => handleInputChange('businessInfo', 'paymentTerms', v)} options={paymentTerms} icon={CreditCard} />
                  <SelectField label="Currency" value={formData.businessInfo.currency} onChange={(v) => handleInputChange('businessInfo', 'currency', v)} options={currencyOptions} icon={DollarSign} />
                </div>
              )}
              {section.id === 'bank' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField label="Bank Name" value={formData.bankInfo.bankName} onChange={(v) => handleInputChange('bankInfo', 'bankName', v)} placeholder="Dutch Bangla Bank" icon={Building} />
                  <InputField label="Branch" value={formData.bankInfo.branch} onChange={(v) => handleInputChange('bankInfo', 'branch', v)} placeholder="Dhanmondi Branch" icon={MapPin} />
                  <InputField label="Account Number" value={formData.bankInfo.accountNumber} onChange={(v) => handleInputChange('bankInfo', 'accountNumber', v)} placeholder="********7890" icon={CreditCard} />
                  <InputField label="Routing Number" value={formData.bankInfo.routingNumber} onChange={(v) => handleInputChange('bankInfo', 'routingNumber', v)} placeholder="090260456" icon={CreditCard} />
                  <InputField label="SWIFT Code" value={formData.bankInfo.swiftCode} onChange={(v) => handleInputChange('bankInfo', 'swiftCode', v)} placeholder="DBBLBDDHXXX" icon={CreditCard} />
                  <InputField label="IBAN" value={formData.bankInfo.iban} onChange={(v) => handleInputChange('bankInfo', 'iban', v)} placeholder="BD33DBBL1234567890" icon={CreditCard} />
                </div>
              )}
              {section.id === 'transactions' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField label="Total Purchases" type="text" value={formData.transactionHistory.totalPurchases} onChange={(v) => handleInputChange('transactionHistory', 'totalPurchases', v)} placeholder="260000" icon={DollarSign} />
                  <InputField label="Outstanding Dues" type="text" value={formData.transactionHistory.outstandingDues} onChange={(v) => handleInputChange('transactionHistory', 'outstandingDues', v)} placeholder="0" icon={DollarSign} />
                  <InputField label="Advance Paid" type="text" value={formData.transactionHistory.advancePaid} onChange={(v) => handleInputChange('transactionHistory', 'advancePaid', v)} placeholder="0" icon={DollarSign} />
                  <InputField label="Last Purchase Date" type="date" value={formData.transactionHistory.lastPurchaseDate} onChange={(v) => handleInputChange('transactionHistory', 'lastPurchaseDate', v)} icon={Calendar} />
                  <InputField label="Last Purchase Amount" type="text" value={formData.transactionHistory.lastPurchaseAmount} onChange={(v) => handleInputChange('transactionHistory', 'lastPurchaseAmount', v)} placeholder="3250" icon={DollarSign} />
                  <InputField label="Total Transactions" type="text" value={formData.transactionHistory.totalTransactions} onChange={(v) => handleInputChange('transactionHistory', 'totalTransactions', v)} placeholder="12" icon={FileText} />
                  <InputField label="Average Order Value" type="text" value={formData.transactionHistory.averageOrderValue} onChange={(v) => handleInputChange('transactionHistory', 'averageOrderValue', v)} placeholder="2708" icon={DollarSign} />
                </div>
              )}
              {section.id === 'notes' && (
                <div className="space-y-6">
                  <TextAreaField label="Remarks" value={formData.notes.remarks} onChange={(v) => handleInputChange('notes', 'remarks', v)} placeholder="Regular customer..." rows={3} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField label="Assigned Manager" value={formData.notes.assignedManager} onChange={(v) => handleInputChange('notes', 'assignedManager', v)} placeholder="Rashid Khan" icon={User} />
                    <InputField label="Manager Contact" value={formData.notes.managerContact} onChange={(v) => handleInputChange('notes', 'managerContact', v)} placeholder="rashid@company.com" icon={Mail} />
                    <InputField label="Last Contact Date" type="date" value={formData.notes.lastContact} onChange={(v) => handleInputChange('notes', 'lastContact', v)} icon={Calendar} />
                    <InputField label="Next Follow-up Date" type="date" value={formData.notes.nextFollowUp} onChange={(v) => handleInputChange('notes', 'nextFollowUp', v)} icon={Calendar} />
                  </div>
                  <TextAreaField label="Special Instructions" value={formData.notes.specialInstructions} onChange={(v) => handleInputChange('notes', 'specialInstructions', v)} placeholder="Provide local delivery option..." rows={2} />
                </div>
              )}
            </FormSection>
          ))}

          <FormSection title="Documents & LC Links" icon={FileText} isExpanded={true} onToggle={() => {}}>
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Upload Documents</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-4">Drag and drop files here or click to upload</p>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" id="document-upload" />
                <label htmlFor="document-upload" className="px-4 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 cursor-pointer inline-block">Choose Files</label>
              </div>
              {documents.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h5>
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3"><FileText className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-700">{doc.name}</span><span className="text-xs text-gray-500">({doc.size})</span></div>
                        <button type="button" onClick={() => removeDocument(index)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">LC Links</h4>
                <button type="button" onClick={addLcLink} className="flex items-center space-x-2 px-3 py-1 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200"><Plus className="w-4 h-4" /><span>Add LC</span></button>
              </div>
              <div className="space-y-4">
                {lcLinks.map((lc, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3"><h5 className="font-medium text-gray-900">LC Link {index + 1}</h5><button type="button" onClick={() => removeLcLink(index)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <InputField label="LC Number" value={lc.lcNumber} onChange={(v) => updateLcLink(index, 'lcNumber', v)} placeholder="LC-2023-001" />
                      <SelectField label="Status" value={lc.status} onChange={(v) => updateLcLink(index, 'status', v)} options={[{ value: "Active", label: "Active" }, { value: "Expired", label: "Expired" }, { value: "Pending", label: "Pending" }, { value: "Completed", label: "Completed" }, { value: "Closed", label: "Closed" }]} />
                      <InputField label="LC Value" type="text" value={lc.value} onChange={(v) => updateLcLink(index, 'value', v)} placeholder="45250" />
                      <InputField label="Issue Date" type="date" value={lc.issueDate} onChange={(v) => updateLcLink(index, 'issueDate', v)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FormSection>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl shadow-lg p-6 space-y-4 sm:space-y-0">
            <Link to="/customers"><button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">Cancel</button></Link>
            <div className="flex items-center space-x-4"><span className="text-sm text-gray-600">Complete all sections to save</span></div>
            <button type="submit" className="px-6 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 font-medium">{editData ? 'Update Customer' : 'Save Customer'}</button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerForm;