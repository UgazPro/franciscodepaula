import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi } from "@/services/api";

export const useLinkStudentRepresentative = () => {
  return useMutation({
    mutationFn: ({ studentId, representativeId }: { studentId: number; representativeId: number }) =>
      postDataApi("/enrollment/representatives", { studentId, representativeId }),
  });
};

export const useAssignSection = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, schoolYearId, sectionId, enrollmentDate }: {
      studentId: number;
      schoolYearId: number;
      sectionId: number;
      enrollmentDate?: Date;
    }) => {
      return postDataApi("/enrollment", {
        studentId,
        schoolYearId,
        sectionId,
        enrollmentDate: enrollmentDate || new Date(),
        status: true,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-enrollments"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useEnrollmentMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (formData: Record<string, unknown>) => {
      const payload: Record<string, unknown> = {
        // Student
        firstNames: formData.firstNames,
        lastNames: formData.lastNames,
        identificationNumber: formData.identificationNumber,
        birthDate: formData.birthDate,
        gender: formData.gender,
        profilePhoto: formData.profilePhoto || "",
        birthCountry: formData.birthCountry,
        state: formData.state,
        municipality: formData.municipality,
        parish: formData.parish,
        currentParish: formData.currentParish,
        address: formData.address,
        admissionDate: new Date(),

        // Representative mode
        representativeMode: formData.representativeMode || "create",

        // Enrollment
        schoolYearId: formData.schoolYearId,
        sectionId: formData.sectionId,
        enrollmentDate: formData.enrollmentDate || new Date(),
      };

      if (payload.representativeMode === "create") {
        payload.representativeFirstNames = formData.representativeFirstNames;
        payload.representativeLastNames = formData.representativeLastNames;
        payload.representativeIdentification = formData.representativeIdentification;
        payload.representativeBirthDate = formData.representativeBirthDate;
        payload.representativeGender = formData.representativeGender;
        payload.representativeEmail = formData.representativeEmail;
        payload.representativePhone = formData.representativePhone;
        payload.representativeRelation = formData.representativeRelation;
        payload.representativeProfession = formData.representativeProfession || "";
      } else {
        payload.existingRepresentativeId = formData.existingRepresentative?.id;
        payload.representativeRelation = formData.representativeRelation;
      }

      return await postDataApi("/enrollment/full", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["pending-enrollments"] });
      qc.invalidateQueries({ queryKey: ["representatives"] });
    },
  });
};

export const useUpdateEnrollment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      putDataApi(`/enrollment/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};
