import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Warehouse, MapPin, Loader2 } from "lucide-react";
import { useCreateWarehouse, useUpdateWarehouse } from "@/api/hooks/warehouse";
import { useForm } from "react-hook-form";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

const AddWarehouseForm = ({
  onClose,
  onWarehouseAdded,
  isOpen = false,
  editingWarehouse,
  onWarehouseUpdated,
}) => {
  const isEditMode = !!editingWarehouse;

  const createWarehouseMutation = useCreateWarehouse();
  const updateWarehouseMutation = useUpdateWarehouse();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      location: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingWarehouse) {
        reset({
          name: editingWarehouse.name,
          location: editingWarehouse.location || "",
        });
      } else {
        reset({ name: "", location: "" });
      }
    }
  }, [editingWarehouse, isOpen, isEditMode, reset]);

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      location: data.location,
    };

    const mutationOptions = {
      onSuccess: () => {
        if (isEditMode) {
          onWarehouseUpdated?.();
        } else {
          onWarehouseAdded?.();
        }
        onClose();
      },
    };

    if (isEditMode) {
      updateWarehouseMutation.mutate(
        { id: editingWarehouse._id, data: payload },
        mutationOptions,
      );
    } else {
      createWarehouseMutation.mutate(payload, mutationOptions);
    }
  };

  const isSubmitting = createWarehouseMutation.isLoading || updateWarehouseMutation.isLoading || formSubmitting;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[var(--color-primary)] text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Warehouse className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">
                      {isEditMode ? "Edit Warehouse" : "Add New Warehouse"}
                    </h2>
                    <p className="text-[var(--color-primary-light)] text-sm">
                      {isEditMode
                        ? "Update the details of the warehouse"
                        : "Enter details of the new warehouse"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  variant="subtle"
                  className="!p-2 hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
                  aria-label="Close"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <InputField
                  label="Warehouse Name"
                  name="name"
                  value={watch("name")}
                  onChange={(e) => setValue("name", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  error={errors.name?.message}
                  validation={{ required: "Warehouse name is required" }}
                  placeholder="e.g., Main Warehouse"
                  icon={Warehouse}
                  disabled={isSubmitting}
                />
                <InputField
                  label="Warehouse Location"
                  name="location"
                  value={watch("location")}
                  onChange={(e) => setValue("location", e.target.value, { shouldValidate: true, shouldDirty: true })}
                  error={errors.location?.message}
                  placeholder="e.g., 123 Industrial Park, Dhaka"
                  icon={MapPin}
                  disabled={isSubmitting}
                />
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    variant="secondary"
                  >
                    <X className="w-4 h-4 mr-2" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    variant="primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    <span>
                      {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Warehouse" : "Save Warehouse")}
                    </span>
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddWarehouseForm;
