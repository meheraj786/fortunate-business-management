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
  Warehouse as WarehouseIcon,
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useUser, useUpdateUser } from "../../api/hooks/user";
import { useWarehouses } from "../../api/hooks/warehouse";

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
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { data: warehousesData } = useWarehouses();
  const { user } = useAuth();

  const { data: member, isLoading, isError } = useUser(id);
  const updateUserMutation = useUpdateUser();

  console.log(warehousesData, "warehousesData");

  const isSuperAdmin = user?.roleName === "SUPER_ADMIN";

  const normalizePermissions = (backendAccess) => {
    if (!Array.isArray(backendAccess)) return [];
    return backendAccess
      .map((item) => {
        let permissions = item.permissions || [];
        permissions = permissions.flat(Infinity);
        permissions = [...new Set(permissions)];
        permissions = permissions.filter((p) => PERMISSIONS.includes(p));
        return {
          module: item.module,
          permissions: permissions,
        };
      })
      .filter((item) => item.permissions.length > 0);
  };

  useEffect(() => {
    // Permission sync
    if (member?.data?.access) {
      const normalizedPermissions = normalizePermissions(member.data.access);
      setAccessPermissions(normalizedPermissions);
    } else {
      setAccessPermissions([]);
    }

    // Warehouse sync (Extracting IDs if populated)
    if (member?.data?.warehouse) {
      const whIds = member.data.warehouse.map((wh) =>
        typeof wh === "object" ? wh._id : wh
      );
      setSelectedWarehouses(whIds);
    } else {
      setSelectedWarehouses([]);
    }
  }, [member?.data]);

  // Existing Permission Logic
  const handlePermissionToggle = (moduleName, permission) => {
    setAccessPermissions((prev) => {
      const moduleIndex = prev.findIndex((m) => m.module === moduleName);
      if (moduleIndex === -1) {
        return [...prev, { module: moduleName, permissions: [permission] }];
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
        PERMISSIONS.every((perm) =>
          prev[moduleIndex].permissions.includes(perm)
        );

      if (allPermissionsSet) {
        return prev.filter((m) => m.module !== moduleName);
      } else {
        if (moduleIndex === -1) {
          return [
            ...prev,
            { module: moduleName, permissions: [...PERMISSIONS] },
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

  // --- New Warehouse Logic ---
  const handleWarehouseToggle = (warehouseId) => {
    if (!isEditing) return;
    setSelectedWarehouses((prev) =>
      prev.includes(warehouseId)
        ? prev.filter((id) => id !== warehouseId)
        : [...prev, warehouseId]
    );
  };

  const handleToggleAllWarehouses = () => {
    const allWhs = warehousesData?.data?.warehouses || [];

    if (selectedWarehouses.length === allWhs.length) {
      setSelectedWarehouses([]);
    } else {
      setSelectedWarehouses(allWhs.map((wh) => wh._id));
    }
  };
  // ----------------------------

  const hasPermission = (moduleName, permission) => {
    const module = accessPermissions.find((m) => m.module === moduleName);
    return module ? module.permissions.includes(permission) : false;
  };

  const hasAllPermissions = (moduleName) => {
    const module = accessPermissions.find((m) => m.module === moduleName);
    return module
      ? PERMISSIONS.every((perm) => module.permissions.includes(perm))
      : false;
  };

  const getModulePermissionCount = (moduleName) => {
    const module = accessPermissions.find((m) => m.module === moduleName);
    return module ? module.permissions.length : 0;
  };

  const handleSaveRoles = async () => {
    if (!member?.data) return;
    try {
      const cleanedPermissions = accessPermissions.map((module) => ({
        module: module.module,
        permissions: [...new Set(module.permissions)],
      }));

      await updateUserMutation.mutateAsync({
        id: id,
        data: {
          access: cleanedPermissions,
          warehouse: selectedWarehouses,
        },
      });

      toast.success("Permissions and Warehouse access updated!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  const handleCancelEdit = () => {
    // Reset permissions
    if (member?.data?.access) {
      setAccessPermissions(normalizePermissions(member.data.access));
    }
    // Reset warehouses
    if (member?.data?.warehouse) {
      setSelectedWarehouses(
        member.data.warehouse.map((wh) =>
          typeof wh === "object" ? wh._id : wh
        )
      );
    }
    setIsEditing(false);
    toast.success("Changes discarded");
  };

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${type} copied!`))
      .catch(() => toast.error("Failed to copy"));
  };

  if (isLoading) {
    return (
      <div className="  flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !member?.data) {
    return (
      <div className="  flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Member Not Found
          </h2>
          <button
            onClick={() => navigate("/team")}
            className="px-6 py-2 bg-primary text-white rounded-lg"
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

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Details</h1>
            <p className="text-gray-600 mt-1">
              Manage roles, permissions and warehouses
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {isSuperAdmin && isEditing ? (
              <>
                <button
                  onClick={handleSaveRoles}
                  disabled={updateUserMutation.isPending}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save size={18} className="mr-2" />
                  {updateUserMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </button>
              </>
            ) : isSuperAdmin ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                <Edit3 size={18} className="mr-2" />
                Edit Access
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-lg text-3xl font-bold text-white">
                  {member.data.avatar ? (
                    <img
                      src={member.data.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    member.data.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  {member.data.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {member.data.roleName}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div
                  onClick={() => copyToClipboard(member.data.email, "Email")}
                  className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <Mail size={18} className="text-gray-400 mr-3 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900 break-all">
                      {member.data.email}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => copyToClipboard(member.data.phone, "Phone")}
                  className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <Phone size={18} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{member.data.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Warehouse Access Section */}
            {/* Warehouse Access Section */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <WarehouseIcon className="text-primary" size={24} />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Warehouse Access
                    </h2>
                    <p className="text-sm text-gray-500">
                      Assign specific warehouses to this member
                    </p>
                  </div>
                </div>
                {isEditing && (
                  <button
                    onClick={handleToggleAllWarehouses}
                    className="text-xs font-medium px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                  >
                    {selectedWarehouses.length ===
                    (warehousesData?.data?.warehouses?.length || 0)
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {warehousesData?.data?.warehouses?.map((wh) => (
                  <label
                    key={wh._id}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                      isEditing ? "cursor-pointer" : "cursor-default"
                    } ${
                      selectedWarehouses.includes(wh._id)
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-100 bg-gray-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          selectedWarehouses.includes(wh._id)
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <WarehouseIcon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {wh.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {wh.location || "No Location Provided"}
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <input
                        type="checkbox"
                        checked={selectedWarehouses.includes(wh._id)}
                        onChange={() => handleWarehouseToggle(wh._id)}
                        className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                      />
                    )}
                  </label>
                ))}

                {warehousesData?.data?.warehouses?.length === 0 && (
                  <p className="col-span-full text-center py-4 text-gray-500 italic">
                    No warehouses found.
                  </p>
                )}
              </div>
            </div>

            {/* Access Permissions Section */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  Module Permissions
                </h2>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">
                    {totalPermissions}
                  </span>
                  <p className="text-xs text-gray-500">active</p>
                </div>
              </div>

              <div className="space-y-6">
                {MODULES.map((module) => {
                  const permissionCount = getModulePermissionCount(module.name);
                  const allChecked = hasAllPermissions(module.name);

                  return (
                    <div
                      key={module.name}
                      className={`border rounded-lg p-5 ${
                        permissionCount > 0
                          ? "border-green-200 bg-green-50/20"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-bold text-gray-800">
                          {module.label}
                        </h3>
                        {isEditing && (
                          <button
                            onClick={() =>
                              handleToggleAllPermissions(module.name)
                            }
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              allChecked
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {allChecked ? (
                              <XSquare size={14} />
                            ) : (
                              <CheckCheck size={14} />
                            )}
                            {allChecked ? "Clear" : "All"}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PERMISSIONS.map((permission) => {
                          const isChecked = hasPermission(
                            module.name,
                            permission
                          );
                          return (
                            <label
                              key={`${module.name}-${permission}`}
                              className={`flex items-center gap-2 p-2 border rounded-md transition-all ${
                                isEditing ? "cursor-pointer" : ""
                              } ${
                                isChecked
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  handlePermissionToggle(
                                    module.name,
                                    permission
                                  )
                                }
                                disabled={!isEditing}
                                className="w-4 h-4 text-green-600 cursor-pointer"
                              />
                              <span className="text-xs font-semibold uppercase">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
