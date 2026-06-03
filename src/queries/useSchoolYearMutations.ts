import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi, deleteDataApi } from "@/services/api";

export const useCreateSchoolYear = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; startDate: Date; endDate: Date }) =>
      postDataApi("/school-year", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["school-years"] });
    },
  });
};

export const useUpdateSchoolYear = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      putDataApi(`/school-year/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["school-years"] });
    },
  });
};

export const useToggleSchoolYearActive = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      putDataApi(`/school-year/${id}/toggle-active`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["school-years"] });
    },
  });
};

export const useCreateSection = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      schoolYearId: number;
      highSchoolLevelId: number;
      section: string;
    }) => postDataApi("/school-year/sections", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sections"] });
      qc.invalidateQueries({ queryKey: ["school-years"] });
    },
  });
};

export const useUpdateSection = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { schoolYearId: number; highSchoolLevelId: number; section: string };
    }) => putDataApi(`/school-year/sections/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sections"] });
      qc.invalidateQueries({ queryKey: ["school-years"] });
    },
  });
};

export const useDeleteSection = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDataApi("/school-year/sections", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sections"] });
      qc.invalidateQueries({ queryKey: ["school-years"] });
    },
  });
};

export const useCreateLevel = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { level: string }) =>
      postDataApi("/school-year/levels", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["levels"] });
    },
  });
};

export const useUpdateLevel = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { level: string } }) =>
      putDataApi(`/school-year/levels/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["levels"] });
    },
  });
};

export const useDeleteLevel = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDataApi("/school-year/levels", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["levels"] });
    },
  });
};
