import { useMemo, useState, useCallback } from "react";
import { ArrowLeft, User, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { ToastMessage } from "@/components/toast/ToastMessage";
import type { SabanaSection, SabanaStudent } from "@/hooks/useGradeAdjustments";
import type { MomentType } from "@/hooks/useNewsletters";
import { generateNewsletterPdf } from "@/utils/newsletterPdf";

interface StudentDetailProps {
  student: SabanaStudent;
  section: SabanaSection;
  moment: MomentType;
  onBack: () => void;
}

export default function StudentDetail({ student, section, moment, onBack }: StudentDetailProps) {
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const data = useMemo(() => {
    const nonSpecialIds = new Set(
      section.subjects.filter((s) => !s.isSpecialGroup).map((s) => s.levelSubjectId)
    );

    const subjectGrades = student.subjects.map((s) => {
      const subj = section.subjects.find((ss) => ss.levelSubjectId === s.levelSubjectId);
      return {
        code: subj?.subjectCode ?? "—",
        name: subj?.subjectName ?? "—",
        grade: s.periodGrade !== null ? Math.min(20, s.periodGrade) : null,
        isSpecial: subj?.isSpecialGroup ?? false,
      };
    });

    const nonSpecialGrades = subjectGrades.filter((s) => !s.isSpecial && s.grade !== null);
    const studentAverage = nonSpecialGrades.length > 0
      ? Math.min(20, Math.round(nonSpecialGrades.reduce((sum, s) => sum + (s.grade ?? 0), 0) / nonSpecialGrades.length))
      : null;

    const sectionNonSpecial = section.students
      .map((st) => {
        const grades = st.subjects.filter(
          (s) => nonSpecialIds.has(s.levelSubjectId) && s.periodGrade !== null
        );
        if (grades.length === 0) return null;
        return Math.min(20, Math.round(grades.reduce((sum, s) => sum + (Math.min(20, s.periodGrade ?? 0)), 0) / grades.length));
      })
      .filter((a): a is number => a !== null);

    const sectionAverage = sectionNonSpecial.length > 0
      ? Math.min(20, Math.round(sectionNonSpecial.reduce((s, a) => s + a, 0) / sectionNonSpecial.length))
      : null;

    const studentRank = sectionNonSpecial.filter((a) => a > (studentAverage ?? 0)).length + 1;

    return { subjectGrades, studentAverage, sectionAverage, studentRank };
  }, [student, section]);

  const handleDownloadPdf = useCallback(async () => {
    setIsPdfLoading(true);
    try {
      await generateNewsletterPdf(student, section, moment);
      toast.custom(
        (t) => (
          <ToastMessage
            success={true}
            message="PDF descargado correctamente"
            visible={t.visible}
          />
        ),
        { duration: 3000 },
      );
    } catch {
      toast.custom(
        (t) => (
          <ToastMessage
            success={false}
            message="Error al generar el PDF"
            visible={t.visible}
          />
        ),
        { duration: 3000 },
      );
    } finally {
      setIsPdfLoading(false);
    }
  }, [student, section, moment]);

  const momentLabel = `Momento ${moment}`;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft size={20} className="text-(--blueColor)" />
            </button>
            <div className="p-3 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{student.studentName}</h1>
              <p className="text-sm text-gray-500">
                {student.identification} — {section.label} — {momentLabel}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={isPdfLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-(--blueColor) hover:bg-blue-700 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            {isPdfLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Descargar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase">Promedio General</p>
          <p className={`text-2xl font-bold ${data.studentAverage !== null && data.studentAverage < 10 ? "text-red-600" : "text-gray-800"}`}>
            {data.studentAverage ?? "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase">Prom. de Sección</p>
          <p className={`text-2xl font-bold ${data.sectionAverage !== null && data.sectionAverage < 10 ? "text-red-600" : "text-gray-800"}`}>
            {data.sectionAverage ?? "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase">Posición</p>
          <p className="text-2xl font-bold text-gray-800">
            {data.studentRank}° / {section.studentCount}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase">Estado</p>
          <p className={`text-2xl font-bold ${data.studentAverage !== null && data.studentAverage >= 10 ? "text-green-600" : "text-red-600"}`}>
            {data.studentAverage !== null ? (data.studentAverage >= 10 ? "Aprobado" : "Reprobado") : "—"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Materia</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Calificación</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.subjectGrades.map((s) => (
              <tr key={s.code} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-800">{s.code}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{s.name}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`text-sm font-semibold ${s.grade !== null && s.grade < 10 ? "text-red-600" : "text-gray-800"}`}>
                    {s.grade ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.grade === null
                      ? "bg-gray-100 text-gray-500"
                      : s.grade >= 10
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                  }`}>
                    {s.grade === null ? "Sin nota" : s.grade >= 10 ? "Aprobado" : "Reprobado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
