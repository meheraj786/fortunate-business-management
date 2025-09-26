import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';

import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Save,
  X,
  FileText,
  Building,
  User,
  Ship,
  Package,
  CreditCard,
  FileCheck,
  Banknote,
  Truck
} from 'lucide-react';

const LCForm = ({ onSave, editData = null }) => {
  const [expandedSections, setExpandedSections] = useState({});

  // Initialize form data with editData or empty values
  const initialFormData = {
    lcNumber: editData?.lcNumber || "",
    status: editData?.status || "Active",
    openDate: editData?.openDate || "",
    dueDate: editData?.dueDate || "",
    products: editData?.products || "",
    quantity: editData?.quantity || "",
    totalAmount: editData?.totalAmount || "",
    beneficiary: editData?.beneficiary || "",
    basicInfo: {
      lcNumber: editData?.basicInfo?.lcNumber || "",
      lcType: editData?.basicInfo?.lcType || "Sight LC",
      issueDate: editData?.basicInfo?.issueDate || "",
      expiryDate: editData?.basicInfo?.expiryDate || "",
      lcValue: editData?.basicInfo?.lcValue || "",
      currency: editData?.basicInfo?.currency || "USD",
      status: editData?.basicInfo?.status || "Active",
    },
    buyerInfo: {
      name: editData?.buyerInfo?.name || "",
      company: editData?.buyerInfo?.company || "",
      address: editData?.buyerInfo?.address || "",
      contactPerson: editData?.buyerInfo?.contactPerson || "",
      phone: editData?.buyerInfo?.phone || "",
      email: editData?.buyerInfo?.email || "",
    },
    sellerInfo: {
      name: editData?.sellerInfo?.name || "",
      company: editData?.sellerInfo?.company || "",
      address: editData?.sellerInfo?.address || "",
      bankName: editData?.sellerInfo?.bankName || "",
      accountNumber: editData?.sellerInfo?.accountNumber || "",
      swiftCode: editData?.sellerInfo?.swiftCode || "",
      email: editData?.sellerInfo?.email || "",
    },
    bankInfo: {
      issuingBank: editData?.bankInfo?.issuingBank || "",
      advisingBank: editData?.bankInfo?.advisingBank || "",
      correspondentBank: editData?.bankInfo?.correspondentBank || "",
      swiftCode: editData?.bankInfo?.swiftCode || "",
      branch: editData?.bankInfo?.branch || "",
      accountManager: editData?.bankInfo?.accountManager || "",
      managerContact: editData?.bankInfo?.managerContact || "",
    },
    shipmentInfo: {
      portOfLoading: editData?.shipmentInfo?.portOfLoading || "",
      portOfDischarge: editData?.shipmentInfo?.portOfDischarge || "",
      shipmentDate: editData?.shipmentInfo?.shipmentDate || "",
      lastShipmentDate: editData?.shipmentInfo?.lastShipmentDate || "",
      transportType: editData?.shipmentInfo?.transportType || "Sea Freight",
      shippingCompany: editData?.shipmentInfo?.shippingCompany || "",
      insurance: editData?.shipmentInfo?.insurance || "",
      incoterms: editData?.shipmentInfo?.incoterms || "FOB",
    },
    goodsInfo: editData?.goodsInfo || [{
      productName: "",
      hsCode: "",
      quantity: "",
      unit: "YARDS",
      unitPrice: "",
      totalValue: "",
      description: "",
    }],
    paymentInfo: {
      terms: editData?.paymentInfo?.terms || "At Sight",
      marginAmount: editData?.paymentInfo?.marginAmount || "",
      bankCharges: editData?.paymentInfo?.bankCharges || "",
      commission: editData?.paymentInfo?.commission || "",
      dueDate: editData?.paymentInfo?.dueDate || "",
      status: editData?.paymentInfo?.status || "Active",
      paidAmount: editData?.paymentInfo?.paidAmount || "",
      paymentDate: editData?.paymentInfo?.paymentDate || "",
    },
    documentsRequired: editData?.documentsRequired || [],
    tracking: {
      status: editData?.tracking?.status || "LC Opened",
      remarks: editData?.tracking?.remarks || "",
      attachments: editData?.tracking?.attachments || [],
      lastUpdated: editData?.tracking?.lastUpdated || new Date().toISOString(),
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  const sections = [
    { id: 'basic', title: 'Basic Information', icon: FileText },
    { id: 'buyer', title: 'Buyer Information', icon: User },
    { id: 'seller', title: 'Seller Information', icon: Building },
    { id: 'bank', title: 'Bank Information', icon: CreditCard },
    { id: 'shipment', title: 'Shipment Details', icon: Ship },
    { id: 'goods', title: 'Goods Information', icon: Package },
    { id: 'payment', title: 'Payment Details', icon: Banknote },
    { id: 'documents', title: 'Documents Required', icon: FileCheck },
  ];

  const documentOptions = [
    "Commercial Invoice",
    "Packing List",
    "Bill of Lading",
    "Insurance Certificate",
    "Certificate of Origin",
    "GSP Certificate",
    "Inspection Certificate",
    "Phytosanitary Certificate"
  ];

  const transportOptions = [
    { value: "Sea Freight", label: "Sea Freight" },
    { value: "Air Freight", label: "Air Freight" },
    { value: "Road Transport", label: "Road Transport" },
    { value: "Rail Transport", label: "Rail Transport" }
  ];

  const incotermsOptions = [
    { value: "FOB", label: "FOB (Free On Board)" },
    { value: "CIF", label: "CIF (Cost, Insurance and Freight)" },
    { value: "EXW", label: "EXW (Ex Works)" },
    { value: "DDP", label: "DDP (Delivered Duty Paid)" }
  ];

  // Auto-expand first section on load
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

  const handleGoodsInfoChange = (index, field, value) => {
    const updatedGoods = formData.goodsInfo.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    
    // Auto-calculate totalValue if quantity and unitPrice are provided
    if ((field === 'quantity' || field === 'unitPrice') && updatedGoods[index]) {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedGoods[index].quantity) || 0;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(updatedGoods[index].unitPrice) || 0;
      
      if (quantity > 0 && unitPrice > 0) {
        updatedGoods[index].totalValue = (quantity * unitPrice).toFixed(2);
      }
    }
    
    setFormData(prev => ({ ...prev, goodsInfo: updatedGoods }));
  };

  const addGoodsItem = () => {
    setFormData(prev => ({
      ...prev,
      goodsInfo: [
        ...prev.goodsInfo,
        {
          productName: "",
          hsCode: "",
          quantity: "",
          unit: "YARDS",
          unitPrice: "",
          totalValue: "",
          description: "",
        }
      ]
    }));
  };

  const removeGoodsItem = (index) => {
    if (formData.goodsInfo.length > 1) {
      setFormData(prev => ({
        ...prev,
        goodsInfo: prev.goodsInfo.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleDocument = (document) => {
    setFormData(prev => ({
      ...prev,
      documentsRequired: prev.documentsRequired.includes(document)
        ? prev.documentsRequired.filter(doc => doc !== document)
        : [...prev.documentsRequired, document]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.basicInfo.lcNumber || !formData.basicInfo.issueDate || !formData.basicInfo.expiryDate) {
      alert('Please fill in all required fields in Basic Information section');
      return;
    }
    
    if (!formData.buyerInfo.name || !formData.buyerInfo.company) {
      alert('Please fill in all required fields in Buyer Information section');
      return;
    }
    
    onSave(formData);
  };

  const SectionHeader = ({ section, index }) => {
    const Icon = section.icon;
    const isExpanded = expandedSections[section.id];
    
    return (
      <div
        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => toggleSection(section.id)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#003b75] rounded-lg">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            <p className="text-sm text-gray-600">Section {index + 1} of {sections.length}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </div>
    );
  };

  const InputField = ({ label, type = "text", value, onChange, required = false, placeholder = "", className = "" }) => (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200"
      />
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
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editData ? 'Edit Letter of Credit' : 'Create New Letter of Credit'}
              </h1>
              <p className="text-gray-600">Fill in the details below to {editData ? 'update' : 'create'} a new LC</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/lc-management">
                <button
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
                <span>{editData ? 'Update LC' : 'Save LC'}</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <SectionHeader section={sections[0]} index={0} />
            
            {expandedSections.basic && (
              <div
                className="p-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    label="LC Number"
                    value={formData.basicInfo.lcNumber}
                    onChange={(value) => handleNestedInputChange('basicInfo', 'lcNumber', value)}
                    required
                    placeholder="LC-2023-001"
                  />
                  <SelectField
                    label="LC Type"
                    value={formData.basicInfo.lcType}
                    onChange={(value) => handleNestedInputChange('basicInfo', 'lcType', value)}
                    options={[
                      { value: 'Sight LC', label: 'Sight LC' },
                      { value: 'Usance LC', label: 'Usance LC' },
                      { value: 'Revocable LC', label: 'Revocable LC' },
                      { value: 'Irrevocable LC', label: 'Irrevocable LC' }
                    ]}
                  />
                  <InputField
                    label="Issue Date"
                    type="date"
                    value={formData.basicInfo.issueDate}
                    onChange={(value) => handleNestedInputChange('basicInfo', 'issueDate', value)}
                    required
                  />
                  <InputField
                    label="Expiry Date"
                    type="date"
                    value={formData.basicInfo.expiryDate}
                    onChange={(value) => handleNestedInputChange('basicInfo', 'expiryDate', value)}
                    required
                  />
                  <InputField
                    label="LC Value"
                    type="number"
                    value={formData.basicInfo.lcValue}
                    onChange={(value) => handleNestedInputChange('basicInfo', 'lcValue', value)}
                    required
                    placeholder="45250"
                  />
                  <SelectField
                    label="Currency"
                    value={formData.basicInfo.currency}
                    onChange={(value) => handleNestedInputChange('basicInfo', 'currency', value)}
                    options={[
                      { value: 'USD', label: 'USD' },
                      { value: 'EUR', label: 'EUR' },
                      { value: 'GBP', label: 'GBP' },
                      { value: 'BDT', label: 'BDT' }
                    ]}
                  />
                  <SelectField
                    label="Status"
                    value={formData.basicInfo.status}
                    onChange={(value) => handleNestedInputChange('basicInfo', 'status', value)}
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Expired', label: 'Expired' },
                      { value: 'Cancelled', label: 'Cancelled' },
                      { value: 'Amended', label: 'Amended' }
                    ]}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Buyer Information */}
          {/* <section
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <SectionHeader section={sections[1]} index={1} />
            
            {expandedSections.buyer && (
              <div
                className="p-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Buyer Name"
                    value={formData.buyerInfo.name}
                    onChange={(value) => handleNestedInputChange('buyerInfo', 'name', value)}
                    required
                    placeholder="John Smith"
                  />
                  <InputField
                    label="Company"
                    value={formData.buyerInfo.company}
                    onChange={(value) => handleNestedInputChange('buyerInfo', 'company', value)}
                    required
                    placeholder="Global Imports Inc."
                  />
                  <InputField
                    label="Contact Person"
                    value={formData.buyerInfo.contactPerson}
                    onChange={(value) => handleNestedInputChange('buyerInfo', 'contactPerson', value)}
                    placeholder="Michael Johnson"
                  />
                  <InputField
                    label="Phone"
                    type="tel"
                    value={formData.buyerInfo.phone}
                    onChange={(value) => handleNestedInputChange('buyerInfo', 'phone', value)}
                    placeholder="+1 (555) 123-4567"
                  />
                  <InputField
                    label="Email"
                    type="email"
                    value={formData.buyerInfo.email}
                    onChange={(value) => handleNestedInputChange('buyerInfo', 'email', value)}
                    required
                    placeholder="purchase@globalimports.com"
                  />
                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Address"
                      value={formData.buyerInfo.address}
                      onChange={(value) => handleNestedInputChange('buyerInfo', 'address', value)}
                      required
                      placeholder="123 Trade Center, New York, NY 10001, USA"
                    />
                  </div>
                </div>
              </div>
            )}
          </section> */}

          {/* Seller Information */}
          <section
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <SectionHeader section={sections[2]} index={2} />
            
            {expandedSections.seller && (
              <div
                className="p-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Seller Name"
                    value={formData.sellerInfo.name}
                    onChange={(value) => handleNestedInputChange('sellerInfo', 'name', value)}
                    required
                    placeholder="ABC Textiles Owner"
                  />
                  <InputField
                    label="Company"
                    value={formData.sellerInfo.company}
                    onChange={(value) => handleNestedInputChange('sellerInfo', 'company', value)}
                    required
                    placeholder="ABC Textiles Ltd"
                  />
                  <InputField
                    label="Bank Name"
                    value={formData.sellerInfo.bankName}
                    onChange={(value) => handleNestedInputChange('sellerInfo', 'bankName', value)}
                    placeholder="Dutch Bangla Bank"
                  />
                  <InputField
                    label="Account Number"
                    value={formData.sellerInfo.accountNumber}
                    onChange={(value) => handleNestedInputChange('sellerInfo', 'accountNumber', value)}
                    placeholder="1234567890"
                  />
                  <InputField
                    label="SWIFT Code"
                    value={formData.sellerInfo.swiftCode}
                    onChange={(value) => handleNestedInputChange('sellerInfo', 'swiftCode', value)}
                    placeholder="DBBLBDDHXXX"
                  />
                  <InputField
                    label="Email"
                    type="email"
                    value={formData.sellerInfo.email}
                    onChange={(value) => handleNestedInputChange('sellerInfo', 'email', value)}
                    placeholder="info@abctextiles.com"
                  />
                  <div className="md:col-span-2">
                    <TextAreaField
                      label="Address"
                      value={formData.sellerInfo.address}
                      onChange={(value) => handleNestedInputChange('sellerInfo', 'address', value)}
                      required
                      placeholder="456 Textile Zone, Dhaka, Bangladesh"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Bank Information */}
          <section
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <SectionHeader section={sections[3]} index={3} />
            
            {expandedSections.bank && (
              <div
                className="p-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Issuing Bank"
                    value={formData.bankInfo.issuingBank}
                    onChange={(value) => handleNestedInputChange('bankInfo', 'issuingBank', value)}
                    placeholder="New York Commercial Bank"
                  />
                  <InputField
                    label="Advising Bank"
                    value={formData.bankInfo.advisingBank}
                    onChange={(value) => handleNestedInputChange('bankInfo', 'advisingBank', value)}
                    placeholder="Dutch Bangla Bank Main Branch"
                  />
                  <InputField
                    label="Correspondent Bank"
                    value={formData.bankInfo.correspondentBank}
                    onChange={(value) => handleNestedInputChange('bankInfo', 'correspondentBank', value)}
                    placeholder="Standard Chartered Bank"
                  />
                  <InputField
                    label="SWIFT Code"
                    value={formData.bankInfo.swiftCode}
                    onChange={(value) => handleNestedInputChange('bankInfo', 'swiftCode', value)}
                    placeholder="NYCBUS33"
                  />
                  <InputField
                    label="Branch"
                    value={formData.bankInfo.branch}
                    onChange={(value) => handleNestedInputChange('bankInfo', 'branch', value)}
                    placeholder="Main Branch"
                  />
                  <InputField
                    label="Account Manager"
                    value={formData.bankInfo.accountManager}
                    onChange={(value) => handleNestedInputChange('bankInfo', 'accountManager', value)}
                    placeholder="Sarah Williams"
                  />
                  <InputField
                    label="Manager Contact"
                    value={formData.bankInfo.managerContact}
                    onChange={(value) => handleNestedInputChange('bankInfo', 'managerContact', value)}
                    placeholder="sarah.w@nycb.com"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Shipment Details */}
          <section
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <SectionHeader section={sections[4]} index={4} />
            
            {expandedSections.shipment && (
              <div
                className="p-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Port of Loading"
                    value={formData.shipmentInfo.portOfLoading}
                    onChange={(value) => handleNestedInputChange('shipmentInfo', 'portOfLoading', value)}
                    placeholder="Chittagong Port, Bangladesh"
                  />
                  <InputField
                    label="Port of Discharge"
                    value={formData.shipmentInfo.portOfDischarge}
                    onChange={(value) => handleNestedInputChange('shipmentInfo', 'portOfDischarge', value)}
                    placeholder="Port of New York, USA"
                  />
                  <InputField
                    label="Shipment Date"
                    type="date"
                    value={formData.shipmentInfo.shipmentDate}
                    onChange={(value) => handleNestedInputChange('shipmentInfo', 'shipmentDate', value)}
                  />
                  <InputField
                    label="Last Shipment Date"
                    type="date"
                    value={formData.shipmentInfo.lastShipmentDate}
                    onChange={(value) => handleNestedInputChange('shipmentInfo', 'lastShipmentDate', value)}
                  />
                  <SelectField
                    label="Transport Type"
                    value={formData.shipmentInfo.transportType}
                    onChange={(value) => handleNestedInputChange('shipmentInfo', 'transportType', value)}
                    options={transportOptions}
                  />
                  <InputField
                    label="Shipping Company"
                    value={formData.shipmentInfo.shippingCompany}
                    onChange={(value) => handleNestedInputChange('shipmentInfo', 'shippingCompany', value)}
                    placeholder="Maersk Line"
                  />
                  <InputField
                    label="Insurance"
                    value={formData.shipmentInfo.insurance}
                    onChange={(value) => handleNestedInputChange('shipmentInfo', 'insurance', value)}
                    placeholder="All Risk Coverage by Sadharan Bima"
                  />
                  <SelectField
                    label="Incoterms"
                    value={formData.shipmentInfo.incoterms}
                    onChange={(value) => handleNestedInputChange('shipmentInfo', 'incoterms', value)}
                    options={incotermsOptions}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Goods Information */}
          <section
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <SectionHeader section={sections[5]} index={5} />
            
            {expandedSections.goods && (
              <div
                className="p-6 border-t border-gray-200"
              >
                <div className="space-y-6">
                  {formData.goodsInfo.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg relative bg-gray-50"
                    >
                      {formData.goodsInfo.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGoodsItem(index)}
                          className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          aria-label={`Remove product ${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      <h4 className="font-semibold text-gray-900 mb-4">Product {index + 1}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InputField
                          label="Product Name"
                          value={item.productName}
                          onChange={(value) => handleGoodsInfoChange(index, 'productName', value)}
                          required
                          placeholder="Cotton Fabric"
                        />
                        <InputField
                          label="HS Code"
                          value={item.hsCode}
                          onChange={(value) => handleGoodsInfoChange(index, 'hsCode', value)}
                          placeholder="5208.11.00"
                        />
                        <InputField
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(value) => handleGoodsInfoChange(index, 'quantity', value)}
                          required
                          placeholder="3000"
                        />
                        <SelectField
                          label="Unit"
                          value={item.unit}
                          onChange={(value) => handleGoodsInfoChange(index, 'unit', value)}
                          options={[
                            { value: 'YARDS', label: 'Yards' },
                            { value: 'METERS', label: 'Meters' },
                            { value: 'KGS', label: 'Kilograms' },
                            { value: 'PCS', label: 'Pieces' },
                            { value: 'LITERS', label: 'Liters' },
                            { value: 'TONS', label: 'Tons' }
                          ]}
                        />
                        <InputField
                          label="Unit Price"
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(value) => handleGoodsInfoChange(index, 'unitPrice', value)}
                          required
                          placeholder="12.00"
                        />
                        <InputField
                          label="Total Value"
                          type="number"
                          step="0.01"
                          value={item.totalValue}
                          onChange={(value) => handleGoodsInfoChange(index, 'totalValue', value)}
                          required
                          placeholder="36000.00"
                          className="bg-gray-100"
                        />
                        <div className="md:col-span-2 lg:col-span-3">
                          <TextAreaField
                            label="Description"
                            value={item.description}
                            onChange={(value) => handleGoodsInfoChange(index, 'description', value)}
                            placeholder="Premium cotton fabric for garment manufacturing"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addGoodsItem}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-[#003b75] hover:text-[#003b75] transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add Another Product</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Payment Details */}
          <section
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <SectionHeader section={sections[6]} index={6} />
            
            {expandedSections.payment && (
              <div
                className="p-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SelectField
                    label="Payment Terms"
                    value={formData.paymentInfo.terms}
                    onChange={(value) => handleNestedInputChange('paymentInfo', 'terms', value)}
                    options={[
                      { value: 'At Sight', label: 'At Sight' },
                      { value: '30 Days', label: '30 Days' },
                      { value: '60 Days', label: '60 Days' },
                      { value: '90 Days', label: '90 Days' },
                      { value: 'Deferred Payment', label: 'Deferred Payment' }
                    ]}
                  />
                  <InputField
                    label="Margin Amount"
                    type="number"
                    step="0.01"
                    value={formData.paymentInfo.marginAmount}
                    onChange={(value) => handleNestedInputChange('paymentInfo', 'marginAmount', value)}
                    placeholder="9050.00"
                  />
                  <InputField
                    label="Bank Charges"
                    type="number"
                    step="0.01"
                    value={formData.paymentInfo.bankCharges}
                    onChange={(value) => handleNestedInputChange('paymentInfo', 'bankCharges', value)}
                    placeholder="300.00"
                  />
                  <InputField
                    label="Commission"
                    type="number"
                    step="0.01"
                    value={formData.paymentInfo.commission}
                    onChange={(value) => handleNestedInputChange('paymentInfo', 'commission', value)}
                    placeholder="450.00"
                  />
                  <InputField
                    label="Due Date"
                    type="date"
                    value={formData.paymentInfo.dueDate}
                    onChange={(value) => handleNestedInputChange('paymentInfo', 'dueDate', value)}
                  />
                  <SelectField
                    label="Payment Status"
                    value={formData.paymentInfo.status}
                    onChange={(value) => handleNestedInputChange('paymentInfo', 'status', value)}
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Paid', label: 'Paid' },
                      { value: 'Overdue', label: 'Overdue' },
                      { value: 'Cancelled', label: 'Cancelled' }
                    ]}
                  />
                  <InputField
                    label="Paid Amount"
                    type="number"
                    step="0.01"
                    value={formData.paymentInfo.paidAmount}
                    onChange={(value) => handleNestedInputChange('paymentInfo', 'paidAmount', value)}
                    placeholder="0.00"
                  />
                  <InputField
                    label="Payment Date"
                    type="date"
                    value={formData.paymentInfo.paymentDate}
                    onChange={(value) => handleNestedInputChange('paymentInfo', 'paymentDate', value)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Documents Required */}
          <section
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <SectionHeader section={sections[7]} index={7} />
            
            {expandedSections.documents && (
              <div
                className="p-6 border-t border-gray-200"
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Select all required documents for this LC</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {documentOptions.map((doc) => (
                    <label
                      key={doc}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={formData.documentsRequired.includes(doc)}
                        onChange={() => toggleDocument(doc)}
                        className="w-4 h-4 text-[#003b75] rounded focus:ring-[#003b75]"
                      />
                      <span className="text-sm font-medium text-gray-700">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

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
