import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router";
import { useUser, useUpdateUser } from "@/api/hooks/user";
import { useWarehouses } from "@/api/hooks/warehouse";
import { MODULES_ORDER } from "./constants";
import { usePermissions } from "@/api/hooks/permissions";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import FormPageLayout from "@/components/ui/FormPageLayout";
import MultiSelectField from "@/components/ui/MultiSelectField";
import FormSection from "@/components/ui/FormSection"; // New import
import { useSectionManager } from "@/hooks/useSectionManager"; // New import
import { showErrorToast } from "@/utils/notifications";
import {
  FileText,
  Warehouse as WarehouseIcon,
  ShieldCheck,
} from "lucide-react"; // New import

const SECTIONS_CONFIG = [
  {
    id: "basicInfo",
    title: "Basic Information",
    icon: FileText,
    defaultOpen: true,
  },
  {
    id: "warehouseAccess",
    title: "Warehouse Access",
    icon: WarehouseIcon,
    defaultOpen: true,
  },
  {
    id: "permissions",
    title: "Permissions",
    icon: ShieldCheck,
    defaultOpen: true,
  },
];

const EditTeamMemForm = () => {
  const { id } = useParams();
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: user, isLoading: isUserLoading } = useUser(id);
  const { data: warehousesData, isLoading: isWarehousesLoading } =
    useWarehouses();
  const { data: permissionsData, isLoading: isPermissionsLoading } =
    usePermissions();
  const updateUserMutation = useUpdateUser();

    const {
      register,
      handleSubmit,
      control,
      setValue,
      formState: { errors, isSubmitting },
    } = useForm();
  
    const { expandedSections, toggleSection, setSectionRef } =
      useSectionManager(SECTIONS_CONFIG);
  
    const ALL_PERMISSIONS_DYNAMIC = useMemo(() => {
      if (!permissionsData || !permissionsData.data) return {};
  
      const allPermissionStrings = Object.values(permissionsData.data.permissions); // Extract values from the object
  
      const transformed = {};
      // Permissions data from backend is { permissions: [], modules: [] }
      permissionsData.data.modules.forEach(moduleName => {
          transformed[moduleName] = allPermissionStrings.filter(p => p.startsWith(moduleName + '_'));
      });
      return transformed;
    }, [permissionsData]);
  
    useEffect(() => {
      if (user && permissionsData) {
        // Ensure permissionsData is loaded before setting user permissions
        setValue("name", user.name);
        setValue("email", user.email);
        setValue("roleName", user.roleName);
        setValue("description", user.description);
        setValue(
          "warehouse",
          user.warehouse.map((wh) => wh._id)
        ); // Map to _id for MultiSelectField
  
        const userPermissions = {};
        user.access.forEach((module) => {
          module.permissions.forEach((permission) => {
            userPermissions[permission] = true;
          });
        });
        setValue("permissions", userPermissions);
      }
    }, [user, permissionsData, setValue]);
  
    if (!isSuperAdmin) {
      navigate("/");
      return null;
    }
  
    const onSubmit = async (data) => {
      const access = Object.entries(ALL_PERMISSIONS_DYNAMIC)
        .map(([module, permissions]) => ({
          module,
          permissions: permissions.filter((p) => data.permissions[p]),
        }))
        .filter((m) => m.permissions.length > 0);
  
      const payload = {
        name: data.name,
        email: data.email,
        roleName: data.roleName,
        description: data.description,
        warehouse: data.warehouse,
        access,
      };
  
      try {
        await updateUserMutation.mutateAsync({ id, data: payload });
        navigate(`/team/${id}`);
      } catch (error) {
        handleError(error, "Failed to update user.");
      }
    };
  
      return (
        <FormPageLayout
          title="Edit Team Member"
          subtitle="Update user details and permissions."
          onSubmit={handleSubmit(onSubmit)}
          isLoading={isSubmitting || isUserLoading || isWarehousesLoading || isPermissionsLoading}
          isEditMode={true}
          submitButtonText="Member"
          cancelLink={`/team/${id}`}
        >
          {isUserLoading || isWarehousesLoading || isPermissionsLoading ? (
            <p>Loading...</p> // This can be a skeleton component
          ) : (
            <>
              <FormSection
                title="Basic Information"
                icon={FileText}
                isExpanded={expandedSections.basicInfo}
                onToggle={() => toggleSection("basicInfo")}
                sectionRef={(el) => setSectionRef("basicInfo", el)}
                defaultOpen
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Name"
                    name="name"
                    register={register}
                    validation={{ required: "Name is required" }}
                    error={errors.name?.message}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    register={register}
                    validation={{ required: "Email is required" }}
                    error={errors.email?.message}
                  />
                  <InputField
                    label="Role Name"
                    name="roleName"
                    register={register}
                    validation={{ required: "Role name is required" }}
                    error={errors.roleName?.message}
                  />
                  <InputField
                    label="Description"
                    name="description"
                    register={register}
                  />
                </div>
              </FormSection>
    
              <FormSection
                title="Warehouse Access"
                icon={WarehouseIcon}
                isExpanded={expandedSections.warehouseAccess}
                onToggle={() => toggleSection("warehouseAccess")}
                sectionRef={(el) => setSectionRef("warehouseAccess", el)}
                defaultOpen
              >
                <Controller
                  name="warehouse"
                  control={control}
                  render={({ field }) => (
                    <MultiSelectField
                      label="Warehouses"
                      name="warehouse"
                      options={Array.isArray(warehousesData?.data?.warehouses) ? warehousesData.data.warehouses.map(wh => ({ value: wh._id, label: wh.name })) : []}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormSection>
    
              <FormSection
                title="Permissions"
                icon={ShieldCheck}
                isExpanded={expandedSections.permissions}
                onToggle={() => toggleSection("permissions")}
                sectionRef={(el) => setSectionRef("permissions", el)}
                defaultOpen
              >
                <div>
                  {MODULES_ORDER.map((moduleName) => {
                    const permissions = ALL_PERMISSIONS_DYNAMIC[moduleName];
                    if (!permissions || permissions.length === 0) return null;
                    return (
                      <div key={moduleName} className="mt-2">
                        <h4 className="font-semibold">{moduleName}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                          {permissions.map((permission) => (
                            <label
                              key={permission}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                {...register(`permissions.${permission}`)}
                              />
                              <span>
                                {permission
                                  .split("_")
                                  .slice(1)
                                  .join(" ")
                                  .toLowerCase()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FormSection>
            </>
          )}
        </FormPageLayout>
      );  };
export default EditTeamMemForm;
