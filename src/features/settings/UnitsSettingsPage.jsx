import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import FormDialog from "@/components/ui/FormDialog";
import FormDialogInput from "@/components/ui/FormDialogInput";
import SelectField from "@/components/ui/SelectField";
import { showErrorToast } from "@/utils/notifications";
import {
  useUnits,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from "@/api/hooks/unit";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router";
import { Trash } from "lucide-react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import classNames from "@/utils/classNames";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import Button from "@/components/ui/Button";

export default function UnitsSettings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission("UNIT_VIEW")) {
      showErrorToast("You don't have permission to view units.");
      navigate("/settings");
    }
  }, [hasPermission, navigate]);

  /* Queries & Mutations */
  const { data, isLoading, isError, error } = useUnits();
  const units = data?.data || [];

  const createUnitMutation = useCreateUnit();
  const updateUnitMutation = useUpdateUnit();
  const deleteUnitMutation = useDeleteUnit();

  /* Form */
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      type: "Weight",
      conversionFactor: 1,
    },
  });

  const selectedType = watch("type");

  /* Modal handlers */
  const openModal = useCallback(
    (unit = null) => {
      if (unit) {
        setEditingUnit(unit);
        setValue("name", unit.name);
        setValue("type", unit.type);
        setValue("conversionFactor", unit.conversionFactor);
      } else {
        setEditingUnit(null);
        reset();
      }
      setIsModalOpen(true);
    },
    [reset, setValue],
  );

  const closeModal = () => {
    setEditingUnit(null);
    setIsModalOpen(false);
    reset();
  };

  /* CREATE */
  const handleCreateUnit = (data) => {
    const payload = {
      name: data.name.trim(),
      type: data.type,
      conversionFactor:
        data.type === "Countable" ? 1 : Number(data.conversionFactor),
    };

    createUnitMutation.mutate(payload, {
      onSuccess: closeModal,
    });
  };

  /* UPDATE */
  const handleUpdateUnit = (data) => {
    if (!editingUnit) return;

    const payload = {
      name: data.name.trim(),
      type: data.type,
      conversionFactor:
        data.type === "Countable" ? 1 : Number(data.conversionFactor),
    };

    updateUnitMutation.mutate(
      {
        id: editingUnit._id,
        data: payload,
      },
      {
        onSuccess: closeModal,
      },
    );
  };

  const openDeleteModal = (unit) => {
    setUnitToDelete(unit);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUnitToDelete(null);
    setIsDeleteModalOpen(false);
  };

  /* DELETE */
  const handleDeleteUnit = () => {
    if (!unitToDelete) return;
    deleteUnitMutation.mutate(unitToDelete._id, {
      onSuccess: closeDeleteModal,
    });
  };

  /* UI states */

  if (isError) {
    showErrorToast(error, "Failed to load units");
    return (
      <div className="text-[var(--color-danger)] text-center">
        Failed to load units.
      </div>
    );
  }

  return (
    <div className="px-2">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Units</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage measurement units for your inventory.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 flex flex-wrap items-center gap-4">
          {hasPermission("UNIT_DELETE") && (
            <Link
              className="text-sm flex items-center gap-2 text-[var(--color-primary)]" // Themed color
              to="/trash/unit"
            >
              <Trash size={16} /> Trash
            </Link>
          )}
          {hasPermission("UNIT_CREATE") && (
            <Button
              type="button"
              onClick={() => openModal()}
              variant="primary"
              className="block px-3 py-2 text-center text-sm font-semibold"
            >
              Create New
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="-mx-4 mt-8 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300 bg-white">
          <thead>
            <tr>
              <th className="py-3.5 pl-4 text-left text-sm font-semibold sm:pl-6">
                Name
              </th>
              <th className="hidden px-3 py-3.5 text-left text-sm font-semibold lg:table-cell">
                Type
              </th>
              <th className="hidden px-3 py-3.5 text-left text-sm font-semibold lg:table-cell">
                Conversion Factor
              </th>
              <th className="px-3 py-3.5 text-center text-sm font-semibold sm:pr-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-4 pr-3 pl-4 text-sm sm:pl-6">
                    <ValueSkeleton width="w-24" />
                  </td>
                  <td className="hidden px-3 py-3.5 text-sm lg:table-cell">
                    <ValueSkeleton width="w-16" />
                  </td>
                  <td className="hidden px-3 py-3.5 text-sm lg:table-cell">
                    <ValueSkeleton width="w-full" />
                  </td>
                  <td className="py-3.5 pr-4 pl-3 text-sm sm:pr-6">
                    <div className="flex justify-center gap-2">
                      <ValueSkeleton width="w-16" height="h-8" />
                      <ValueSkeleton width="w-16" height="h-8" />
                    </div>
                  </td>
                </tr>
              ))
              : units.map((unit, unitIdx) => (
                <tr key={unit._id}>
                  <td
                    className={classNames(
                      unitIdx === 0 ? "" : "border-t border-gray-200",
                      "py-4 pl-4 pr-3 text-sm sm:pl-6",
                    )}
                  >
                    {unit.name}
                  </td>
                  <td
                    className={classNames(
                      unitIdx === 0 ? "" : "border-t border-gray-200",
                      "hidden px-3 py-3.5 text-sm lg:table-cell",
                    )}
                  >
                    {unit.type}
                  </td>
                  <td
                    className={classNames(
                      unitIdx === 0 ? "" : "border-t border-gray-200",
                      "hidden px-3 py-3.5 text-sm lg:table-cell",
                    )}
                  >
                    {unit.conversionFactor}
                  </td>
                  <td
                    className={classNames(
                      unitIdx === 0 ? "" : "border-t border-gray-200",
                      "py-3.5 pl-3 pr-4 text-sm sm:pr-6",
                    )}
                  >
                    <div className="flex justify-center gap-2">
                      {hasPermission("UNIT_UPDATE") && (
                        <Button
                          onClick={() => openModal(unit)}
                          variant="secondary" // Changed to secondary
                          size="sm"
                        >
                          Edit
                        </Button>
                      )}
                      {hasPermission("UNIT_DELETE") && (
                        <Button
                          onClick={() => openDeleteModal(unit)}
                          variant="danger" // Changed to danger
                          size="sm"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <FormDialog
          open={isModalOpen}
          onClose={closeModal}
          title={editingUnit ? "Edit Unit" : "Create Unit"}
          primaryButtonText={editingUnit ? "Update" : "Create"}
          secondaryButtonText="Cancel"
          onSubmit={handleSubmit(
            editingUnit ? handleUpdateUnit : handleCreateUnit,
          )}
          isSubmitting={isSubmitting}
        >
          <FormDialogInput
            id="name"
            name="name"
            label="Unit Name"
            register={register}
            error={errors.name?.message}
            validation={{ required: "Unit name is required" }}
            placeholder="e.g., Kilogram, Liter, Piece"
          />

          <SelectField
            className="mt-4"
            id="type"
            name="type"
            label="Type"
            control={control}
            error={errors.type?.message}
            validation={{ required: "Unit type is required" }}
            options={[
              { value: "Weight", label: "Weight" },
              { value: "Countable", label: "Countable" },
              { value: "Volume", label: "Volume" },
            ]}
          />

          {selectedType !== "Countable" && (
            <div>
              <FormDialogInput
                id="conversionFactor"
                name="conversionFactor"
                type="number"
                label="Conversion Factor"
                register={register}
                error={errors.conversionFactor?.message}
                validation={{
                  required: "Conversion factor is required",
                  min: { value: 0.001, message: "Must be greater than 0" },
                  valueAsNumber: true,
                }}
                placeholder="e.g., 1000 for kg to g"
              />
              <p className="mt-1 text-sm text-gray-500">
                The factor by which this unit converts to its base unit (e.g.,
                1000 for Kilogram if base is Gram).
              </p>
            </div>
          )}
        </FormDialog>
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteUnit}
          title="Delete Unit"
          description="Are you sure you want to delete this unit? This action cannot be undone."
          confirmText="Delete"
          isConfirming={deleteUnitMutation.isLoading}
        />
      )}
    </div>
  );
}
