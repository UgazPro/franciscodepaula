import { useState, type Key } from "react";
import { History, School, BookOpen, AlertTriangle, ArrowLeft, GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { AcademicHistoryEntry } from "@/hooks/useAcademicHistory";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import { TableComponent, type Column } from "@/components/table/TableComponent";

interface AcademicHistoryInfoProps {
    academicHistory: any;
}

interface GradeRow {
    subjectName: string;
    momento1: number | null;
    momento2: number | null;
    momento3: number | null;
    definitiva: number | null;
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

export default function AcademicHistoryInfo({ academicHistory }: AcademicHistoryInfoProps) {

    const [historyScreen, setHistoryScreen] = useState<"cards" | "detail">("cards");
    const [selectedEntry, setSelectedEntry] = useState<AcademicHistoryEntry | null>(null);

    const hasPeriodData = selectedEntry?.subjects.some((s) => s.periodAverages && s.periodAverages.length > 0);

    const handleYearClick = (entry: AcademicHistoryEntry) => {
        setSelectedEntry(entry);
        setHistoryScreen("detail");
    };

    const handleBack = () => {
        setHistoryScreen("cards");
        setSelectedEntry(null);
    };

    // Empty state: no history at all
    if (!academicHistory || academicHistory.history.length === 0) {
        return (
            <Card className="border order-(--lightBlueColor) shadow-sm">
                <CardContent className="px-6 py-1">
                    <div className="flex items-center gap-2 mb-5">
                        <History className="h-5 w-5 text-(--blueColor)" />
                        <h3 className="text-lg font-semibold text-(--blueColor)">
                            Historial Académico
                        </h3>
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
    }

    // Build grade table data from selected entry
    const buildGradeRows = (entry: AcademicHistoryEntry): GradeRow[] => {
        return entry.subjects.map((subject) => {
            const periodAvgs = subject.periodAverages || [];
            const getPeriodAvg = (periodName: string): number | null => {
                const found = periodAvgs.find((p) => p.period === periodName);
                return found?.average ?? null;
            };

            const periodNames = periodAvgs.map((p) => p.period);
            const momento1 = periodNames.length > 0 ? getPeriodAvg(periodNames[0]) : null;
            const momento2 = periodNames.length > 1 ? getPeriodAvg(periodNames[1]) : null;
            const momento3 = periodNames.length > 2 ? getPeriodAvg(periodNames[2]) : null;

            return {
                subjectName: subject.subjectName,
                momento1,
                momento2,
                momento3,
                definitiva: subject.definitiva,
            };
        });
    };

    const gradeColumns: Column<GradeRow>[] = [
        {
            header: "Materia",
            accessor: "subjectName",
            className: "font-medium text-gray-800",
        },
        ...(hasPeriodData
            ? [
                {
                    header: "Momento I",
                    render: (row: GradeRow) => (
                        <span className={`font-medium ${getGradeColor(row.momento1)}`}>
                            {row.momento1 != null ? row.momento1.toFixed(1) : "—"}
                        </span>
                    ),
                },
                {
                    header: "Momento II",
                    render: (row: GradeRow) => (
                        <span className={`font-medium ${getGradeColor(row.momento2)}`}>
                            {row.momento2 != null ? row.momento2.toFixed(1) : "—"}
                        </span>
                    ),
                },
                {
                    header: "Momento III",
                    render: (row: GradeRow) => (
                        <span className={`font-medium ${getGradeColor(row.momento3)}`}>
                            {row.momento3 != null ? row.momento3.toFixed(1) : "—"}
                        </span>
                    ),
                },
              ]
            : []),
        {
            header: "Definitiva",
            render: (row: GradeRow) => (
                <span className={`font-bold ${getGradeColor(row.definitiva)}`}>
                    {row.definitiva != null ? row.definitiva.toFixed(1) : "—"}
                </span>
            ),
            headerClassName: "text-right",
            className: "text-right",
        },
    ];

    const gradeRows = selectedEntry ? buildGradeRows(selectedEntry) : [];
    const overallAvg = selectedEntry?.averageGrade;

    // Cards view
    const cardsView = (
        <Card className="border order-(--lightBlueColor) shadow-sm">
            <CardContent className="px-6 py-1">
                <div className="flex items-center gap-2 mb-5">
                    <History className="h-5 w-5 text-(--blueColor)" />
                    <h3 className="text-lg font-semibold text-(--blueColor)">
                        Historial Académico
                    </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {academicHistory.history.map((entry: AcademicHistoryEntry, idx: Key | null | undefined) => (
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
                                            {entry.schoolYearName || entry.level || "Sin año escolar"}
                                        </p>
                                        {entry.schoolYearName && entry.level && (
                                            <p className="text-sm text-gray-600">
                                                {entry.level}{entry.section ? ` - ${entry.section}` : ""}
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
                    ))}
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
                            {selectedEntry.level}{selectedEntry.section ? ` - ${selectedEntry.section}` : ""}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                            {selectedEntry.schoolYearName || "Año escolar"} · {selectedEntry.schoolName}
                        </p>
                    </div>
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

    return (
        <PageTransitionComponent
            primaryChildren={cardsView}
            secondaryChildren={detailView}
            toggle={historyScreen === "detail"}
        />
    );

}
