import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import FormDialog from "@/components/ui/FormDialog";
import FormDialogInput from "@/components/ui/FormDialogInput";
import { showErrorToast } from "@/utils/notifications";
import {
  useCountries,
  useCreateCountry,
  useDeleteCountry,
  useUpdateCountry,
} from "../../api/hooks/country";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router";
import { Trash } from "lucide-react";
import ValueSkeleton from "@/components/ui/ValueSkeleton";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import classNames from "@/utils/classNames";
import Button from "@/components/ui/Button";

export default function CountrySettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission("COUNTRY_VIEW")) {
      showErrorToast("You don't have permission to view countries.");
      navigate("/settings");
    }
  }, [hasPermission, navigate]);

  const { data: countryData, isLoading, isError, error } = useCountries();
  const createMutation = useCreateCountry();
  const updateMutation = useUpdateCountry();
  const deleteMutation = useDeleteCountry();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const openModal = (country = null) => {
    if (country) {
      setEditingCountry(country);
      setValue("name", country.name);
    } else {
      setEditingCountry(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCountry(null);
    setIsModalOpen(false);
    reset();
  };

  const handleCreateCountry = (data) => {
    createMutation.mutate({ name: data.name }, {
      onSuccess: closeModal,
    });
  };

  const handleUpdateCountry = (data) => {
    if (!editingCountry) return;

    updateMutation.mutate(
      {
        id: editingCountry._id,
        data: { name: data.name },
      },
      {
        onSuccess: closeModal,
      },
    );
  };

  const openDeleteModal = (country) => {
    setCountryToDelete(country);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCountryToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteCountry = () => {
    if (!countryToDelete) return;
    deleteMutation.mutate(countryToDelete._id, {
      onSuccess: closeDeleteModal,
    });
  };

  if (isError) {
    return (
      <div className="px-2">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Supplier Countries</h1>
          </div>
          {hasPermission("COUNTRY_CREATE") && (
            <div className="mt-4 sm:mt-0 flex justify-center items-center">
              <Button
                type="button"
                onClick={() => openModal()}
                variant="primary"
                className="block px-3 py-2 text-center text-sm font-semibold"
              >
                Create New
              </Button>
            </div>
          )}
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="flex items-center justify-center h-15 text-[var(--color-danger)]">
              Error: {error.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Supplier Countries</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 flex flex-wrap items-center gap-4">
          {hasPermission("COUNTRY_DELETE") && (
            <Link
              className="text-sm flex items-center gap-2 text-[var(--color-primary)]"
              to="/trash/Country"
            >
              <Trash size={16} /> Trash
            </Link>
          )}
          {hasPermission("COUNTRY_CREATE") && (
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
      <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300 bg-white">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Country Name
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 sm:pr-6"
              >
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
                  <td className="py-3.5 pr-4 pl-3 text-sm sm:pr-6">
                    <div className="flex justify-center gap-2">
                      <ValueSkeleton width="w-16" height="h-8" />
                      <ValueSkeleton width="w-16" height="h-8" />
                    </div>
                  </td>
                </tr>
              ))
              : countryData?.data?.map((country, idx) => (
                <tr key={country._id}>
                  <td
                    className={classNames(
                      idx === 0 ? "" : "border-t border-gray-200",
                      "py-4 pr-3 pl-4 text-sm sm:pl-6",
                    )}
                  >
                    <div className="font-medium text-gray-900">
                      {country.name}
                    </div>
                  </td>
                  <td
                    className={classNames(
                      idx === 0 ? "" : "border-t border-gray-200",
                      "py-3.5 pr-4 pl-3 text-sm sm:pr-6",
                    )}
                  >
                    <div className="flex justify-center gap-2">
                      {hasPermission("COUNTRY_UPDATE") && (
                        <Button
                          type="button"
                          onClick={() => openModal(country)}
                          variant="secondary"
                          size="sm"
                        >
                          Edit
                        </Button>
                      )}
                      {hasPermission("COUNTRY_DELETE") && (
                        <Button
                          type="button"
                          onClick={() => openDeleteModal(country)}
                          variant="danger"
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

      {isModalOpen && (
        <FormDialog
          open={isModalOpen}
          onClose={closeModal}
          title={editingCountry ? "Edit Country" : "Add New Country"}
          primaryButtonText={editingCountry ? "Update" : "Create"}
          secondaryButtonText="Cancel"
          onSubmit={handleSubmit(
            editingCountry ? handleUpdateCountry : handleCreateCountry,
          )}
          isSubmitting={
            createMutation.isLoading || updateMutation.isLoading
          }
        >
          <FormDialogInput
            id="name"
            name="name"
            label="Country Name"
            type="text"
            placeholder="Enter country name (e.g., South Korea)"
            register={register}
            error={errors.name?.message}
            validation={{ required: "Country name is required" }}
          />
        </FormDialog>
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteCountry}
          title="Delete Country"
          description="Are you sure you want to delete this country? This action cannot be undone."
          confirmText="Delete"
          isConfirming={deleteMutation.isLoading}
        />
      )}
    </div>
  );
}
