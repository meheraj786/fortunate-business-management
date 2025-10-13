import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUser, FiPhone, FiMapPin, FiBriefcase, FiImage, FiChevronDown } from "react-icons/fi";
import Dropdown from "../../components/layout/Dropdown";

const AddTeamMemForm = ({ isOpen, onClose, onSubmit, editData = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "",
    location: "",
    status: "Active",
    avatar: "",
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

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        phone: editData.phone || "",
        role: editData.role || "",
        location: editData.location || "",
        status: editData.status || "Active",
        avatar: editData.avatar || "",
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        role: "",
        location: "",
        status: "Active",
        avatar: "",
      });
    }
    setErrors({});
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFocus = (ref) => {
    if (window.innerWidth < 768) {
      // Only on mobile
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+880 \d{4}-\d{6}$/.test(formData.phone)) {
      newErrors.phone =
        "Please enter a valid phone number format: +880 XXXX-XXXXXX";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const submitData = {
        ...formData,
        id: editData ? editData.id : Date.now(),
        avatar: formData.avatar || `https://i.pravatar.cc/150?u=${formData.name}`,
      };

      onSubmit(submitData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      phone: "",
      role: "",
      location: "",
      status: "Active",
      avatar: "",
    });
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

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
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-800">
                {editData ? "Edit Team Member" : "Add New Team Member"}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                aria-label="Close form"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Avatar Field */}
                <div className="space-y-2">
                    <label
                        htmlFor="avatar"
                        className="flex items-center text-sm font-medium text-gray-700"
                    >
                        <FiImage className="mr-2 text-gray-400" />
                        Avatar URL
                    </label>
                    <input
                        type="text"
                        id="avatar"
                        name="avatar"
                        value={formData.avatar}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200`}
                        placeholder="Enter image URL or leave for default"
                    />
                </div>
                {/* Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="flex items-center text-sm font-medium text-gray-700"
                  >
                    <FiUser className="mr-2 text-gray-400" />
                    Full Name
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus(nameInputRef)}
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="flex items-center text-sm font-medium text-gray-700"
                  >
                    <FiPhone className="mr-2 text-gray-400" />
                    Phone Number
                  </label>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus(phoneInputRef)}
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${errors.phone ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}`}
                    placeholder="+880 XXXX-XXXXXX"
                  />
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600"
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Role Dropdown */}
                <div className="space-y-2">
                  <Dropdown
                    options={roles}
                    selected={formData.role}
                    onSelect={(role) => handleChange({ target: { name: "role", value: role } })}
                    placeholder="Select a role"
                    label="Role"
                    icon={FiBriefcase}
                    error={errors.role}
                  />
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="location"
                    className="flex items-center text-sm font-medium text-gray-700"
                  >
                    <FiMapPin className="mr-2 text-gray-400" />
                    Location
                  </label>
                  <input
                    ref={locationInputRef}
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onFocus={() => handleFocus(locationInputRef)}
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${errors.location ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}`}
                    placeholder="Enter location (e.g., Dhaka, Bangladesh)"
                  />
                  {errors.location && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600"
                    >
                      {errors.location}
                    </motion.p>
                  )}
                </div>
                {/* Status Dropdown */}
                <div className="space-y-2">
                    <label
                        htmlFor="status"
                        className="flex items-center text-sm font-medium text-gray-700"
                    >
                        <FiChevronDown className="mr-2 text-gray-400" />
                        Status
                    </label>
                    <Dropdown
                        options={["Active", "Suspended"]}
                        selected={formData.status}
                        onSelect={(status) => handleChange({ target: { name: "status", value: status } })}
                        placeholder="Select a status"
                        label="Status"
                        icon={FiBriefcase}
                        error={errors.status}
                    />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium hover:shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 text-white bg-[#003b75d8] rounded-lg hover:bg-[#00366d] transition-all duration-200 font-medium shadow-sm hover:shadow-md"
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

export default AddTeamMemForm;

