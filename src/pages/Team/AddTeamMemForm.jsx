import React,{ useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiUser,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiImage,
  FiChevronDown,
  FiLock,
} from "react-icons/fi";
import Dropdown from "../../components/layout/Dropdown";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
import toast from "react-hot-toast";

const AddTeamMemForm = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    location: "",
    avatar: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const roles = [
    "Manager",
    "Warehouse Keeper",
    "Accountant",
    "Sales Executive",
    "Operations Coordinator",
    "Logistics Officer",
    "Quality Inspector",
    "Customs Officer",
  ];

  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const { baseUrl } = useContext(UrlContext);

  // ✅ When editing, pre-fill data
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        email: editData.email || "",
        phone: editData.phone || "",
        role: editData.role || "",
        location: editData.location || "",
        avatar: editData.avatar || "",
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        location: "",
        avatar: "",
        password: "",
      });
    }
    setErrors({});
  }, [editData]);

  // ✅ Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFocus = (ref) => {
    if (window.innerWidth < 768) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      avatar: formData.avatar || `https://i.pravatar.cc/150?u=${formData.name}`,
    };

    try {
      await axios.post(`${baseUrl}auth/create-user`, payload);
      toast.success("User Created Successfully!");
      onSubmit(payload);
      handleClose();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  // ✅ Close & Reset Form
  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      location: "",
      avatar: "",
      password: "",
    });
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  // ✅ UI
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
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Avatar */}
                <InputField
                  icon={<FiImage className="mr-2 text-gray-400" />}
                  label="Avatar URL"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="Enter image URL or leave blank for default"
                />

                {/* Name */}
                <InputField
                  ref={nameInputRef}
                  icon={<FiUser className="mr-2 text-gray-400" />}
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus(nameInputRef)}
                  error={errors.name}
                  placeholder="Enter full name"
                />

                {/* Email */}
                <InputField
                  icon={<FiUser className="mr-2 text-gray-400" />}
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="Enter email address"
                />

                {/* Phone */}
                <InputField
                  ref={phoneInputRef}
                  icon={<FiPhone className="mr-2 text-gray-400" />}
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => handleFocus(phoneInputRef)}
                  error={errors.phone}
                  placeholder="+880 XXXX-XXXXXX"
                />

                {/* Role Dropdown */}
                <Dropdown
                  options={roles}
                  selected={formData.role}
                  onSelect={(role) =>
                    handleChange({ target: { name: "role", value: role } })
                  }
                  placeholder="Select role"
                  label="Role"
                  icon={FiBriefcase}
                  error={errors.role}
                />

                {/* Location */}
                <InputField
                  ref={locationInputRef}
                  icon={<FiMapPin className="mr-2 text-gray-400" />}
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onFocus={() => handleFocus(locationInputRef)}
                  error={errors.location}
                  placeholder="Enter location"
                />

                {/* Password */}
                <InputField
                  icon={<FiLock className="mr-2 text-gray-400" />}
                  label="Password"
                  name="password"
                  type="text"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter strong password"
                />

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 text-white bg-[#003b75d8] rounded-lg hover:bg-[#00366d] transition-all font-medium"
                  >
                    {editData ? "Update" : "Add"} Member
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ✅ Reusable input component
const InputField = React.forwardRef(
  (
    {
      icon,
      label,
      name,
      type = "text",
      value,
      onChange,
      placeholder,
      error,
      onFocus,
    },
    ref
  ) => (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="flex items-center text-sm font-medium text-gray-700"
      >
        {icon}
        {label}
      </label>
      <input
        ref={ref}
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:ring-red-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
        }`}
        placeholder={placeholder}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
);

export default AddTeamMemForm;
