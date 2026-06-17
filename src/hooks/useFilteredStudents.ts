import { useMemo } from "react";
import { useStudentsStore } from "@/stores/students.store";
import { normalizeSearch } from "@/helpers/search";
import type { IStudent } from "@/services/users/user.interface";

export const useFilteredStudents = (students: IStudent[] = []) => {
  const { searchTerm } = useStudentsStore();

  return useMemo(() => {
    const term = normalizeSearch(searchTerm);

    if (!term) return students;

    return students.filter((student) => {
      const fn = normalizeSearch(student.person.firstNames ?? "");
      const ln = normalizeSearch(student.person.lastNames ?? "");
      const id = normalizeSearch(student.person.identificationNumber ?? "");
      const fullName = `${fn} ${ln}`;
      return fn.includes(term) || ln.includes(term) || id.includes(term) || fullName.includes(term);
    });
  }, [students, searchTerm]);
};