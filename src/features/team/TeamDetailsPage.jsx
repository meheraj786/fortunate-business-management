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
import Breadcrumb from "@/components/ui/Breadcrumb";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useUser, useUpdateUser } from "../../api/hooks/user";

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
  const [accessPermissions, setAccessPermissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  
  const { data: member, isLoading, isError } = useUser(id);
  const updateUserMutation = useUpdateUser();

  console.log(member,"member");
  

  const isSuperAdmin = user?.roleName === "SUPER_ADMIN";

  const normalizePermissions = (backendAccess) => {
    if (!Array.isArray(backendAccess)) return [];
    
    return backendAccess.map((item) => {
      let permissions = item.permissions || [];
      
      permissions = permissions.flat(Infinity);
      
      permissions = [...new Set(permissions)];
      
      permissions = permissions.filter(p => PERMISSIONS.includes(p));
      
      return {
        module: item.module,
        permissions: permissions
      };
    }).filter(item => item.permissions.length > 0); 
  };

  useEffect(() => {
    if (member?.data?.access) {
      const normalizedPermissions = normalizePermissions(member.data.access);
      setAccessPermissions(normalizedPermissions);
    } else {
      setAccessPermissions([]);
    }
  }, [member?.data]);

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
        const module = { ...updatedAccess[moduleIndex] };
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

        updatedAccess[moduleIndex] = module;
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
            module: moduleName,
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
    if (!member?.data) return;

    try {
      const cleanedPermissions = accessPermissions.map(module => ({
        module: module.module,
        permissions: [...new Set(module.permissions)] // Remove any duplicates
      }));

      await updateUserMutation.mutateAsync({
        id: id,
        data: { access: cleanedPermissions }
      });
      
      toast.success("Permissions updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update permissions"
      );
    }
  };

  const handleCancelEdit = () => {
    if (member?.data?.access) {
      const normalizedPermissions = normalizePermissions(member.data.access);
      setAccessPermissions(normalizedPermissions);
    } else {
      setAccessPermissions([]);
    }
    setIsEditing(false);
    toast.success("Changes discarded");
  };

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${type} copied!`))
      .catch(() => toast.error("Failed to copy"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !member?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Member Not Found</h2>
          <button 
            onClick={() => navigate("/team")} 
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Back to Team
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Team", path: "/team" },
    { label: member.data.name },
  ];

  const totalPermissions = accessPermissions.reduce(
    (sum, module) => sum + module.permissions.length,
    0
  );

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Details</h1>
            <p className="text-gray-600 mt-1">Manage roles and permissions</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {isSuperAdmin && isEditing ? (
              <>
                <button
                  onClick={handleSaveRoles}
                  disabled={updateUserMutation.isPending}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={18} className="mr-2" />
                  {updateUserMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={updateUserMutation.isPending}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </button>
              </>
            ) : isSuperAdmin ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Edit3 size={18} className="mr-2" />
                Edit Permissions
              </button>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-lg">
                  {member.data.avatar ? (
                    <img 
                      src={member.data.avatar} 
                      alt={member.data.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-3xl font-bold text-white">
                      {member.data.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  {member.data.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">{member.data.roleName}</p>
                <span className={`mt-3 px-4 py-1 rounded-full text-xs font-semibold ${
                  member.data.status === "Active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {member.data.status || "Active"}
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div 
                  onClick={() => copyToClipboard(member.data.email, "Email")} 
                  className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                >
                  <Mail size={18} className="text-gray-400 group-hover:text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="text-sm text-gray-900 break-all group-hover:text-primary">
                      {member.data.email}
                    </p>
                  </div>
                </div>
                
                <div 
                  onClick={() => copyToClipboard(member.data.phone, "Phone")} 
                  className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                >
                  <Phone size={18} className="text-gray-400 group-hover:text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="text-sm text-gray-900 group-hover:text-primary">
                      {member.data.phone}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start p-3">
                  <MapPin size={18} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Location</p>
                    <p className="text-sm text-gray-900">{member.data.location}</p>
                  </div>
                </div>
              </div>

              {/* Permission Summary */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Permissions</span>
                  <span className="text-lg font-bold text-primary">{totalPermissions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Access Permissions</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isEditing ? "Click checkboxes to modify permissions" : "View assigned permissions"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{totalPermissions}</span>
                  <p className="text-xs text-gray-500">granted</p>
                </div>
              </div>

              <div className="space-y-6">
                {MODULES.map((module) => {
                  const permissionCount = getModulePermissionCount(module.name);
                  const allChecked = hasAllPermissions(module.name);

                  return (
                    <div 
                      key={module.name} 
                      className={`border rounded-lg p-5 transition-all ${
                        permissionCount > 0 
                          ? "border-green-200 bg-green-50/30" 
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {module.label}
                          </h3>
                          {permissionCount > 0 && (
                            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {permissionCount} active
                            </span>
                          )}
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => handleToggleAllPermissions(module.name)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              allChecked 
                                ? "bg-red-100 text-red-700 hover:bg-red-200" 
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            {allChecked ? (
                              <>
                                <XSquare size={14} /> Clear All
                              </>
                            ) : (
                              <>
                                <CheckCheck size={14} /> Select All
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PERMISSIONS.map((permission) => {
                          const isChecked = hasPermission(module.name, permission);
                          return (
                            <label
                              key={`${module.name}-${permission}`}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                                isEditing 
                                  ? "cursor-pointer hover:shadow-md" 
                                  : "cursor-default"
                              } ${
                                isChecked 
                                  ? "border-green-400 bg-green-50 shadow-sm" 
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handlePermissionToggle(module.name, permission)}
                                disabled={!isEditing}
                                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                              />
                              <span className={`text-sm font-medium ${
                                isChecked ? "text-green-700" : "text-gray-700"
                              }`}>
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

              {!isSuperAdmin && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Only Super Admins can modify permissions.
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