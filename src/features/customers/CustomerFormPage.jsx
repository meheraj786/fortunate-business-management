import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { showSuccessToast } from "@/utils/notifications";

// Components
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import FileInput from "@/components/ui/FileInput";
import FormPageLayout from "@/components/ui/FormPageLayout";
import Button from "@/components/ui/Button";

// Icons
import {
  User,
  Building,
  Phone,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  Trash2,
  FileIcon,
} from "lucide-react";

// Custom Hooks
import { useSectionManager } from "@/hooks/useSectionManager";
import {
  useCreateCustomer,
  useCustomer,
  useUpdateCustomer,
} from "../../api/hooks/customer";

const CustomerForm = ({ onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: customerData, isLoading: isCustomerDataLoading } =
    useCustomer(id);
  const customer = customerData?.data;

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: useMemo(() => {
      if (isEditMode && customer) {
        return {
          name: customer.name || "",
          companyName: customer.companyName || "",
          customerType: customer.customerType || "Retail",
          customerStatus: customer.customerStatus || "Active",
          joinDate: customer.joinDate
            ? new Date(customer.joinDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          creditLimit: customer.creditLimit || "",
          phone: customer.phone || "",
          email: customer.email || "",
          billingAddress: customer.billingAddress || "",
          customerNote: customer.customerNote || "",
          openingDue: customer.openingDue || "",
          documents: customer.documents || [],
        };
      }
      return {
        name: "",
        companyName: "",
        customerType: "Retail",
        customerStatus: "Active",
        joinDate: new Date().toISOString().split("T")[0],
        creditLimit: "",
        phone: "",
        email: "",
        billingAddress: "",
        customerNote: "",
        openingDue: "",
        documents: [],
      };
    }, [isEditMode, customer]),
  });

  useEffect(() => {
    if (isEditMode && customer) {
      reset({
        name: customer.name || "",
        companyName: customer.companyName || "",
        customerType: customer.customerType || "Retail",
        customerStatus: customer.customerStatus || "Active",
        joinDate: customer.joinDate
          ? new Date(customer.joinDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        creditLimit: customer.creditLimit || "",
        phone: customer.phone || "",
        email: customer.email || "",
        billingAddress: customer.billingAddress || "",
        customerNote: customer.customerNote || "",
        openingDue: customer.openingDue || "",
        documents: customer.documents || [],
      });
    }
  }, [isEditMode, customer, reset]);

  const [newUploadedFiles, setNewUploadedFiles] = useState([]);
  const updateCustomerMutation = useUpdateCustomer();
  const createCustomerMutation = useCreateCustomer();

  const SECTIONS = useMemo(
    () => [
      {
        id: "basic",
        title: "Basic Information",
        icon: User,
        defaultOpen: true,
      },
      {
        id: "contact",
        title: "Contact Information",
        icon: Phone,
        defaultOpen: true,
      },
      { id: "others", title: "Others", icon: FileText, defaultOpen: true },
    ],
    [],
  );

  const { expandedSections, toggleSection, setSectionRef } =
    useSectionManager(SECTIONS);

  const customerTypes = useMemo(
    () => [
      { value: "Retail", label: "Retail" },
      { value: "Wholesale", label: "Wholesale" },
    ],
    [],
  );
  const statusOptions = useMemo(
    () => [
      { value: "Active", label: "Active" },
      { value: "Suspended", label: "Suspended" },
    ],
    [],
  );

  const handleExistingFileRemove = (fileId) => {
    const currentDocs = watch("documents");
    setValue(
      "documents",
      currentDocs.filter((doc) => doc._id !== fileId),
    );
    showSuccessToast("Existing file marked for removal.");
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("customerData", JSON.stringify(data));
    newUploadedFiles.forEach((file) => formData.append("documents", file));

    const mutationOptions = {
      onSuccess: (responseData) => {
        if (onSave) onSave(responseData);
        navigate("/customers");
      },
    };

    if (isEditMode && id) {
      updateCustomerMutation.mutate(
        { id: id, data: formData },
        mutationOptions,
      );
    } else {
      createCustomerMutation.mutate(formData, mutationOptions);
    }
  };

  return (
    <FormPageLayout
      title={isEditMode ? "Edit Customer" : "Add New Customer"}
      subtitle={
        isEditMode
          ? "Update customer information and details"
          : "Complete the form below to add a new customer"
      }
      cancelLink="/customers"
      onSubmit={handleSubmit(onSubmit)}
      isEditMode={isEditMode}
      submitButtonText="Customer"
      isLoading={isSubmitting || isCustomerDataLoading}
      isValid={isValid}
    >
      {SECTIONS.map((section) => (
        <FormSection
          key={section.id}
          title={section.title}
          icon={section.icon}
          isExpanded={expandedSections[section.id]}
          onToggle={() => toggleSection(section.id)}
          sectionRef={(el) => setSectionRef(section.id, el)}
          ariaLabel={`${section.title} section`}
          defaultOpen={section.defaultOpen}
        >
          {section.id === "basic" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <InputField
                label="Full Name"
                name="name"
                register={register}
                required
                placeholder="Ahmed Hassan"
                icon={User}
                error={errors.name?.message}
                validation={{ required: "Full name is required" }}
              />
              <InputField
                label="Company Name"
                name="companyName"
                register={register}
                placeholder="Hassan Trading"
                icon={Building}
                error={errors.companyName?.message}
              />
              <SelectField
                label="Customer Type"
                name="customerType"
                register={register}
                options={customerTypes}
                required
                icon={Building}
                error={errors.customerType?.message}
                validation={{ required: "Customer type is required" }}
              />
              <SelectField
                label="Customer Status"
                name="customerStatus"
                register={register}
                options={statusOptions}
                required
                icon={Shield}
                error={errors.customerStatus?.message}
                validation={{ required: "Customer status is required" }}
              />
              <InputField
                label="Customer Join"
                name="joinDate"
                register={register}
                type="date"
                required
                icon={Calendar}
                error={errors.joinDate?.message}
                validation={{ required: "Join date is required" }}
              />
              <InputField
                label="Credit Limit"
                name="creditLimit"
                register={register}
                type="number"
                placeholder="5000"
                icon={DollarSign}
                min="0"
                step="0.01"
                error={errors.creditLimit?.message}
                validation={{
                  valueAsNumber: true,
                  min: { value: 0, message: "Credit limit cannot be negative" },
                }}
              />
              <InputField
                label="Opening Due"
                name="openingDue"
                register={register}
                type="number"
                placeholder="0"
                icon={DollarSign}
                min="0"
                step="any"
                error={errors.openingDue?.message}
                validation={{ valueAsNumber: true }}
              />
            </div>
          )}

          {section.id === "contact" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <InputField
                label="Phone Number"
                name="phone"
                register={register}
                required
                placeholder="+880 1712-345678"
                icon={Phone}
                error={errors.phone?.message}
                validation={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^[+]?[0-9\s\-()]+$/,
                    message: "Invalid phone number format",
                  },
                }}
              />
              <InputField
                label="Email Address"
                name="email"
                register={register}
                type="email"
                placeholder="ahmed.hassan@email.com"
                icon={Mail}
                error={errors.email?.message}
                validation={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
              />
              <div className="lg:col-span-2">
                <TextAreaField
                  label="Billing Address"
                  name="billingAddress"
                  register={register}
                  required
                  placeholder="45 Dhanmondi Road, Dhaka-1205, Bangladesh"
                  rows={2}
                  autoResize
                  error={errors.billingAddress?.message}
                  validation={{ required: "Billing address is required" }}
                />
              </div>
            </div>
          )}

          {section.id === "others" && (
            <div className="space-y-6">
              <TextAreaField
                label="Notes"
                name="customerNote"
                register={register}
                placeholder="Add any relevant notes here..."
                rows={4}
                autoResize
                error={errors.customerNote?.message}
              />
              {isEditMode && watch("documents")?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Existing Documents
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {watch("documents").map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between p-3 bg-gray-100 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center min-w-0">
                          <FileIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                          <span className="text-xs text-gray-900 truncate font-medium">
                            {doc.originalName}
                          </span>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleExistingFileRemove(doc._id)}
                          variant="subtle"
                          className="!p-1.5 text-red-600 hover:bg-red-100"
                          aria-label="Remove document"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {isEditMode ? "Upload New Documents" : "Upload Documents"}
                </h4>
                <FileInput
                  files={newUploadedFiles}
                  onFileChange={(files) =>
                    setNewUploadedFiles((prev) => [...prev, ...files])
                  }
                  onFileRemove={(index) =>
                    setNewUploadedFiles((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                  maxSize={10}
                  acceptedTypes="*/*"
                  label="Drop files here or click to upload"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
        </FormSection>
      ))}
    </FormPageLayout>
  );
};

CustomerForm.propTypes = {
  onSave: PropTypes.func,
};

export default React.memo(CustomerForm);
