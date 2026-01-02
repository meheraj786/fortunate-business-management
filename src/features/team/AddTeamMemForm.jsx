import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiX,
  FiUser,
  FiMail, // Added FiMail for consistency
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiImage,
  FiLock,
} from "react-icons/fi";
import Dropdown from "@/components/ui/Dropdown";
import toast from "react-hot-toast";
import api from "@/services/apiService";
import { useAuth } from "../../context/AuthContext";
import InputField from "@/components/ui/InputField";
import { useCreateUser, useUpdateUser } from "../../api/hooks/user"; // Import useUpdateUser as well
import { useForm } from "react-hook-form"; // Import useForm
import Button from "@/components/ui/Button"; // Import Button component
import { handleError } from "@/utils/handle-error";

const AddTeamMemForm = ({ isOpen, onClose, editData = null, onUserAdded, onUserUpdated }) => {
  const isEditMode = !!editData;
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roleName: "",
      location: "",
      avatar: "",
      password: "",
    },
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser(); // useUpdateUser hook

  const roles = [
      "MANAGER",
      "Warehouse Keeper",
      "Accountant",
      "Sales Executive",
      "Operations Coordinator",
      "Logistics Officer",
      "Quality Inspector",
      "Customs Officer",
      "No Role",
  ];

  // When editing, pre-fill data
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editData) {
        reset({
          name: editData.name || "",
          email: editData.email || "",
          phone: editData.phone || "",
          roleName: editData.roleName || "",
          location: editData.location || "",
          avatar: editData.avatar || "",
          password: "", // Password should not be pre-filled
        });
      } else {
        reset({
          name: "", email: "", phone: "", roleName: "", location: "", avatar: "", password: "",
        });
      }
    }
  }, [editData, isOpen, isEditMode, reset]);
  
  const onSubmit = (data) => {
    const payload = {
      ...data,
      avatar:
        data.avatar || `https://i.pravatar.cc/150?u=${data.name}`,
    };

    if (isEditMode) {
      // Don't send password if it's empty
      if (!payload.password) {
        delete payload.password;
      }
      updateUserMutation.mutate({ id: editData._id, data: payload }, {
        onSuccess: () => {
          toast.success("User Updated Successfully!");
          onUserUpdated?.();
          handleClose();
        },
        onError: (error) => {
          handleError(error, "User update failed");
        },
      });
    } else {
      createUserMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("User Created Successfully!");
          onUserAdded?.();
          handleClose();
        },
        onError: (error) => {
          handleError(error, "User create failed");
        },
      });
    }
  };


  // Close & Reset Form
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };
    const { user } = useAuth();

if (!user || user.roleName !== "SUPER_ADMIN") {
  return null;
}

  const mutationIsLoading = createUserMutation.isLoading || updateUserMutation.isLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                {editData ? "Edit Team Member" : "Add New Team Member"}
              </h2>
              <Button
                onClick={handleClose}
                variant="subtle"
                size="sm"
                className="!p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                aria-label="Close"
              >
                <FiX size={20} />
              </Button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                {/* Avatar */}
                <InputField
                  icon={FiImage}
                  label="Avatar URL"
                  name="avatar"
                  register={register}
                  error={errors.avatar?.message}
                  placeholder="Enter image URL or leave blank for default"
                  disabled={isSubmitting || mutationIsLoading}
                />

                {/* Name */}
                <InputField
                  icon={FiUser}
                  label="Full Name"
                  name="name"
                  register={register}
                  error={errors.name?.message}
                  validation={{ required: "Name is required" }}
                  placeholder="Enter full name"
                  disabled={isSubmitting || mutationIsLoading}
                />

                {/* Email */}
                <InputField
                  icon={FiMail} // Changed to FiMail
                  label="Email"
                  name="email"
                  type="email"
                  register={register}
                  error={errors.email?.message}
                  validation={{ required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } }}
                  placeholder="Enter email address"
                  disabled={isSubmitting || mutationIsLoading}
                />

                {/* Phone */}
                <InputField
                  icon={FiPhone}
                  label="Phone"
                  name="phone"
                  type="tel"
                  register={register}
                  error={errors.phone?.message}
                  validation={{ required: "Phone number is required" }}
                  placeholder="+880 XXXX-XXXXXX"
                  disabled={isSubmitting || mutationIsLoading}
                />

                {/* Role Dropdown */}
                <Dropdown
                  options={roles}
                  selected={watch("roleName")}
                  onSelect={(roleName) =>
                    setValue("roleName", roleName, { shouldValidate: true })
                  }
                  placeholder="Select roleName"
                  label="Role"
                  icon={FiBriefcase}
                  error={errors.roleName?.message}
                />

                {/* Location */}
                <InputField
                  icon={FiMapPin}
                  label="Location"
                  name="location"
                  register={register}
                  error={errors.location?.message}
                  validation={{ required: "Location is required" }}
                  placeholder="Enter location"
                  disabled={isSubmitting || mutationIsLoading}
                />

                {/* Password */}
                <InputField
                  icon={FiLock}
                  label="Password"
                  name="password"
                  type="password"
                  register={register}
                  error={errors.password?.message}
                  validation={{ required: !isEditMode ? "Password is required" : false }}
                  placeholder={isEditMode ? "Leave blank to keep unchanged" : "Enter strong password"}
                  disabled={isSubmitting || mutationIsLoading}
                />

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleClose}
                    variant="secondary"
                    className="flex-1"
                    disabled={isSubmitting || mutationIsLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isLoading={isSubmitting || mutationIsLoading}
                    disabled={isSubmitting || mutationIsLoading}
                  >
                    {isEditMode ? "Update" : "Add"} Member
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

export default AddTeamMemForm;
