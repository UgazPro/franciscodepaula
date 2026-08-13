import { useMemo } from "react";
import { Users, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import type { SabanaSection } from "@/hooks/useGradeAdjustments";

interface SectionSummaryProps {
  section: SabanaSection;
}

export default function SectionSummary({ section }: SectionSummaryProps) {
  const summary = useMemo(() => {
    const nonSpecialSubjects = section.subjects.filter((s) => !s.isSpecialGroup);
    const nonSpecialIds = new Set(nonSpecialSubjects.map((s) => s.levelSubjectId));

    const subjectStats = nonSpecialSubjects.map((subj) => {
      const grades = section.students
        .map((s) => s.subjects.find((ss) => ss.levelSubjectId === subj.levelSubjectId))
        .filter((ss) => ss && ss.periodGrade !== null)
        .map((ss) => ss!.periodGrade!);

      const avg = grades.length > 0 ? Math.min(20, Math.round(grades.reduce((s, g) => s + g, 0) / grades.length)) : null;
      const failedCount = grades.filter((g) => g < 10).length;

      return {
        code: subj.subjectCode,
        name: subj.subjectName,
        average: avg,
        failedCount,
      };
    });

    const studentAverages = section.students.map((student) => {
      const grades = student.subjects.filter(
        (s) => nonSpecialIds.has(s.levelSubjectId) && s.periodGrade !== null
      );
      if (grades.length === 0) return null;
      return Math.min(20, Math.round(grades.reduce((sum, s) => sum + (s.periodGrade ?? 0), 0) / grades.length));
    }).filter((a): a is number => a !== null);

    const sectionAverage = studentAverages.length > 0
      ? Math.min(20, Math.round(studentAverages.reduce((s, a) => s + a, 0) / studentAverages.length))
      : null;

    const validSubjects = subjectStats.filter((s) => s.average !== null);
    const weakest = validSubjects.length > 0
      ? validSubjects.reduce((min, s) => (s.average! < min.average! ? s : min))
      : null;
    const strongest = validSubjects.length > 0
      ? validSubjects.reduce((max, s) => (s.average! > max.average! ? s : max))
      : null;

    return {
      subjectStats,
      sectionAverage,
      weakest,
      strongest,
      totalStudents: section.studentCount,
      maleCount: section.maleCount,
      femaleCount: section.femaleCount,
    };
  }, [section]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-4">
      <h3 className="font-semibold text-gray-800 mb-3">Resumen de la Sección</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Users size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-semibold text-gray-800">{summary.totalStudents}</p>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Hombres</p>
          <p className="font-semibold text-gray-800">{summary.maleCount}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Mujeres</p>
          <p className="font-semibold text-gray-800">{summary.femaleCount}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Prom. General</p>
          <p className={`font-semibold ${summary.sectionAverage !== null && summary.sectionAverage < 10 ? "text-red-600" : "text-gray-800"}`}>
            {summary.sectionAverage ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {summary.strongest && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <TrendingUp size={18} className="text-green-600" />
            <div>
              <p className="text-xs text-green-600">Materia mejor promediada</p>
              <p className="font-semibold text-gray-800">{summary.strongest.code} — {summary.strongest.average}</p>
            </div>
          </div>
        )}
        {summary.weakest && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <TrendingDown size={18} className="text-red-600" />
            <div>
              <p className="text-xs text-red-600">Materia más deficiente</p>
              <p className="font-semibold text-gray-800">{summary.weakest.code} — {summary.weakest.average}</p>
            </div>
          </div>
        )}
      </div>

      <h4 className="text-sm font-medium text-gray-700 mb-2">Reprobados por materia</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {summary.subjectStats.map((s) => (
          <div key={s.code} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
            <AlertTriangle size={14} className={s.failedCount > 0 ? "text-amber-500" : "text-gray-300"} />
            <div>
              <p className="text-xs font-medium text-gray-700">{s.code}</p>
              <p className={`text-xs ${s.failedCount > 0 ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                {s.failedCount} reprobado(s)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
