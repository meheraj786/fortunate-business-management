import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  FileText,
  DollarSign,
  Truck,
  User,
  Package,
  Clipboard,
  FileIcon,
  X,
} from "lucide-react";
import api from "@/services/apiService";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

// Custom Hooks
import { useFormData, useUnits, useAccounts } from "@/hooks/formHooks";
import { useSectionManager } from "@/hooks/useSectionManager";

// Components
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import FileInput from "@/components/ui/FileInput";
import FormPageLayout from "@/components/ui/FormPageLayout";
import CostsSection from "@/components/LCForm/CostsSection";

const SECTIONS = [
  { id: "basicInfo", title: "Basic Information", icon: FileText },
  { id: "financialInfo", title: "Financial Information", icon: DollarSign },
  { id: "productInfo", title: "Product Information", icon: Package },
  { id: "shippingCustomsInfo", title: "Shipping & Customs", icon: Truck },
  { id: "agentTransportInfo", title: "Agent & Transport", icon: User },
  { id: "documentsNotes", title: "Documents & Notes", icon: Clipboard },
];

const LCForm = ({ onSave }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { units, isLoading: unitsLoading } = useUnits();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { expandedSections, toggleSection, setSectionRef } = useSectionManager(SECTIONS);

  const {
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
  } = useFormData(isEditMode, id, accounts);

  useEffect(() => {
    if (formData.financialInfo.lcAmountUsd && formData.financialInfo.exchangeRate) {
      const bdtAmount = parseFloat(formData.financialInfo.lcAmountUsd) * parseFloat(formData.financialInfo.exchangeRate);
      handleInputChange("financialInfo", "lcAmountBdt", bdtAmount.toFixed(2));
    }
  }, [formData.financialInfo.lcAmountUsd, formData.financialInfo.exchangeRate, handleInputChange]);

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
      setProductInfo(updatedProducts);
    }
  }, [formData.productInfo, setProductInfo]);

  // ৩. ফাইল হ্যান্ডলিং
  const handleFileChange = useCallback((files) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  }, [setUploadedFiles]);

  const handleFileRemove = useCallback((index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, [setUploadedFiles]);

  const handleExistingFileRemove = useCallback((fileId) => {
    const existingDocs = formData.documentsNotes?.uploadedDocuments || [];
    const updatedDocs = existingDocs.filter((doc) => doc._id !== fileId);
    handleInputChange("documentsNotes", "uploadedDocuments", updatedDocs);
    toast.success("Existing file marked for removal");
  }, [formData.documentsNotes, handleInputChange]);

  // ৪. সাবমিট হ্যান্ডলার
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payloadData = formatFormDataForSubmit();
      const payload = new FormData();
      payload.append("lc_data", JSON.stringify(payloadData));
      
      uploadedFiles.forEach((file) => {
        payload.append("documents", file);
      });

      if (isEditMode) {
        await api.patch(`/lc/update-lc/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("LC Updated Successfully");
        navigate(`/lc-details/${id}`);
      } else {
        await api.post(`/lc/create-lc`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("LC Created Successfully");
        navigate("/lc-management");
      }
      if (onSave) onSave(formData);
      resetForm();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(`Failed to ${isEditMode ? "update" : "create"} LC.`);
    }
  };

  const renderProductFields = (product, index) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 border border-gray-200 rounded-lg relative bg-gray-50 mb-4"
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
      <h4 className="font-semibold text-gray-900 mb-4">Product {index + 1}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InputField label="Item Name" value={product.itemName} onChange={(e) => handleProductChange(product.id, "itemName", e.target.value)} required />
        <InputField label="Thickness" value={product.thickness} onChange={(e) => handleProductChange(product.id, "thickness", e.target.value)} />
        <InputField label="Width" value={product.width} onChange={(e) => handleProductChange(product.id, "width", e.target.value)} />
        <InputField label="Length" value={product.length} onChange={(e) => handleProductChange(product.id, "length", e.target.value)} />
        <InputField label="Grade" value={product.grade} onChange={(e) => handleProductChange(product.id, "grade", e.target.value)} />
        <SelectField
          label="Unit"
          value={product.quantityUnit}
          onChange={(e) => handleProductChange(product.id, "quantityUnit", e.target.value)}
          options={units}
          required
        />
        <InputField label="Quantity" type="number" value={product.quantity} onChange={(e) => handleProductChange(product.id, "quantity", e.target.value)} required />
        <InputField label="Price (USD)" type="number" value={product.unitPriceUsd} onChange={(e) => handleProductChange(product.id, "unitPriceUsd", e.target.value)} required />
        <InputField label="Total (USD)" value={product.totalValueUsd} disabled />
      </div>
    </motion.div>
  );

  return (
    <FormPageLayout
      title={isEditMode ? "Edit Letter of Credit" : "Create New Letter of Credit"}
      subtitle={`Fill in the details below to ${isEditMode ? "update" : "create"} a new LC`}
      cancelLink={isEditMode ? `/lc-details/${id}` : "/lc-management"}
      onSubmit={handleSubmit}
      isEditMode={isEditMode}
      submitButtonText="LC"
      isLoading={unitsLoading || accountsLoading}
      isValid={validateForm()}
    >
      {SECTIONS.map((section) => (
        <FormSection
          key={section.id}
          title={section.title}
          icon={section.icon}
          isExpanded={expandedSections[section.id]}
          onToggle={() => toggleSection(section.id)}
          sectionRef={(el) => setSectionRef(section.id, el)}
        >
          {section.id === "basicInfo" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <InputField label="LC Number" value={formData.basicInfo.lcNumber} onChange={(e) => handleInputChange("basicInfo", "lcNumber", e.target.value)} required />
              <InputField label="LC Opening Date" type="date" value={formData.basicInfo.lcOpeningDate} onChange={(e) => handleInputChange("basicInfo", "lcOpeningDate", e.target.value)} required />
              <SelectField
                label="Status"
                value={formData.basicInfo.status}
                onChange={(e) => handleInputChange("basicInfo", "status", e.target.value)}
                options={[{ value: "Draft", label: "Draft" }, { value: "Active", label: "Active" }, { value: "Completed", label: "Completed" }, { value: "Cancelled", label: "Cancelled" }]}
                required
              />
              <SelectField
                label="Choose an account"
                value={formData.basicInfo.accountId}
                onChange={(e) => handleInputChange("basicInfo", "accountId", e.target.value)}
                options={accounts.filter((acc) => acc.accountType === "Bank").map((acc) => ({ value: acc._id, label: `${acc.bankName} (${acc.accountHolderName}) - ${acc.accountNumber}` }))}
                placeholder="Select Bank"
                required
              />
              <InputField label="Supplier Name" value={formData.basicInfo.supplierName} onChange={(e) => handleInputChange("basicInfo", "supplierName", e.target.value)} required />
              <InputField label="Supplier Country" value={formData.basicInfo.supplierCountry} onChange={(e) => handleInputChange("basicInfo", "supplierCountry", e.target.value)} required />
            </div>
          )}

          {section.id === "financialInfo" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <InputField label="LC Amount (USD)" type="number" value={formData.financialInfo.lcAmountUsd} onChange={(e) => handleInputChange("financialInfo", "lcAmountUsd", e.target.value)} required />
                <InputField label="Exchange Rate" type="number" value={formData.financialInfo.exchangeRate} onChange={(e) => handleInputChange("financialInfo", "exchangeRate", e.target.value)} required />
                <InputField label="LC Amount (BDT)" type="number" value={formData.financialInfo.lcAmountBdt} disabled />
              </div>
              <CostsSection
                costs={formData.financialInfo.costs}
                section="financialInfo"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("financialInfo")}
                onRemoveCost={(costId) => removeCost("financialInfo", costId)}
                accounts={accounts}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />
            </div>
          )}

          {section.id === "productInfo" && (
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence>
                {formData.productInfo.map((product, index) => renderProductFields(product, index))}
              </AnimatePresence>
              <button type="button" onClick={addProduct} className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-[#003b75] hover:text-[#003b75] transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add Another Product</span>
              </button>
            </div>
          )}

          {section.id === "shippingCustomsInfo" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <InputField label="Port of Shipment" value={formData.shippingCustomsInfo.portOfShipment} onChange={(e) => handleInputChange("shippingCustomsInfo", "portOfShipment", e.target.value)} />
                <InputField label="Expected Arrival Date" type="date" value={formData.shippingCustomsInfo.expectedArrivalDate} onChange={(e) => handleInputChange("shippingCustomsInfo", "expectedArrivalDate", e.target.value)} />
              </div>
              <CostsSection
                costs={formData.shippingCustomsInfo.costs}
                section="shippingCustomsInfo"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("shippingCustomsInfo")}
                onRemoveCost={(costId) => removeCost("shippingCustomsInfo", costId)}
                accounts={accounts}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />
            </div>
          )}

          {section.id === "agentTransportInfo" && (
            <div className="flex flex-col">
              <CostsSection
                costs={formData.agentTransportInfo.costs}
                section="agentTransportInfo"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("agentTransportInfo")}
                onRemoveCost={(costId) => removeCost("agentTransportInfo", costId)}
                accounts={accounts}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />
            </div>
          )}

          {section.id === "documentsNotes" && (
            <div className="space-y-6">
              
              {/* --- EXISTING DOCUMENTS DISPLAY --- */}
              {isEditMode && formData.documentsNotes.uploadedDocuments?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Existing Documents</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.documentsNotes.uploadedDocuments.map((doc) => (
                      <div key={doc._id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex items-center min-w-0">
                          <FileIcon className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                          <span className="text-xs text-blue-900 truncate font-medium">{doc.originalName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExistingFileRemove(doc._id)}
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- NEW FILE UPLOAD --- */}

          {section.id === "documentsNotes" && (
            <div className="space-y-6">
              <TextAreaField
                label="Note"
                value={formData.documentsNotes?.note || ""}
                onChange={(e) => handleInputChange("documentsNotes", "note", e.target.value)}
                rows={4}
              />
              
              {/* বিদ্যমান ডকুমেন্টস ডিসপ্লে */}
              {isEditMode && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Existing Documents</h4>
                  {formData.documentsNotes?.uploadedDocuments?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.documentsNotes.uploadedDocuments.map((doc) => (
                        <div key={doc._id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg group shadow-sm">
                          <div className="flex items-center min-w-0">
                            <FileIcon className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                            <span className="text-xs text-blue-900 truncate font-medium">
                              {doc.originalName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleExistingFileRemove(doc._id)}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-all"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No existing documents found.</p>
                  )}
                </div>
              )}

              {/* নতুন ফাইল আপলোড */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {isEditMode ? "Upload New Documents" : "Upload Documents"}
                </h4>
                <FileInput
                  files={uploadedFiles}
                  onFileChange={(files) => setUploadedFiles(prev => [...prev, ...files])}
                  onFileRemove={(index) => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                  maxSize={10}
                  acceptedTypes="*/*"
                  label="Drop files here or click to upload"
                />
              </div>
            </div>
          )}
            </div>
          )}
        </FormSection>
      ))}
    </FormPageLayout>
  );
};

LCForm.propTypes = {
  onSave: PropTypes.func,
};

export default React.memo(LCForm);