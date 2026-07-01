import { useState, useMemo, useCallback } from "react";
import { BookOpen, ArrowLeft, Loader2, UserCheck, UserX, GraduationCap, Users } from "lucide-react";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { TableComponent } from "@/components/table/TableComponent";
import { StatCard } from "@/components/statCard/StatCard";
import { buildSectionColumns } from "@/services/teacher-assignment/teacher-assignment.tables";
import type { LevelData, TeacherAssignmentsViewProps } from "@/services/teacher-assignment/teacher-assignment.types";
import type { IStaff } from "@/services/users/user.interface";
import { useTeacherAssignmentOverview, useTeachers } from "@/hooks/useTeacherAssignments";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useCreateTeacherAssignment, useUpdateTeacherAssignment } from "@/queries/useTeacherAssignmentMutations";

export default function TeacherAssignmentsView({ tabsComponent }: TeacherAssignmentsViewProps) {

  const { data: overviewData = [], isLoading } = useTeacherAssignmentOverview();
  const { data: teachers = [] } = useTeachers();
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const { mutateAsync: createAssignment } = useCreateTeacherAssignment();
  const { mutateAsync: updateAssignment } = useUpdateTeacherAssignment();

  const [screen, setScreen] = useState<"list" | "detail">("list");
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [assigningSubject, setAssigningSubject] = useState<{ sectionId: number; levelSubjectId: number } | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const teacherOptions = useMemo(() => {
    return (teachers as IStaff[]).map((t: IStaff) => ({
      id: t.employee!.id,
      name: `${t.person.firstNames} ${t.person.lastNames}`,
      idNumber: t.person.identificationNumber,
    }));
  }, [teachers]);

  const levels = Array.isArray(overviewData) ? (overviewData as LevelData[]) : [];

  const selectLevel = (level: LevelData) => {
    setSelectedLevel(level);
    setAssigningSubject(null);
    setScreen("detail");
  };

  const handleBack = () => {
    setSelectedLevel(null);
    setAssigningSubject(null);
    setScreen("list");
  };

  const handleTeacherChange = useCallback(async (sectionId: number, levelSubjectId: number, newTeacherId: number) => {
    const key = `${sectionId}-${levelSubjectId}`;
    setProcessingIds((prev) => new Set(prev).add(key));

    try {
      if (!selectedLevel) return;
      const section = selectedLevel.sections.find((s) => s.sectionId === sectionId);
      if (!section) return;
      const subject = section.subjects.find((s) => s.levelSubjectId === levelSubjectId);
      const existingAssignment = subject?.assignment;

      if (existingAssignment) {
        await updateAssignment({
          id: existingAssignment.id,
          data: { teacherId: newTeacherId },
        });
      } else {
        await createAssignment({
          teacherId: newTeacherId,
          levelSubjectId,
          sectionId,
        });
      }
    } catch {
      // interceptor handles the toast
    }

    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setAssigningSubject(null);
  }, [selectedLevel, createAssignment, updateAssignment]);

  const summaryList = (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-teal-900 to-teal-800 rounded-xl">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Asignación Docente</h1>
            <p className="text-sm text-gray-500">
              {activeSchoolYear
                ? `Año Escolar: ${activeSchoolYear.name} — ${levels.length} nivel(es)`
                : "Cargando año escolar..."
              }
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando niveles...
        </div>
      ) : levels.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          No hay niveles configurados para el año escolar activo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {levels.map((level) => (
            <button
              key={level.highSchoolLevelId}
              onClick={() => selectLevel(level)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-left hover:shadow-md hover:border-(--blueColor)/30 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-(--blueColor) transition">
                  {level.level}
                </h3>
                <div className="p-2 bg-(--blueColor)/10 rounded-lg group-hover:bg-(--blueColor)/20 transition">
                  <GraduationCap size={20} className="text-(--blueColor)" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <StatCard label="Total" value={level.totalStudents} icon={<Users size={16} />} color="text-blue-600" bgColor="bg-blue-50" />
                <StatCard label="Masculinos" value={level.maleStudents} icon={<UserCheck size={16} />} color="text-sky-600" bgColor="bg-sky-50" />
                <StatCard label="Femeninos" value={level.femaleStudents} icon={<UserX size={16} />} color="text-pink-600" bgColor="bg-pink-50" />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-400">
                  {level.sections.length} sección(es)
                </span>
                <span className="text-xs text-(--blueColor) font-medium opacity-0 group-hover:opacity-100 transition">
                  Ver detalle →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const detailView = selectedLevel ? (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={20} className="text-(--blueColor)" />
          </button>
          <div className="p-3 bg-linear-to-br from-teal-900 to-teal-800 rounded-xl">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{selectedLevel.level}</h1>
            <p className="text-sm text-gray-500">
              {selectedLevel.sections.length} sección(es)
            </p>
          </div>
        </div>
      </div>

      {selectedLevel.sections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
          Este nivel no tiene secciones configuradas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedLevel.sections.map((section) => (
            <div key={section.sectionId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Sección {section.section}</h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Total: {section.totalStudents}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                    M: {section.maleStudents}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                    F: {section.femaleStudents}
                  </span>
                </div>
              </div>

              {section.subjects.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  No hay materias asignadas a este nivel.
                </div>
              ) : (
                <TableComponent
                  data={section.subjects}
                  columns={buildSectionColumns(
                    section.sectionId,
                    processingIds,
                    assigningSubject,
                    teacherOptions,
                    handleTeacherChange,
                    setAssigningSubject,
                  )}
                  maxHeight={450}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  ) : null;

  return (
    <PageTransitionComponent
      primaryChildren={
        <>
          {tabsComponent}
          {summaryList}
        </>
      }
      secondaryChildren={detailView}
      toggle={screen === "detail"}
    />
  );
}
