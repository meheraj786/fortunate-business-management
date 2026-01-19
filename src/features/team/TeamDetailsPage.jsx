import React, { useEffect } from "react";
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
import { showSuccessToast, showErrorToast } from "@/utils/notifications";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/api/hooks/user";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import AuditInfoSection from "@/components/ui/AuditInfoSection";

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, hasPermission } = useAuth();

  const { data: member, isLoading, isError } = useUser(id);

  useEffect(() => {
    if (!hasPermission("USER_VIEW_ALL")) {
      showErrorToast("You don't have permission to view this page.");
      navigate("/team");
    }
  }, [user, hasPermission, navigate]);

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => showSuccessToast(`${type} copied!`))
      .catch(() => showErrorToast("Failed to copy"));
  };

  if ((isError || !member) && !isLoading) {
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
    { label: isLoading ? "Loading..." : member?.name || "Member" },
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
                <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden mb-4 bg-gray-200 text-3xl font-bold text-white">
                  {member?.avatar ? (
                    <img
                      src={member.avatar}
                      alt=""
                      className="w-[90%] h-[90%] object-cover"
                    />
                  ) : (
                    member?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  {isLoading ? (
                    <ValueSkeleton width="w-32" height="h-8" />
                  ) : (
                    member?.name
                  )}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {isLoading ? (
                    <ValueSkeleton width="w-24" height="h-4" />
                  ) : (
                    member?.roleName
                  )}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div
                  onClick={() =>
                    member?.email && copyToClipboard(member.email, "Email")
                  }
                  className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <Mail size={18} className="text-gray-400 mr-3 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900 break-all">
                      {isLoading ? (
                        <ValueSkeleton width="w-full" height="h-4" />
                      ) : (
                        member?.email
                      )}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() =>
                    member?.phone && copyToClipboard(member.phone, "Phone")
                  }
                  className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <Phone size={18} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">
                      {isLoading ? (
                        <ValueSkeleton width="w-24" height="h-4" />
                      ) : (
                        member?.phone
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Warehouse Access Section */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-gray-200 border-b">
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
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border rounded-lg border-gray-200 bg-gray-50/30"
                    >
                      <div className="flex items-center gap-3">
                        <ValueSkeleton width="w-10" height="h-10" />
                        <div>
                          <ValueSkeleton width="w-24" height="h-4" />
                          <div className="mt-1">
                            <ValueSkeleton width="w-32" height="h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {member?.warehouse?.map((wh) => (
                      <div
                        key={wh._id}
                        className="flex items-center justify-between p-4 border rounded-lg border-gray-200 bg-gray-50/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-200 text-gray-500">
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
                  </>
                )}
              </div>
            </div>

            {/* Access Permissions Section */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Module Permissions
                </h2>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">
                    {isLoading || !member ? (
                      <ValueSkeleton width="w-8" height="h-6" />
                    ) : (
                      member?.access?.reduce(
                        (sum, module) => sum + module.permissions.length,
                        0,
                      )
                    )}
                  </span>
                  <p className="text-xs text-gray-500">active</p>
                </div>
              </div>

              <div className="space-y-6">
                {!isLoading &&
                  member?.access?.map((module) => {
                    if (module.permissions.length === 0) return null;
                    return (
                      <div
                        key={module.module}
                        className="border rounded-lg p-5 border-gray-200 bg-green-50/20"
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
                              className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-green-50"
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
                {isLoading && (
                  <div className="space-y-4">
                    <ValueSkeleton width="w-full" height="h-24" />
                    <ValueSkeleton width="w-full" height="h-24" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <AuditInfoSection
          createdBy={member?.createdBy}
          createdAt={member?.createdAt}
          modifiedBy={member?.modifiedBy}
          updatedAt={member?.updatedAt}
          deletedBy={member?.deletedBy}
          deletedAt={member?.deletedAt}
          isDeleted={member?.isDeleted}
        />
      </div>
    </div>
  );
};

export default TeamDetails;
