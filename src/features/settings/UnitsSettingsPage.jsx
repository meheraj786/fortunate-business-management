import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import FormDialog from "@/components/ui/FormDialog";
import FormDialogInput from "@/components/ui/FormDialogInput";

import {
  useUnits,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from "@/api/hooks/unit";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";
import { Trash } from "lucide-react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function UnitsSettings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {isSuperAdmin} = useAuth();
  const [editingUnit, setEditingUnit] = useState(null);

  /* Queries & Mutations */
  const { data, isLoading, isError, error } = useUnits();
  const units = data?.data || [];

  const createUnitMutation = useCreateUnit();
  const updateUnitMutation = useUpdateUnit();
  const deleteUnitMutation = useDeleteUnit();

  /* Form */
  const {
    register,
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
    [reset, setValue]
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
        data.type === "Countable"
          ? 1
          : Number(data.conversionFactor),
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
        data.type === "Countable"
          ? 1
          : Number(data.conversionFactor),
    };

    updateUnitMutation.mutate(
      {
        id: editingUnit._id,
        data: payload,
      },
      {
        onSuccess: closeModal,
      }
    );
  };

  /* DELETE */
  const handleDeleteUnit = (id) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return;
    deleteUnitMutation.mutate(id);
  };

  /* UI states */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-gray-600">Loading units...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-red-600">
          {error?.message || "Failed to load units"}
        </p>
      </div>
    );
  }

  return (
    <div className="px-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
            Units
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage measurement units for your inventory.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Create New
        </button>
                    {
                      isSuperAdmin && <Link className="text-xs flex items-center gap-2 text-blue-600" to="/trash/unit"> <Trash/> Units Trash</Link>
                    }
      </div>

      {/* Table */}
      <div className="-mx-4 mt-8 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="py-3.5 pl-4 text-left text-sm font-semibold">
                Name
              </th>
              <th className="hidden px-3 py-3.5 text-left text-sm font-semibold lg:table-cell">
                Type
              </th>
              <th className="hidden px-3 py-3.5 text-left text-sm font-semibold lg:table-cell">
                Conversion Factor
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {units.map((unit) => (
              <tr key={unit._id}>
                <td
                  className={classNames(
                    
                    "py-4 pl-4 text-sm"
                  )}
                >
                  {unit.name}
                </td>
                <td className="hidden px-3 py-3.5 text-sm lg:table-cell">
                  {unit.type}
                </td>
                <td className="hidden px-3 py-3.5 text-sm lg:table-cell">
                  {unit.conversionFactor}
                </td>
                <td className="py-3.5 px-3 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(unit)}
                      className="rounded-md bg-gray-100 px-2.5 py-1.5 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(unit._id)}
                      className="rounded-md bg-red-100 px-2.5 py-1.5 text-sm text-red-700"
                    >
                      Delete
                    </button>
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
            editingUnit ? handleUpdateUnit : handleCreateUnit
          )}
          isSubmitting={isSubmitting}
        >
          <FormDialogInput
            id="name"
            name="name"
            label="Unit Name"
            register={register}
            error={errors.name}
            validation={{ required: "Unit name is required" }}
          />

          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              {...register("type", { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="Weight">Weight</option>
              <option value="Countable">Countable</option>
              <option value="Volume">Volume</option>
            </select>
          </div>

          {selectedType !== "Countable" && (
            <FormDialogInput
              id="conversionFactor"
              name="conversionFactor"
              type="number"
              label="Conversion Factor"
              register={register}
              error={errors.conversionFactor}
              validation={{
                required: "Conversion factor is required",
                min: { value: 0.001, message: "Must be greater than 0" },
                valueAsNumber: true,
              }}
            />
          )}
        </FormDialog>
      )}
    </div>
  );
}
