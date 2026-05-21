import { useMemo } from "react";
import { useStudentsStore } from "@/stores/students.store";
import type { IStudent } from "@/services/users/user.interface";

export const useFilteredStudents = (students: IStudent[] = []) => {
  const { searchTerm } = useStudentsStore();

  return useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return students;

    return students.filter((student) => {
      const firstNames = student.person.firstNames?.toLowerCase() ?? "";
      const lastNames = student.person.lastNames?.toLowerCase() ?? "";
      const identification = student.person.identificationNumber?.toLowerCase() ?? "";

      const fullName = `${firstNames} ${lastNames}`;

      return (
        firstNames.includes(search) ||
        lastNames.includes(search) ||
        identification.includes(search) ||
        fullName.includes(search)
      );
    });
  }, [students, searchTerm]);
};