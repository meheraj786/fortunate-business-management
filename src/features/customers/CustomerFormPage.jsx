import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

// Components
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import FileInput from "@/components/ui/FileInput";
import FormPageLayout from "@/components/ui/FormPageLayout";

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
} from "lucide-react";

// Custom Hooks
import { useSectionManager } from "@/hooks/useSectionManager";
import { useCreateCustomer, useCustomer, useDeleteCustomer, useUpdateCustomer } from "../../api/hooks/customer";

const CustomerForm = ({ onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

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
    defaultValues: {
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
    },
  });

  // State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const updateCustomerMutation=useUpdateCustomer()
  const createCustomerMutation=useCreateCustomer()

  // Sections
  const SECTIONS = [
    { id: "basic", title: "Basic Information", icon: User },
    { id: "contact", title: "Contact Information", icon: Phone },
    { id: "others", title: "Others", icon: FileText },
  ];

  const { expandedSections, toggleSection, setSectionRef } =
    useSectionManager(SECTIONS);

  // Data
  const customerTypes = [
    { value: "Retail", label: "Retail" },
    { value: "Wholesale", label: "Wholesale" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Suspended", label: "Suspended" },
  ];

  const {data:customer}=useCustomer(id);
  // Effects
  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);
  
  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {

      // Set form values
      Object.keys(customer).forEach((key) => {
        if (key in watch()) {
          if (key === "joinDate") {
            setValue(key, new Date(customer[key]).toISOString().split("T")[0]);
          } else {
            setValue(key, customer[key]);
          }
        }
      });

      if (customer.documents) {
        setUploadedFiles(customer.documents);
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      toast.error("Failed to load customer data");
    } finally {
      setIsLoading(false);
    }
  };

  // Event Handlers
  const handleFileChange = useCallback((files) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  }, []);

  const handleFileRemove = useCallback((index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        creditLimit: parseFloat(data.creditLimit) || 0,
        documents: uploadedFiles.map((file) => ({
          name: file.name || file.file?.name,
          type: file.type || file.file?.type,
          size: file.size,
          uploadDate: file.uploadDate || new Date().toISOString().split("T")[0],
        })),
      };

      if (isEditMode) {
        await updateCustomerMutation.mutateAsync({id:id,...payload})
        toast.success("Customer updated successfully");
      } else {
        await createCustomerMutation.mutateAsync(payload)
        toast.success("Customer created successfully");
      }

      if (onSave) onSave(payload);
      navigate("/customers");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(`Failed to ${isEditMode ? "update" : "create"} customer`);
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
      isLoading={isSubmitting || isLoading}
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
                    value: /^[+]?[0-9\s\-\(\)]+$/,
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
                  required: "Email is required",
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
            <div className="space-y-4 sm:space-y-6">
              <TextAreaField
                label="Notes"
                name="customerNote"
                register={register}
                placeholder="Add any relevant notes here..."
                rows={4}
                autoResize
                error={errors.customerNote?.message}
              />

              <FileInput
                files={uploadedFiles}
                onFileChange={handleFileChange}
                onFileRemove={handleFileRemove}
                label="Upload Documents"
                maxSize={10}
                acceptedTypes="*/*"
                error={errors.documents?.message}
              />
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
