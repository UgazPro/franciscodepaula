import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postDataApi } from "@/services/api";

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
      // 1. Crear estudiante
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

      console.log("Respuesta del estudiante:", student);

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

      console.log("Payload del representante:", representativePayload);

      const representative = await postDataApi("/users/representatives", representativePayload);

      console.log("Respuesta del representante:", representative);

      if (!representative || !representative.id) {
        throw new Error("Error al crear el representante");
      }

      // 3. Vincular estudiante ↔ representante
      await postDataApi("/enrollment/representatives", {
        studentId: student.id,
        representativeId: representative.id,
      });

      console.log("Estudiante y representante vinculados:", { student, representative });

      return { student, representative };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};
