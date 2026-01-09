import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";
import { useCreateUser } from "@/api/hooks/user";
import { useWarehouses } from "@/api/hooks/warehouse";
import { usePermissions } from "@/api/hooks/permissions";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import FormPageLayout from "@/components/ui/FormPageLayout";
import MultiSelectField from "@/components/ui/MultiSelectField";
import FormSection from "@/components/ui/FormSection";
import { useSectionManager } from "@/hooks/useSectionManager";
import { handleError } from "@/utils/handle-error";
import {
  FileText,
  Warehouse as WarehouseIcon,
  ShieldCheck,
} from "lucide-react";

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

const MODULES_ORDER = [
  "USER",
  "WAREHOUSE",
  "PRODUCT",
  "LC",
  "SALE",
  "CASH",
  "ACCOUNT",
  "TRANSACTION",
  "CUSTOMER",
  "CATEGORY",
  "UNIT",
  "TRASH",
];

const AddTeamMemForm = () => {
  const { hasPermission, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();
  const createUserMutation = useCreateUser();
  const { data: warehousesData, isLoading: isWarehousesLoading } =
    useWarehouses();
  const { data: permissionsData, isLoading: isPermissionsLoading } =
    usePermissions();
  const { expandedSections, toggleSection, setSectionRef } =
    useSectionManager(SECTIONS_CONFIG);

  const ALL_PERMISSIONS_DYNAMIC = useMemo(() => {
    if (!permissionsData || !permissionsData.data) return {};

    const allPermissionStrings = Object.values(permissionsData.data.permissions);

    const transformed = {};
    permissionsData.data.modules.forEach(moduleName => {
        transformed[moduleName] = allPermissionStrings.filter(p => p.startsWith(moduleName + '_'));
    });
    return transformed;
  }, [permissionsData]);

  if (!hasPermission("USER_CREATE")) {
    navigate("/");
    return null;
  }

  const onSubmit = async (data) => {
    let payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      roleName: data.roleName,
      description: data.description,
    };

    if (isSuperAdmin) {
      const access = Object.entries(ALL_PERMISSIONS_DYNAMIC)
        .map(([module, permissions]) => ({
          module,
          permissions: permissions.filter((p) => data.permissions?.[p]),
        }))
        .filter((m) => m.permissions.length > 0);
      
      payload = { ...payload, warehouse: data.warehouse, access };
    }

    try {
      await createUserMutation.mutateAsync(payload);
      navigate("/team");
    } catch (error) {
      handleError(error, "Failed to create user.");
    }
  };

  return (
    <FormPageLayout
      title="Add Team Member"
      subtitle="Create a new user and set their initial details."
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isSubmitting}
      isEditMode={false}
      submitButtonText="Member"
      cancelLink="/team"
    >
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
            error={errors.name}
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            register={register}
            validation={{ required: "Email is required" }}
            error={errors.email}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            register={register}
            validation={{ required: "Password is required" }}
            error={errors.password}
          />
          <InputField
            label="Role Name"
            name="roleName"
            register={register}
            validation={{ required: "Role name is required" }}
            error={errors.roleName}
          />
          <InputField
            label="Description"
            name="description"
            register={register}
            className="md:col-span-2"
          />
        </div>
      </FormSection>

      {isSuperAdmin && (
        <>
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
              defaultValue={[]}
              render={({ field }) => (
                <MultiSelectField
                  label="Warehouses"
                  name="warehouse"
                  options={
                    Array.isArray(warehousesData?.data)
                      ? warehousesData.data.map((wh) => ({
                          value: wh._id,
                          label: wh.name,
                        }))
                      : []
                  }
                  value={field.value}
                  onChange={field.onChange}
                  isLoading={isWarehousesLoading}
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
            {isPermissionsLoading ? <p>Loading permissions...</p> : (
              <div>
                {MODULES_ORDER.map((moduleName) => {
                  const permissions = ALL_PERMISSIONS_DYNAMIC[moduleName];
                  if (!permissions || permissions.length === 0) return null;
                  return (
                    <div key={moduleName} className="mt-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2 mb-2">
                        {moduleName}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {permissions.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              {...register(`permissions.${permission}`)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-700">
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
            )}
          </FormSection>
        </>
      )}
    </FormPageLayout>
  );
};

export default AddTeamMemForm;
