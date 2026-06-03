import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi, putDataApi } from "@/services/api";

export const useCreateRepresentative = () => {
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      postDataApi("/users/representatives", data),
  });
};

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
    mutationFn: async (formData: any) => {
      // 1. Crear estudiante (status: true = activo este año escolar)
      const studentPayload = {
        profilePhoto: formData.profilePhoto || "",
        firstNames: formData.firstNames,
        lastNames: formData.lastNames,
        identificationNumber: formData.identificationNumber,
        birthDate: formData.birthDate,
        gender: formData.gender,
        birthCountry: formData.birthCountry,
        state: formData.state,
        municipality: formData.municipality,
        parish: formData.parish,
        currentParish: formData.currentParish,
        previousSchool: formData.previousSchool || "",
        address: formData.address,
        status: true,
        admissionDate: formData.admissionDate || new Date(),
      };

      const student = await postDataApi("/users/students", studentPayload);

      if (!student || !student.id) {
        throw new Error("Error al crear el estudiante");
      }

      // 2. Crear representante (password = cédula del estudiante, backend la hashea)
      const representativePayload = {
        firstNames: formData.representativeFirstNames,
        lastNames: formData.representativeLastNames,
        identificationNumber: formData.representativeIdentification,
        birthDate: formData.representativeBirthDate,
        gender: formData.representativeGender,
        email: formData.representativeEmail,
        phone: formData.representativePhone,
        relationship: formData.representativeRelation,
        occupation: formData.representativeProfession || "",
        studentIdentification: formData.identificationNumber,
      };

      const representative = await postDataApi("/users/representatives", representativePayload);

      if (!representative || !representative.id) {
        throw new Error("Error al crear el representante");
      }

      // 3. Vincular estudiante ↔ representante
      await postDataApi("/enrollment/representatives", {
        studentId: student.id,
        representativeId: representative.id,
      });

      // 4. Asignar sección (año escolar, nivel, sección, fecha)
      await postDataApi("/enrollment", {
        studentId: student.id,
        schoolYearId: formData.schoolYearId,
        sectionId: formData.sectionId,
        enrollmentDate: formData.enrollmentDate || new Date(),
        status: true,
      });

      return { student, representative };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["pending-enrollments"] });
    },
  });
};

export const useUpdateEnrollment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      putDataApi(`/enrollment/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};
