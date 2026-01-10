import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
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

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: warehousesData } = useWarehouses();
    const { user, hasPermission } = useAuth();
  
    const { data: member, isLoading, isError } = useUser(id);
  
    useEffect(() => {
      if (!hasPermission("USER_VIEW_ALL")) {
        toast.error("You don't have permission to view this page.");
        navigate("/team");
      }
    }, [user, hasPermission, navigate]);
  
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

  if (isError || !member) {
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
    { label: member.name },
  ];

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
            {hasPermission("USER_UPDATE") ? (
              <Link
                to={`/team/edit/${id}`}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                <Edit3 size={18} className="mr-2" />
                Edit Access
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden mb-4 shadow-lg text-3xl font-bold text-white">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    member.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  {member.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {member.roleName}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div
                  onClick={() => copyToClipboard(member.email, "Email")}
                  className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <Mail size={18} className="text-gray-400 mr-3 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900 break-all">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => copyToClipboard(member.phone, "Phone")}
                  className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <Phone size={18} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{member.phone}</p>
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
                      Assigned warehouses for this member
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {member?.warehouse?.map((wh) => (
                  <div
                    key={wh._id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg bg-gray-200 text-gray-500"
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
                  </div>
                ))}

                {(!member?.warehouse || member.warehouse.length === 0) && (
                  <p className="col-span-full text-center py-4 text-gray-500 italic">
                    No warehouses assigned.
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
                    {member.access.reduce(
                      (sum, module) => sum + module.permissions.length,
                      0
                    )}
                  </span>
                  <p className="text-xs text-gray-500">active</p>
                </div>
              </div>

              <div className="space-y-6">
                {member.access.map((module) => {
                  if (module.permissions.length === 0) return null;
                  return (
                    <div
                      key={module.module}
                      className="border rounded-lg p-5 border-green-200 bg-green-50/20"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-md font-bold text-gray-800">
                          {module.module}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {module.permissions.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center gap-2 p-2 border rounded-md bg-green-50"
                          >
                            <CheckCheck className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-semibold uppercase">
                              {permission.split("_").slice(1).join(" ")}
                            </span>
                          </div>
                        ))}
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
