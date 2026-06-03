import { useQuery } from "@tanstack/react-query";
import {
  getCountries,
  getStates,
  getMunicipalities,
  getParishes,
} from "@/services/locations/location.service";

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
    staleTime: 1000 * 60 * 30,
  });
};

export const useStates = (countryId?: number) => {
  return useQuery({
    queryKey: ["states", countryId],
    queryFn: () => getStates(countryId!),
    enabled: !!countryId,
    staleTime: 1000 * 60 * 30,
  });
};

export const useMunicipalities = (stateId?: number) => {
  return useQuery({
    queryKey: ["municipalities", stateId],
    queryFn: () => getMunicipalities(stateId!),
    enabled: !!stateId,
    staleTime: 1000 * 60 * 30,
  });
};

export const useParishes = (municipalityId?: number) => {
  return useQuery({
    queryKey: ["parishes", municipalityId],
    queryFn: () => getParishes(municipalityId!),
    enabled: !!municipalityId,
    staleTime: 1000 * 60 * 30,
  });
};
