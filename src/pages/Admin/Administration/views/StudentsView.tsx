import { Search, LayoutList, Grid3X3, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useStudents } from "@/hooks/useUsers";
import { useFilteredStudents } from "@/hooks/useFilteredStudents";
import { useStudentsStore } from "@/stores/students.store";
import type { IStudent, StudentRepresentative, StudentEnrollment } from "@/services/users/user.interface";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";

const itemsPerPage = 12;

function getGradeAndSection(student: IStudent): string {
  const enrollment = (student.enrollments ?? [])
    .filter((e) => e.status)
    .sort((a, b) => (a.schoolYearId > b.schoolYearId ? -1 : 1))[0] as StudentEnrollment | undefined;
  if (!enrollment) return "—";
  return `${enrollment.section.highSchoolLevel.level} "${enrollment.section.section}"`;
}

function getRepresentativeName(student: IStudent): string {
  const rep = (student.representatives ?? [])[0] as StudentRepresentative | undefined;
  if (!rep) return "—";
  const p = rep.representative.user.person;
  return `${p.firstNames} ${p.lastNames}`;
}

export default function StudentsView() {
  const { data: students = [], isLoading } = useStudents({ view: "all" });
  const { searchTerm, setSearchTerm } = useStudentsStore();
  const filteredStudents = useFilteredStudents(students as IStudent[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const selectStudent = useStudentsStore((s) => s.selectStudent);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedData = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const columns = useMemo(() => [
    {
      header: "Estudiante",
      render: (student: IStudent) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {`${student.person.firstNames.charAt(0)}${student.person.lastNames.charAt(0)}`}
          </div>
          <div>
            <p className="font-medium text-gray-800">{student.person.firstNames} {student.person.lastNames}</p>
            <p className="text-xs text-gray-400">{student.person.identificationNumber}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Grado / Sección",
      render: (student: IStudent) => (
        <span className="text-gray-700">{getGradeAndSection(student)}</span>
      ),
    },
    {
      header: "Representante",
      render: (student: IStudent) => (
        <span className="text-gray-700">{getRepresentativeName(student)}</span>
      ),
    },
    {
      header: "Estatus",
      render: (student: IStudent) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          student.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {student.status ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ], []);

  const handleRowClick = (student: IStudent) => {
    selectStudent(student);
    setCurrentPage(1);
  };

  const studentListView = (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o cédula..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-(--blueColor) text-white border-(--blueColor)"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <LayoutList size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-(--blueColor) text-white border-(--blueColor)"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando estudiantes...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          {searchTerm ? "No se encontraron estudiantes" : "No hay estudiantes registrados"}
        </div>
      ) : viewMode === "table" ? (
        <>
          <TableComponent
            data={paginatedData as IStudent[]}
            columns={columns}
            onRowClick={handleRowClick}
          />
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(paginatedData as IStudent[]).map((student) => (
              <div
                key={student.id}
                onClick={() => handleRowClick(student)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-(--lightBlueColor)/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    {student.person.firstNames.charAt(0)}{student.person.lastNames.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{student.person.firstNames} {student.person.lastNames}</p>
                    <p className="text-xs text-gray-400">{student.person.identificationNumber}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-500">Grado:</span> {getGradeAndSection(student)}</p>
                  <p><span className="font-medium text-gray-500">Representante:</span> {getRepresentativeName(student)}</p>
                </div>
                {/* <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    student.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {student.status ? "Activo" : "Inactivo"}
                  </span>
                </div> */}
              </div>
            ))}
          </div>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}
    </div>
  );

  return studentListView;
}
