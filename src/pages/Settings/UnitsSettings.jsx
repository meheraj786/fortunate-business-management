import { useEffect, useState, useCallback, useContext } from "react";
import { useForm } from "react-hook-form";
import FormDialog from "../../components/common/FormDialog";
import FormDialogInput from "../../components/common/FormDialogInput";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function UnitsSettings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [refetch, setRefetch] = useState(false);
  const { baseUrl } = useContext(UrlContext);

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

  // Watch the type to conditionally show conversion factor
  const selectedType = watch("type");

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
    [setValue, reset]
  );

  const closeModal = useCallback(() => {
    setEditingUnit(null);
    setIsModalOpen(false);
    reset();
    setError(null);
  }, [reset]);

  const handleCreateUnit = async (data) => {
    try {
      const unitData = {
        name: data.name.trim(),
        type: data.type,
        conversionFactor:
          data.type === "Countable" ? 1 : parseFloat(data.conversionFactor),
      };

      const response = await axios.post(`${baseUrl}unit/create`, unitData);
      setUnits((prev) => [...prev, response.data.data]);
      closeModal();
    } catch (error) {
      console.error("Error creating unit:", error);
      setError(error.response?.data?.message || "Failed to create unit");
    }
  };

  const handleUpdateUnit = async (data) => {
    if (!editingUnit) return;

    try {
      const unitData = {
        name: data.name.trim(),
        type: data.type,
        conversionFactor:
          data.type === "Countable" ? 1 : parseFloat(data.conversionFactor),
      };

      const response = await axios.put(
        `${baseUrl}unit/update/${editingUnit._id}`,
        unitData
      );
      setUnits((prev) =>
        prev.map((unit) =>
          unit._id === editingUnit._id ? response.data.data : unit
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error updating unit:", error);
      setError(error.response?.data?.message || "Failed to update unit");
    }
  };

  const handleDeleteUnit = async (id) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) {
      return;
    }

    try {
      await axios.delete(`${baseUrl}unit/delete/${id}`);
      setUnits((prev) => prev.filter((unit) => unit._id !== id));
    } catch (error) {
      console.error("Error deleting unit:", error);
      setError(error.response?.data?.message || "Failed to delete unit");
    }
  };

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${baseUrl}unit/get`);
      setUnits(response.data.data);
    } catch (error) {
      console.error("Error fetching units:", error);
      setError(error.response?.data?.message || "Failed to fetch units");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits, refetch]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Loading units...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
            <button
              onClick={() => setRefetch((prev) => !prev)}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (units.length === 0) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">No units found.</p>
            <button
              onClick={() => openModal()}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Create your first unit
            </button>
          </div>
        </div>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-300 dark:divide-black/15">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-black"
            >
              Name
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell dark:text-black"
            >
              Type
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell dark:text-black"
            >
              Conversion Factor
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6 dark:text-black"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit, unitIdx) => (
            <tr key={unit._id}>
              <td
                className={classNames(
                  unitIdx === 0
                    ? ""
                    : "border-t border-gray-200 dark:border-black/10",
                  "py-4 pr-3 pl-4 text-sm sm:pl-6"
                )}
              >
                <div className="font-medium text-gray-900 dark:text-black">
                  {unit.name}
                </div>
              </td>
              <td
                className={classNames(
                  unitIdx === 0
                    ? ""
                    : "border-t border-gray-200 dark:border-black/10",
                  "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell dark:text-gray-400"
                )}
              >
                {unit.type}
              </td>
              <td
                className={classNames(
                  unitIdx === 0
                    ? ""
                    : "border-t border-gray-200 dark:border-black/10",
                  "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell dark:text-gray-400"
                )}
              >
                {unit.conversionFactor}
              </td>
              <td
                className={classNames(
                  unitIdx === 0
                    ? ""
                    : "border-t border-gray-200 dark:border-black/10",
                  "py-3.5 pr-4 pl-3 text-sm sm:pr-6"
                )}
              >
                <div className="flex flex-col sm:flex-row w-max gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(unit)}
                    className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-30 dark:bg-black/10 dark:text-black dark:ring-black/10 dark:hover:bg-black/15 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUnit(unit._id)}
                    className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-1.5 text-sm font-semibold text-red-700 shadow-xs ring-1 ring-inset ring-red-300 hover:bg-red-50 disabled:opacity-30 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900/30 dark:hover:bg-red-900/30 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="px-4 mt-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
            Units
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage measurement units for your inventory.
          </p>
        </div>
        <div className="sm:mt-0 sm:ml-16 sm:flex-none flex justify-center items-center">
          <button
            type="button"
            onClick={() => openModal()}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 cursor-pointer transition-colors duration-200"
          >
            Create New
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="-mx-4 mt-8 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg dark:ring-black/15">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <FormDialog
          open={isModalOpen}
          onClose={closeModal}
          title={editingUnit ? "Edit Unit" : "Create New Unit"}
          primaryButtonText={editingUnit ? "Update" : "Create Unit"}
          secondaryButtonText="Cancel"
          onSubmit={handleSubmit(
            editingUnit ? handleUpdateUnit : handleCreateUnit
          )}
          isSubmitting={isSubmitting}
          error={error}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <FormDialogInput
            id="name"
            name="name"
            label="Unit Name"
            type="text"
            placeholder="Enter unit name (e.g., Kilogram, Liter)"
            register={register}
            error={errors.name}
            validation={{
              required: "Unit name is required",
              minLength: {
                value: 2,
                message: "Unit name must be at least 2 characters",
              },
              maxLength: {
                value: 50,
                message: "Unit name must be less than 50 characters",
              },
            }}
          />

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Type
            </label>
            <div className="mt-1">
              <select
                id="type"
                name="type"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                {...register("type", { required: "Type is required" })}
              >
                <option value="Weight">Weight</option>
                <option value="Countable">Countable</option>
                <option value="Volume">Volume</option>
              </select>
              {errors.type && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>

          {selectedType !== "Countable" && (
            <FormDialogInput
              id="conversionFactor"
              name="conversionFactor"
              label="Conversion Factor"
              type="number"
              step="0.001"
              placeholder="Enter conversion factor"
              register={register}
              error={errors.conversionFactor}
              validation={{
                required:
                  selectedType !== "Countable"
                    ? "Conversion factor is required"
                    : false,
                min: {
                  value: 0.001,
                  message: "Conversion factor must be greater than 0",
                },
                valueAsNumber: true,
              }}
              helpText={`Conversion factor relative to base unit for ${selectedType.toLowerCase()}`}
            />
          )}
        </FormDialog>
      )}
    </div>
  );
}
