import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import FormDialog from "@/components/ui/FormDialog";
import FormDialogInput from "@/components/ui/FormDialogInput";
import toast from "react-hot-toast";
import { handleError } from "@/utils/handle-error";
import {
    useUnits,
    useCreateUnit,
    useUpdateUnit,
    useDeleteUnit,
} from "@/api/hooks/unit";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";
import { Trash } from "lucide-react";
import UnitsSettingsSkeleton from "./components/UnitsSettingsSkeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function UnitsSettings() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState(null);
    const { isSuperAdmin } = useAuth();

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
            onSuccess: () => {
                closeModal();
                toast.success("Unit created successfully!");
            },
            onError: (error) => {
                handleError(error, "Failed to create unit");
            },
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
                onSuccess: () => {
                    closeModal();
                    toast.success("Unit updated successfully!");
                },
                onError: (error) => {
                    handleError(error, "Failed to update unit");
                }
            }
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
            onSuccess: () => {
                toast.success("Unit deleted successfully!");
                closeDeleteModal();
            },
            onError: (error) => {
                handleError(error, "Failed to delete unit");
                closeDeleteModal();
            }
        });
    };

    /* UI states */
    if (isLoading) {
        return <UnitsSettingsSkeleton />;
    }

    if (isError) {
        handleError(error, "Failed to load units");
        return <div className="text-red-500 text-center">Failed to load units.</div>;
    }

    return (
        <div className="px-2">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
                        Units
                    </h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Manage measurement units for your inventory.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 flex flex-wrap items-center gap-4">
                    {isSuperAdmin && (
                        <Link
                            className="text-sm flex items-center gap-2 text-blue-600"
                            to="/trash/unit"
                        >
                            <Trash size={16} /> Trash
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => openModal()}
                        className="block rounded-md bg-[rgb(0,51,102)] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[rgb(0,41,82)] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[rgb(0,51,102)]"
                    >
                        Create New
                    </button>
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
                        {units.map((unit, unitIdx) => (
                            <tr key={unit._id}>
                                <td
                                    className={classNames(
                                        unitIdx === 0 ? "" : "border-t border-gray-200",
                                        "py-4 pl-4 pr-3 text-sm sm:pl-6"
                                    )}
                                >
                                    {unit.name}
                                </td>
                                <td
                                    className={classNames(
                                        unitIdx === 0 ? "" : "border-t border-gray-200",
                                        "hidden px-3 py-3.5 text-sm lg:table-cell"
                                    )}
                                >
                                    {unit.type}
                                </td>
                                <td
                                    className={classNames(
                                        unitIdx === 0 ? "" : "border-t border-gray-200",
                                        "hidden px-3 py-3.5 text-sm lg:table-cell"
                                    )}
                                >
                                    {unit.conversionFactor}
                                </td>
                                <td
                                    className={classNames(
                                        unitIdx === 0 ? "" : "border-t border-gray-200",
                                        "py-3.5 pl-3 pr-4 text-sm sm:pr-6"
                                    )}
                                >
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => openModal(unit)}
                                            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(unit)}
                                            className="rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

            {isDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDeleteUnit}
                    title="Delete Unit"
                    description="Are you sure you want to delete this unit? This action cannot be undone."
                    confirmText="Delete"
                    isSubmitting={deleteUnitMutation.isLoading}
                />
            )}
        </div>
    );
}
