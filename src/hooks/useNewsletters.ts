import { useQuery } from "@tanstack/react-query";
import { getDataApi } from "@/services/api";
import type { SabanaSection } from "./useGradeAdjustments";

export type MomentType = "I" | "II" | "III";

interface BoletinResponse {
  success: boolean;
  data: {
    sections: SabanaSection[];
  };
}

export const useBoletinData = (periodId: number | null, enabled: boolean) => {
  return useQuery<BoletinResponse>({
    queryKey: ["boletin-data", periodId],
    queryFn: () => getDataApi(`/grade-adjustments/sabana?periodId=${periodId}`),
    staleTime: 1000 * 60 * 2,
    enabled,
  });
};
