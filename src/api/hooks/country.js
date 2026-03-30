import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/country.api";
import { useApiMutation } from "@/hooks/useApiMutation";

export const useCountries = () =>
  useQuery({
    queryKey: ["countries"],
    queryFn: async () => (await api.getCountries()).data,
  });

export const useCountry = (id) =>
  useQuery({
    queryKey: ["countries", id],
    queryFn: async () => (await api.getCountryById(id)).data,
    enabled: !!id,
  });

export const useCreateCountry = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.createCountry,
    successMessage: "Country created successfully!",
    onSuccess: () => qc.invalidateQueries({ queryKey: ["countries"] }),
  });
};

export const useUpdateCountry = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => api.updateCountry(id, data),
    successMessage: "Country updated successfully!",
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["countries"] });
      qc.invalidateQueries({ queryKey: ["countries", id] });
    }
  });
};

export const useDeleteCountry = () => {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: api.deleteCountry,
    successMessage: "Country deleted successfully!",
    onSuccess: () => qc.invalidateQueries({ queryKey: ["countries"] }),
  });
};
