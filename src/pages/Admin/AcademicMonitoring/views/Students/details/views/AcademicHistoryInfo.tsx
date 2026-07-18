import { useState, useEffect, type Key } from "react";
import { History, School, BookOpen, AlertTriangle, ArrowLeft, GraduationCap, Plus, Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import type { AcademicHistoryEntry } from "@/hooks/useAcademicHistory";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { TableComponent, type Column } from "@/components/table/TableComponent";
import SchoolHistoryForm from "../components/SchoolHistoryForm";

interface AcademicHistoryInfoProps {
    academicHistory: any;
    showForm: boolean;
    isCreateDisabled: boolean;
    onCreateClick: () => void;
    onCloseForm: () => void;
    studentId: number;
    currentLevelOrder: number;
}

interface GradeRow {
    subject1: string;
    momento1_1: number | null;
    momento1_2: number | null;
    momento1_3: number | null;
    definitiva1: number | null;
    subject2: string | null;
    momento2_1: number | null;
    momento2_2: number | null;
    momento2_3: number | null;
    definitiva2: number | null;
}

function getGradeColor(grade: number | null): string {
    if (grade == null) return "text-gray-400";
    if (grade >= 10) return "text-green-600";
    if (grade >= 8) return "text-yellow-600";
    return "text-red-600";
}

function getGradeBg(grade: number | null): string {
    if (grade == null) return "";
    if (grade >= 10) return "bg-green-50";
    if (grade >= 8) return "bg-yellow-50";
    return "bg-red-50";
}

function getDisabledTooltip(nextLevelOrder: number, currentLevelOrder: number): string {
    if (currentLevelOrder <= 1) return "No se puede crear historial para un estudiante en 1er año";
    if (nextLevelOrder >= currentLevelOrder) return "Todos los años previos ya están cargados";
    return "";
}

function formatSchoolYear(schoolYear: number | null): string | null {
    if (schoolYear == null) return null;
    return `${schoolYear}-${schoolYear + 1}`;
}

export default function AcademicHistoryInfo({
    academicHistory,
    showForm,
    isCreateDisabled,
    onCreateClick,
    onCloseForm,
    studentId,
    currentLevelOrder,
}: AcademicHistoryInfoProps) {

    const [historyScreen, setHistoryScreen] = useState<"cards" | "detail">("cards");
    const [selectedEntry, setSelectedEntry] = useState<AcademicHistoryEntry | null>(null);
    const [editEntry, setEditEntry] = useState<AcademicHistoryEntry | null>(null);

    useEffect(() => {
        if (selectedEntry && academicHistory?.history) {
            const updated = academicHistory.history.find(
                (h: any) => h.level === selectedEntry.level && h.schoolYearId === selectedEntry.schoolYearId
            );
            if (updated) setSelectedEntry(updated);
        }
    }, [academicHistory]);

    const hasPeriodData = selectedEntry?.subjects.some((s) => s.periodAverages && s.periodAverages.length > 0);

    const handleYearClick = (entry: AcademicHistoryEntry) => {
        setSelectedEntry(entry);
        setHistoryScreen("detail");
    };

    const handleBack = () => {
        setHistoryScreen("cards");
        setSelectedEntry(null);
    };

    const handleEdit = () => {
        if (selectedEntry) {
            setEditEntry(selectedEntry);
        }
    };

    const handleCloseEdit = () => {
        setEditEntry(null);
    };

    const nextLevelOrder = (() => {
        if (!academicHistory?.history) return 1;
        const previousOrders = academicHistory.history
            .filter((h: any) => h.schoolYearId == null && h._levelOrder != null)
            .map((h: any) => h._levelOrder as number);
        if (previousOrders.length === 0) return 1;
        return Math.max(...previousOrders) + 1;
    })();

    const titleRow = (
        <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-(--blueColor)" />
            <h3 className="text-lg font-semibold text-(--blueColor)">
                Historial Académico
            </h3>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>
                            <Button
                                size="sm"
                                onClick={onCreateClick}
                                disabled={isCreateDisabled}
                                className="ml-2 bg-(--blueColor) hover:bg-(--darkBlueColor) text-white h-7 px-2 text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Crear historial
                            </Button>
                        </span>
                    </TooltipTrigger>
                    {isCreateDisabled && (
                        <TooltipContent>
                            <p>{getDisabledTooltip(nextLevelOrder, currentLevelOrder)}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </div>
    );

    // Empty state: no history at all
    if (!academicHistory || academicHistory.history.length === 0) {
        const emptyView = (
            <Card className="border order-(--lightBlueColor) shadow-sm">
                <CardContent className="px-6 py-1">
                    <div className="mb-5">
                        {titleRow}
                    </div>
                    <div className="text-center py-12">
                        <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                            El estudiante no tiene aún un historial académico cargado
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            El historial se mostrará al finalizar el año escolar
                        </p>
                    </div>
                </CardContent>
            </Card>
        );

        return (
            <PageTransitionComponent
                primaryChildren={emptyView}
                secondaryChildren={
                    <SchoolHistoryForm
                        studentId={studentId}
                        currentLevelOrder={currentLevelOrder}
                        history={academicHistory?.history || []}
                        onClose={onCloseForm}
                    />
                }
                toggle={showForm}
            />
        );
    }

    // Build grade table data from selected entry
    const buildGradeRows = (entry: AcademicHistoryEntry): GradeRow[] => {
        const rows: GradeRow[] = [];
        const subjects = entry.subjects;
        for (let i = 0; i < subjects.length; i += 2) {
            const s1 = subjects[i];
            const s2 = subjects[i + 1] ?? null;

            const getPeriodAvg = (sub: typeof s1, periodName: string): number | null => {
                const found = (sub.periodAverages || []).find((p: any) => p.period === periodName);
                return found?.average ?? null;
            };

            const periodNames1 = (s1.periodAverages || []).map((p: any) => p.period);
            const periodNames2 = s2 ? (s2.periodAverages || []).map((p: any) => p.period) : [];
            const allPeriodNames = [...new Set([...periodNames1, ...periodNames2])];

            rows.push({
                subject1: s1.subjectName,
                momento1_1: allPeriodNames.length > 0 ? getPeriodAvg(s1, allPeriodNames[0]) : null,
                momento1_2: allPeriodNames.length > 1 ? getPeriodAvg(s1, allPeriodNames[1]) : null,
                momento1_3: allPeriodNames.length > 2 ? getPeriodAvg(s1, allPeriodNames[2]) : null,
                definitiva1: s1.definitiva,
                subject2: s2?.subjectName ?? null,
                momento2_1: s2 && allPeriodNames.length > 0 ? getPeriodAvg(s2, allPeriodNames[0]) : null,
                momento2_2: s2 && allPeriodNames.length > 1 ? getPeriodAvg(s2, allPeriodNames[1]) : null,
                momento2_3: s2 && allPeriodNames.length > 2 ? getPeriodAvg(s2, allPeriodNames[2]) : null,
                definitiva2: s2?.definitiva ?? null,
            });
        }
        return rows;
    };

    const buildSubject1Columns = (): Column<GradeRow>[] => [
        {
            header: "Materia",
            accessor: "subject1",
            className: "font-medium text-gray-800",
        },
        ...(hasPeriodData
            ? [
                {
                    header: "Mom. I",
                    render: (row: GradeRow) => (
                        <span className={`font-medium ${getGradeColor(row.momento1_1)}`}>
                            {row.momento1_1 != null ? row.momento1_1.toFixed(1) : "—"}
                        </span>
                    ),
                },
                {
                    header: "Mom. II",
                    render: (row: GradeRow) => (
                        <span className={`font-medium ${getGradeColor(row.momento1_2)}`}>
                            {row.momento1_2 != null ? row.momento1_2.toFixed(1) : "—"}
                        </span>
                    ),
                },
                {
                    header: "Mom. III",
                    render: (row: GradeRow) => (
                        <span className={`font-medium ${getGradeColor(row.momento1_3)}`}>
                            {row.momento1_3 != null ? row.momento1_3.toFixed(1) : "—"}
                        </span>
                    ),
                },
              ]
            : []),
        {
            header: "Def.",
            render: (row: GradeRow) => (
                <span className={`font-bold ${getGradeColor(row.definitiva1)}`}>
                    {row.definitiva1 != null ? row.definitiva1.toFixed(1) : "—"}
                </span>
            ),
            className: "text-center",
        },
    ];

    const buildSubject2Columns = (): Column<GradeRow>[] => [
        {
            header: "Materia",
            render: (row: GradeRow) => (
                <span className={row.subject2 ? "font-medium text-gray-800" : "text-gray-300"}>
                    {row.subject2 ?? "—"}
                </span>
            ),
        },
        ...(hasPeriodData
            ? [
                {
                    header: "Mom. I",
                    render: (row: GradeRow) => (
                        <span className={`font-medium ${getGradeColor(row.momento2_1)}`}>
                            {row.subject2 ? (row.momento2_1 != null ? row.momento2_1.toFixed(1) : "—") : ""}
                        </span>
                    ),
                },
                {
                    header: "Mom. II",
                    render: (row: GradeRow) => (
                        <span className={`font-medium ${getGradeColor(row.momento2_2)}`}>
                            {row.subject2 ? (row.momento2_2 != null ? row.momento2_2.toFixed(1) : "—") : ""}
                        </span>
                    ),
                },
                {
                    header: "Mom. III",
                    render: (row: GradeRow) => (
                        <span className={`font-medium ${getGradeColor(row.momento2_3)}`}>
                            {row.subject2 ? (row.momento2_3 != null ? row.momento2_3.toFixed(1) : "—") : ""}
                        </span>
                    ),
                },
              ]
            : []),
        {
            header: "Def.",
            render: (row: GradeRow) => (
                <span className={`font-bold ${getGradeColor(row.definitiva2)}`}>
                    {row.subject2 ? (row.definitiva2 != null ? row.definitiva2.toFixed(1) : "—") : ""}
                </span>
            ),
            className: "text-center",
        },
    ];

    const gradeColumns: Column<GradeRow>[] = [...buildSubject1Columns(), ...buildSubject2Columns()];

    const gradeRows = selectedEntry ? buildGradeRows(selectedEntry) : [];
    const overallAvg = selectedEntry?.averageGrade;
    const isPreviousSchool = selectedEntry?.schoolYearId == null && selectedEntry?.records;

    // Cards view
    const cardsView = (
        <Card className="border order-(--lightBlueColor) shadow-sm">
            <CardContent className="px-6 py-1">
                <div className="mb-5">
                    {titleRow}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {academicHistory.history.map((entry: AcademicHistoryEntry, idx: Key | null | undefined) => {
                        const entrySchoolYear = entry.schoolYearId != null
                            ? entry.schoolYearName
                            : formatSchoolYear(entry.schoolYear);
                        return (
                            <Card
                                key={idx}
                                className={`border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                                    entry.schoolYearId != null
                                        ? "border-(--blueColor)/50 bg-(--blueColor)/5"
                                        : "order-(--lightBlueColor) hover:border-(--blueColor)/20"
                                }`}
                                onClick={() => handleYearClick(entry)}
                            >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {entry.level || "Sin nivel"}
                                            </p>
                                            {entrySchoolYear && (
                                                <p className="text-sm text-gray-600">
                                                    {entrySchoolYear}
                                                </p>
                                            )}
                                        </div>
                                        {entry.schoolYearId != null ? (
                                            <Badge className="bg-(--blueColor)/10 text-(--blueColor) border-(--blueColor)/30 text-[10px] px-1.5 py-0.5 shrink-0">
                                                Actual
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-500 border-gray-300 text-[10px] px-1.5 py-0.5 shrink-0">
                                                Cursado
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <School className="h-3.5 w-3.5 text-gray-400" />
                                        <p className="text-xs text-gray-500 truncate">
                                            {entry.schoolName}
                                        </p>
                                    </div>

                                    {entry.averageGrade != null && (
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                                            <p className="text-sm">
                                                <span className="text-gray-500">Promedio: </span>
                                                <span className={`font-bold ${getGradeColor(entry.averageGrade)}`}>
                                                    {entry.averageGrade.toFixed(1)}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    {entry.totalSubjects != null && (
                                        <p className="text-xs text-gray-500">
                                            {entry.totalSubjects} materia{entry.totalSubjects !== 1 ? "s" : ""}
                                            {entry.totalGrades != null && entry.totalGrades > 0 && ` · ${entry.totalGrades} evaluacione${entry.totalGrades !== 1 ? "s" : ""}`}
                                        </p>
                                    )}

                                    {entry.failedSubjects.length > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                            <span className="text-red-600 text-[10px] font-medium px-1.5 py-0.5 border border-red-200 rounded">
                                                {entry.failedSubjects.length} reprobada{entry.failedSubjects.length > 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );

    // Detail view (table)
    const detailView = selectedEntry ? (
        <Card className="border order-(--lightBlueColor) shadow-sm">
            <CardContent className="px-6 py-1">
                {/* Header with back button */}
                <div className="flex items-center gap-3 mb-5 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="h-8 w-8 shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4 text-(--blueColor)" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-(--blueColor) truncate">
                            {selectedEntry.level}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                            {isPreviousSchool
                                ? <>Año Escolar: {formatSchoolYear(selectedEntry.schoolYear) || "No especificado"} · {selectedEntry.schoolName}</>
                                : <>{selectedEntry.schoolYearName || "Año escolar"} · {selectedEntry.schoolName}</>
                            }
                        </p>
                    </div>
                    {isPreviousSchool && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="order-(--lightBlueColor) text-(--blueColor) shrink-0"
                        >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Editar
                        </Button>
                    )}
                </div>

                {/* Grade table */}
                {gradeRows.length > 0 ? (
                    <div className="space-y-4">
                        <TableComponent
                            data={gradeRows}
                            columns={gradeColumns}
                            maxHeight={300}
                        />

                        {/* Overall average */}
                        {overallAvg != null && (
                            <div className={`flex items-center justify-between p-4 rounded-lg ${getGradeBg(overallAvg)} border ${overallAvg >= 10 ? "border-green-200" : overallAvg >= 8 ? "border-yellow-200" : "border-red-200"}`}>
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-(--blueColor)" />
                                    <span className="font-semibold text-gray-800">Promedio General del Año</span>
                                </div>
                                <span className={`text-xl font-bold ${getGradeColor(overallAvg)}`}>
                                    {overallAvg.toFixed(1)} / 20
                                </span>
                            </div>
                        )}

                        {/* Failed subjects */}
                        {selectedEntry.failedSubjects.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    <p className="text-sm font-semibold text-red-600">Materias Reprobadas</p>
                                </div>
                                {selectedEntry.failedSubjects.map((fs, fsIdx) => (
                                    <div key={fsIdx} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-800">{fs.subjectName}</p>
                                            {fs.finalAverage != null && (
                                                <span className="text-sm font-bold text-red-600">
                                                    {fs.finalAverage.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                        {fs.observations && (
                                            <p className="text-xs text-gray-500 mt-1">{fs.observations}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <School className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                            Sin calificaciones registradas para este año
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    ) : null;

    if (editEntry) {
        return (
            <SchoolHistoryForm
                studentId={studentId}
                currentLevelOrder={currentLevelOrder}
                history={academicHistory?.history || []}
                onClose={handleCloseEdit}
                editEntry={editEntry}
            />
        );
    }

    if (showForm) {
        return (
            <SchoolHistoryForm
                studentId={studentId}
                currentLevelOrder={currentLevelOrder}
                history={academicHistory?.history || []}
                onClose={onCloseForm}
            />
        );
    }

    return (
        <PageTransitionComponent
            primaryChildren={cardsView}
            secondaryChildren={detailView}
            toggle={historyScreen === "detail"}
        />
    );

}
