import { useState, useMemo, useCallback } from "react";
import { Loader2, BookOpen, ArrowLeft, Download } from "lucide-react";
import toast from "react-hot-toast";
import { ToastMessage } from "@/components/toast/ToastMessage";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useBoletinData, type MomentType } from "@/hooks/useNewsletters";
import type { SabanaSection, SabanaStudent } from "@/hooks/useGradeAdjustments";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { TableComponent, type Column } from "@/components/table/TableComponent";
import MomentModal from "./components/MomentModal";
import SectionSummary from "./components/SectionSummary";
import StudentDetail from "./components/StudentDetail";
import { generateSectionPdf } from "@/utils/newsletterPdf";

interface NewslettersProps {
  tabsComponent?: React.ReactNode;
}

interface StudentRow {
  n: number;
  studentId: number;
  studentName: string;
  identification: string;
  subjects: { levelSubjectId: number; grade: number | null }[];
  average: number | null;
}

export default function Newsletters({ tabsComponent }: NewslettersProps) {
  const [selectedMoment, setSelectedMoment] = useState<MomentType | null>(null);
  const [showMomentModal, setShowMomentModal] = useState(true);
  const [selectedSection, setSelectedSection] = useState<SabanaSection | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<SabanaStudent | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [isSectionPdfLoading, setIsSectionPdfLoading] = useState(false);

  const { data: periodsData } = useActiveSchoolYear();
  const periods = useMemo(() => {
    const data = periodsData as { periods?: { id: number; period: string }[] } | undefined;
    return data?.periods ?? [];
  }, [periodsData]);

  const periodId = useMemo(() => {
    if (!selectedMoment) return null;
    const idx = selectedMoment === "I" ? 0 : selectedMoment === "II" ? 1 : 2;
    return periods[idx]?.id ?? null;
  }, [selectedMoment, periods]);

  const { data: periodData, isLoading } = useBoletinData(periodId, !!periodId);

  const sections = useMemo(() => {
    const response = periodData as { data?: { sections?: SabanaSection[] } } | undefined;
    return response?.data?.sections ?? [];
  }, [periodData]);

  const handleSelectMoment = useCallback((moment: MomentType) => {
    setSelectedMoment(moment);
    setShowMomentModal(false);
  }, []);

  const handleSelectSection = useCallback((section: SabanaSection) => {
    setSelectedSection(section);
  }, []);

  const handleBackToGrid = useCallback(() => {
    setSelectedSection(null);
  }, []);

  const handleStudentClick = useCallback((row: StudentRow) => {
    if (!selectedSection) return;
    const student = selectedSection.students.find((s) => s.studentId === row.studentId);
    if (student) {
      setSelectedStudent(student);
      setShowStudentDetail(true);
    }
  }, [selectedSection]);

  const handleBackToSection = useCallback(() => {
    setShowStudentDetail(false);
    setSelectedStudent(null);
  }, []);

  const handleDownloadSectionPdf = useCallback(async () => {
    if (!selectedSection || !selectedMoment) return;
    setIsSectionPdfLoading(true);
    try {
      await generateSectionPdf(selectedSection, selectedMoment);
      toast.custom(
        (t) => (
          <ToastMessage
            success={true}
            message="PDF de sección descargado correctamente"
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
            message="Error al generar el PDF de sección"
            visible={t.visible}
          />
        ),
        { duration: 3000 },
      );
    } finally {
      setIsSectionPdfLoading(false);
    }
  }, [selectedSection, selectedMoment]);

  const momentLabel = `Momento ${selectedMoment}`;

  const tableRows = useMemo((): StudentRow[] => {
    if (!selectedSection) return [];
    return selectedSection.students.map((s, i) => {
      const grades = selectedSection.subjects
        .filter((subj) => !subj.isSpecialGroup)
        .map((subj) => {
          const ss = s.subjects.find((x) => x.levelSubjectId === subj.levelSubjectId);
          const raw = ss?.periodGrade ?? null;
          return { levelSubjectId: subj.levelSubjectId, grade: raw !== null ? Math.min(20, raw) : null };
        });
      const validGrades = grades.filter((g) => g.grade !== null);
      const avg = validGrades.length > 0
        ? Math.min(20, Math.round(validGrades.reduce((sum, g) => sum + (g.grade ?? 0), 0) / validGrades.length))
        : null;
      return {
        n: i + 1,
        studentId: s.studentId,
        studentName: s.studentName,
        identification: s.identification,
        subjects: grades,
        average: avg,
      };
    });
  }, [selectedSection]);

  const columns = useMemo((): Column<StudentRow>[] => {
    if (!selectedSection) return [];
    const nonSpecialSubjects = selectedSection.subjects.filter((s) => !s.isSpecialGroup);

    const baseCols: Column<StudentRow>[] = [
      { header: "N°", accessor: "n", className: "w-12 text-center", headerClassName: "text-center" },
      { header: "Estudiante", accessor: "studentName" },
    ];

    const subjectCols: Column<StudentRow>[] = nonSpecialSubjects.map((subj) => ({
      header: subj.subjectCode,
      render: (row: StudentRow) => {
        const sg = row.subjects.find((s) => s.levelSubjectId === subj.levelSubjectId);
        const grade = sg?.grade;
        if (grade === null || grade === undefined) {
          return <span className="text-sm text-gray-300">—</span>;
        }
        const clamped = Math.min(20, grade);
        return (
          <span className={`text-sm font-semibold ${clamped < 10 ? "text-red-600" : "text-gray-800"}`}>
            {clamped}
          </span>
        );
      },
      className: "text-center",
      headerClassName: "text-center",
    }));

    const avgCol: Column<StudentRow> = {
      header: "Promedio",
      render: (row: StudentRow) => {
        if (row.average === null) return <span className="text-sm text-gray-400">—</span>;
        const clamped = Math.min(20, row.average);
        return (
          <span className={`text-sm font-semibold ${clamped < 10 ? "text-red-600" : "text-gray-800"}`}>
            {clamped}
          </span>
        );
      },
      className: "text-center",
      headerClassName: "text-center font-semibold",
    };

    return [...baseCols, ...subjectCols, avgCol];
  }, [selectedSection]);

  return (
    <PageTransitionComponent
      primaryChildren={
        <>
          {tabsComponent}

          <MomentModal open={showMomentModal} onSelect={handleSelectMoment} />

          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Boletines</h2>
                <p className="text-sm text-gray-500">
                  {momentLabel} — {sections.length} sección(es)
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMomentModal(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
            >
              Cambiar Momento
            </button>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando secciones...
            </div>
          ) : sections.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
              No hay secciones disponibles para este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sections.map((section) => (
                <div
                  key={section.sectionId}
                  onClick={() => handleSelectSection(section)}
                  className="flex flex-col gap-3 bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-(--blueColor) cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100">
                      <span className="text-lg font-bold text-indigo-600">
                        {section.level.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{section.label}</h3>
                      <p className="text-sm text-gray-500">{section.studentCount} estudiante(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <span>M {section.maleCount} / F {section.femaleCount}</span>
                    <span>
                      Prom:{" "}
                      <span className={`font-semibold ${section.sectionAverage != null && section.sectionAverage < 10 ? "text-red-600" : "text-gray-700"}`}>
                        {section.sectionAverage ?? "—"}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      }
      secondaryChildren={
        <PageTransitionComponent
          primaryChildren={
            selectedSection ? (
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleBackToGrid}
                        className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                      >
                        <ArrowLeft size={20} className="text-(--blueColor)" />
                      </button>
                      <div className="p-3 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl">
                        <BookOpen size={24} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-800">{selectedSection.label}</h1>
                        <p className="text-sm text-gray-500">
                          {selectedSection.studentCount} estudiante(s) — {momentLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadSectionPdf}
                      disabled={isSectionPdfLoading}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-(--blueColor) hover:bg-blue-700 rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {isSectionPdfLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      Descargar PDF
                    </button>
                  </div>
                </div>

                <TableComponent
                  data={tableRows}
                  columns={columns}
                  onRowClick={handleStudentClick}
                  maxHeight={500}
                />

                <SectionSummary section={selectedSection} />
              </div>
            ) : null
          }
          secondaryChildren={
            selectedStudent && selectedSection ? (
              <StudentDetail
                student={selectedStudent}
                section={selectedSection}
                moment={selectedMoment!}
                onBack={handleBackToSection}
              />
            ) : null
          }
          toggle={!!selectedStudent && showStudentDetail}
        />
      }
      toggle={!!selectedSection}
    />
  );
}
