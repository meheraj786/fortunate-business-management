import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  CheckCheck,
  XSquare,
} from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// Module and permission definitions
const MODULES = [
  { name: "LC", label: "LC Management" },
  { name: "SALE", label: "Sales" },
  { name: "CASH", label: "Cash Management" },
  { name: "STOCK", label: "Stock Management" },
  { name: "BANKING", label: "Banking" },
  { name: "CUSTOMER", label: "Customer Management" },
];

const PERMISSIONS = ["CREATE", "GET", "UPDATE", "DELETE"];

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const isSuperAdmin = user?.roleName === "SUPER_ADMIN";

  useEffect(() => {
    api
      .get(`/auth/get-user/${id}`)
      .then((res) => {
        setMember(res.data.data);
        setAccessPermissions(res.data.data.access || []);
      })
      .catch((err) => {
        toast.error("Failed to load user data");
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handlePermissionToggle = (moduleName, permission) => {
    setAccessPermissions((prev) => {
      const moduleIndex = prev.findIndex((m) => m.module === moduleName);

      if (moduleIndex === -1) {
        return [
          ...prev,
          {
            module: moduleName,
            permissions: [permission],
          },
        ];
      } else {
        const updatedAccess = [...prev];
        const module = updatedAccess[moduleIndex];
        const permissionIndex = module.permissions.indexOf(permission);

        if (permissionIndex === -1) {
          module.permissions = [...module.permissions, permission];
        } else {
          module.permissions = module.permissions.filter(
            (p) => p !== permission
          );
        }

        if (module.permissions.length === 0) {
          return updatedAccess.filter((m) => m.module !== moduleName);
        }

        return updatedAccess;
      }
    });
  };

  const handleToggleAllPermissions = (moduleName) => {
    setAccessPermissions((prev) => {
      const moduleIndex = prev.findIndex((m) => m.module === moduleName);
      
      const allPermissionsSet =
        moduleIndex !== -1 &&
        PERMISSIONS.every(perm => prev[moduleIndex].permissions.includes(perm));

      if (allPermissionsSet) {
        return prev.filter((m) => m.module !== moduleName);
      } else {
        if (moduleIndex === -1) {
          return [
            ...prev,
            {
              module: moduleName,
              permissions: [...PERMISSIONS],
            },
          ];
        } else {
          const updatedAccess = [...prev];
          updatedAccess[moduleIndex] = {
            ...updatedAccess[moduleIndex],
            permissions: [...PERMISSIONS],
          };
          return updatedAccess;
        }
      }
    });
  };

  const hasPermission = (moduleName, permission) => {
    const module = accessPermissions.find((m) => m.module === moduleName);
    return module ? module.permissions.includes(permission) : false;
  };

  const hasAllPermissions = (moduleName) => {
    const module = accessPermissions.find((m) => m.module === moduleName);
    return module 
      ? PERMISSIONS.every(perm => module.permissions.includes(perm))
      : false;
  };

  const getModulePermissionCount = (moduleName) => {
    const module = accessPermissions.find((m) => m.module === moduleName);
    return module ? module.permissions.length : 0;
  };

  const handleSaveRoles = async () => {
    if (!member) return;

    console.log("Saving permissions:", JSON.stringify(accessPermissions, null, 2));

    setIsSaving(true);
    toast.promise(
      api.patch(`/auth/update-user/${id}`, {
        access: accessPermissions,
      }),
      {
        loading: "Saving permissions...",
        success: (response) => {
          setMember(response.data.data);
          setIsEditing(false);
          return <b>Permissions updated successfully!</b>;
        },
        error: (err) => {
          console.error(err);
          return (
            <b>
              {err.response?.data?.message || "Failed to update permissions"}
            </b>
          );
        },
      }
    ).finally(() => {
      setIsSaving(false);
    });
  };

  const handleCancelEdit = () => {
    setAccessPermissions(member?.access || []);
    setIsEditing(false);
    toast.success("Changes discarded");
  };

  const handleEditStart = () => {
    setIsEditing(true);
    toast("You are now in edit mode. Check boxes to grant permissions.", {
      icon: "✏️",
      duration: 4000,
    });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${type} copied to clipboard!`);
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Member Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The team member you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/team")}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Team
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Team", path: "/team" },
    { label: member?.name },
  ];

  const totalPermissions = accessPermissions.reduce(
    (sum, module) => sum + module.permissions.length,
    0
  );
  const maxPermissions = MODULES.length * PERMISSIONS.length;

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Details</h1>
            <p className="text-gray-600 mt-1">
              Manage roles and permissions for team members.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {isSuperAdmin && isEditing ? (
              <>
                <button
                  onClick={handleSaveRoles}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Save size={18} className="mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </button>
              </>
            ) : isSuperAdmin ? (
              <button
                onClick={handleEditStart}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Edit3 size={18} className="mr-2" />
                Edit Permissions
              </button>
            ) : null}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      src={member?.avatar}
                      alt={member?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {member?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  </div>
                  {member?.status === "Active" && (
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  {member?.name}
                </h2>
                <p className="text-gray-600">{member?.roleName}</p>
                <span
                  className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    member?.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {member?.status || "Active"}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div
                    className="flex items-center text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => copyToClipboard(member?.email, "Email")}
                  >
                    <Mail size={18} className="text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-500">Email</p>
                      <p className="text-primary break-all">{member?.email}</p>
                    </div>
                  </div>
                  <div
                    className="flex items-center text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() =>
                      copyToClipboard(member?.phone, "Phone number")
                    }
                  >
                    <Phone size={18} className="text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-500">Phone</p>
                      <p className="text-primary">{member?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin size={18} className="text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-500">
                        Location
                      </p>
                      <p>{member?.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Roles & Permissions Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Module Permissions
                </h2>
                <div className="text-right">
                  <span className="text-sm text-gray-500 block">
                    {totalPermissions} of {maxPermissions} permissions granted
                  </span>
                  {isEditing && (
                    <span className="text-xs text-orange-600 block mt-1">
                      Editing mode active
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {MODULES.map((module) => {
                  const permissionCount = getModulePermissionCount(module.name);
                  const allChecked = hasAllPermissions(module.name);

                  return (
                    <div
                      key={module.name}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {module.label}
                        </h3>
                        {isEditing && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {permissionCount}/{PERMISSIONS.length}
                            </span>
                            <button
                              onClick={() =>
                                handleToggleAllPermissions(module.name)
                              }
                              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                allChecked
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              {allChecked ? (
                                <>
                                  <XSquare size={14} />
                                  Clear All
                                </>
                              ) : (
                                <>
                                  <CheckCheck size={14} />
                                  Select All
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PERMISSIONS.map((permission) => {
                          const isChecked = hasPermission(module.name, permission);
                          return (
                            <label
                              key={`${module.name}-${permission}`}
                              className={`flex items-center gap-2 p-3 border rounded-lg transition-all ${
                                isEditing
                                  ? "cursor-pointer hover:bg-blue-50 hover:border-blue-200"
                                  : "cursor-not-allowed opacity-60"
                              } ${
                                isChecked
                                  ? "border-green-300 bg-green-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  handlePermissionToggle(module.name, permission)
                                }
                                disabled={!isEditing}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                              />
                              <span className="text-sm font-medium text-gray-700 select-none">
                                {permission}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isEditing && totalPermissions === 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-center">
                    No permissions granted yet. Click "Edit Permissions" to add
                    module access.
                  </p>
                </div>
              )}

              {isEditing && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-center text-sm">
                    💡 Check boxes to grant permissions. Use "Select All" / "Clear All" for quick setup.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;