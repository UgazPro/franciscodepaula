import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { useSchools } from "@/hooks/useSchools";
import { useLevelSubjects } from "@/hooks/useLevelSubjects";
import { useCreateSchoolHistoryBatch, useUpdateSchoolHistoryBatch } from "@/queries/useAcademicHistoryMutations";
import type { SchoolHistoryRecord } from "@/queries/useAcademicHistoryMutations";
import type { AcademicHistoryEntry } from "@/hooks/useAcademicHistory";
import { Save, X, ArrowLeft } from "lucide-react";

const SPECIAL_SUBJECT_CODES = ["ROB", "MUS", "MET"];

const YEAR_OPTIONS = [
    { label: "2020-2021", value: 2020 },
    { label: "2021-2022", value: 2021 },
    { label: "2022-2023", value: 2022 },
    { label: "2023-2024", value: 2023 },
    { label: "2024-2025", value: 2024 },
    { label: "2025-2026", value: 2025 },
];

const schema = z.object({
    schoolId: z.number({ error: "Seleccione una escuela" }).min(1, "Seleccione una escuela"),
    schoolYear: z.number({ error: "Seleccione el año escolar" }).min(1, "Seleccione el año escolar"),
    scores: z.record(z.string(), z.number().min(0, "La nota no puede ser negativa").max(20, "La nota máxima es 20").nullable().optional()),
});

type FormValues = z.infer<typeof schema>;

interface SchoolHistoryFormProps {
    studentId: number;
    currentLevelOrder: number;
    history: AcademicHistoryEntry[];
    onClose: () => void;
    editEntry?: AcademicHistoryEntry | null;
}

function getLevelOrder(level: string | null): number {
    if (!level) return 99;
    const match = level.match(/(\d)/);
    return match ? parseInt(match[1]) : 99;
}

function getLevelName(levelOrder: number): string {
    const names: Record<number, string> = {
        1: "1er Año",
        2: "2do Año",
        3: "3er Año",
        4: "4to Año",
        5: "5to Año",
    };
    return names[levelOrder] || `${levelOrder}to Año`;
}

export default function SchoolHistoryForm({
    studentId,
    currentLevelOrder,
    history,
    onClose,
    editEntry,
}: SchoolHistoryFormProps) {

    const isEditMode = !!editEntry;

    const { data: schools = [] } = useSchools();
    const { data: levelSubjectsData = [] } = useLevelSubjects();
    const createBatch = useCreateSchoolHistoryBatch();
    const updateBatch = useUpdateSchoolHistoryBatch();

    const [missingSubjects, setMissingSubjects] = useState<Set<number>>(new Set());

    const nextLevelOrder = useMemo(() => {
        if (isEditMode && editEntry) {
            return getLevelOrder(editEntry.level);
        }
        const previousOrders = history
            .filter((h) => h.schoolYearId == null && h._levelOrder != null)
            .map((h) => h._levelOrder as number);
        if (previousOrders.length === 0) return 1;
        return Math.max(...previousOrders) + 1;
    }, [history, isEditMode, editEntry]);

    const targetLevel = useMemo(() => {
        for (const level of levelSubjectsData) {
            if (getLevelOrder(level.level) === nextLevelOrder) {
                return level;
            }
        }
        return null;
    }, [levelSubjectsData, nextLevelOrder]);

    const subjectsForLevel = useMemo(() => {
        if (!targetLevel) return [];
        return (targetLevel.levelSubjects || []).map((ls: any) => ({
            id: ls.subject.id,
            subject: ls.subject.subject,
            code: ls.subject.code,
            levelSubjectId: ls.id,
        }));
    }, [targetLevel]);

    const defaultScores = useMemo(() => {
        if (!isEditMode || !editEntry?.records) return {};
        const scores: Record<string, number | undefined> = {};
        for (const record of editEntry.records) {
            if (record.levelSubjectId != null) {
                const subject = subjectsForLevel.find((s) => s.levelSubjectId === record.levelSubjectId);
                if (subject) {
                    scores[String(subject.id)] = record.finalScore ?? undefined;
                }
            }
        }
        return scores;
    }, [isEditMode, editEntry, subjectsForLevel]);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            schoolId: (editEntry?.schoolId ?? undefined) as never,
            schoolYear: (editEntry?.schoolYear ?? undefined) as never,
            scores: defaultScores,
        },
    });

    useEffect(() => {
        if (isEditMode && editEntry) {
            form.setValue("schoolId", editEntry.schoolId as never);
            if (editEntry.schoolYear != null) {
                form.setValue("schoolYear", editEntry.schoolYear as never);
            }
            if (editEntry.records) {
                const scores: Record<string, number | undefined> = {};
                for (const record of editEntry.records) {
                    if (record.levelSubjectId != null) {
                        const subject = subjectsForLevel.find((s) => s.levelSubjectId === record.levelSubjectId);
                        if (subject) {
                            scores[String(subject.id)] = record.finalScore ?? undefined;
                        }
                    }
                }
                form.setValue("scores", scores);
            }
        }
    }, [isEditMode, editEntry, subjectsForLevel, form]);

    const schoolOptions = useMemo(() => {
        return (schools as any[]).map((s) => ({
            label: s.schoolName || `Escuela #${s.id}`,
            value: s.id,
        }));
    }, [schools]);

    const handleSubmit = form.handleSubmit(async (data: FormValues) => {
        const missing = new Set<number>();
        for (const subject of subjectsForLevel) {
            const isSpecial = SPECIAL_SUBJECT_CODES.includes(subject.code ?? "");
            const score = data.scores[String(subject.id)];
            if (!isSpecial && (score === undefined || score === null || isNaN(score))) {
                missing.add(subject.id);
            }
        }
        if (missing.size > 0) {
            setMissingSubjects(missing);
            return;
        }
        setMissingSubjects(new Set());

        if (isEditMode && editEntry?.records) {
            const updates = editEntry.records
                .filter((record) => {
                    const subject = subjectsForLevel.find((s) => s.levelSubjectId === record.levelSubjectId);
                    if (!subject) return false;
                    const score = data.scores[String(subject.id)];
                    const isSpecial = SPECIAL_SUBJECT_CODES.includes(subject.code ?? "");
                    if (isSpecial && (score === undefined || score === null)) return false;
                    return true;
                })
                .map((record) => {
                    const subject = subjectsForLevel.find((s) => s.levelSubjectId === record.levelSubjectId)!;
                    return {
                        id: record.id,
                        schoolId: data.schoolId,
                        schoolYear: data.schoolYear,
                        finalScore: data.scores[String(subject.id)] ?? null,
                    };
                });
            if (updates.length > 0) {
                await updateBatch.mutateAsync({ updates });
            }
        } else {
            const records: SchoolHistoryRecord[] = subjectsForLevel
                .map((subject) => {
                    const score = data.scores[String(subject.id)];
                    const isSpecial = SPECIAL_SUBJECT_CODES.includes(subject.code ?? "");
                    if (isSpecial && (score === undefined || score === null)) return null;
                    return {
                        studentId,
                        levelSubjectId: subject.levelSubjectId,
                        schoolId: data.schoolId,
                        schoolYear: data.schoolYear,
                        finalScore: score ?? null,
                    };
                })
                .filter(Boolean) as SchoolHistoryRecord[];

            if (records.length === 0) return;
            await createBatch.mutateAsync({ records });
        }
        onClose();
    });

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <div className="h-full flex flex-col">
            {/* HEADER */}
            <div className="px-6 py-4 border-b order-(--lightBlueColor) bg-linear-to-r from-(--grayColor) to-(--lightBlueColor)/10">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4 text-(--blueColor)" />
                    </Button>
                    <div>
                        <h3 className="text-lg font-semibold text-(--blueColor)">
                            {isEditMode ? "Editar Historial Académico" : "Crear Historial Académico"}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {isEditMode
                                ? <>Editando: <span className="font-medium text-(--blueColor)">{editEntry?.level}</span></>
                                : <>Año a crear: <span className="font-medium text-(--blueColor)">{getLevelName(nextLevelOrder)}</span></>
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* FORM */}
            <Form {...form}>
                <form
                    onSubmit={onFormSubmit}
                    className="flex-1 overflow-auto p-6 space-y-6"
                >
                    {/* SCHOOL AND YEAR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldRenderer
                            field={{
                                name: "schoolId",
                                label: "Escuela",
                                type: "select",
                                placeholder: "Seleccione la escuela...",
                                options: schoolOptions,
                            }}
                        />
                        <FieldRenderer
                            field={{
                                name: "schoolYear",
                                label: "Año Escolar",
                                type: "select",
                                placeholder: "Seleccione el año...",
                                options: YEAR_OPTIONS,
                            }}
                        />
                    </div>

                    {/* SUBJECTS */}
                    <div>
                        <h4 className="text-sm font-semibold text-(--darkBlueColor) mb-3">
                            Materias y Notas Definitivas
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {subjectsForLevel.map((subject) => {
                                const isSpecial = SPECIAL_SUBJECT_CODES.includes(subject.code ?? "");
                                const isMissing = missingSubjects.has(subject.id);
                                return (
                                    <div
                                        key={subject.id}
                                        className={`flex items-center justify-between px-3 py-2 border rounded-lg transition ${
                                            isMissing
                                                ? "border-red-400 bg-red-50"
                                                : "border-(--lightBlueColor)/30 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-sm font-medium text-gray-800 truncate">
                                                {subject.subject}
                                            </span>
                                            {isSpecial && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                                                    Opcional
                                                </span>
                                            )}
                                        </div>
                                        <FieldRenderer
                                            field={{
                                                name: `scores.${subject.id}`,
                                                label: "",
                                                type: "grade",
                                                placeholder: "—",
                                                inputClassName: isMissing ? "!border-red-400" : "",
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {missingSubjects.size > 0 && (
                            <p className="text-xs text-red-500 mt-2">
                                Las materias obligatorias deben tener una nota cargada.
                            </p>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="order-(--lightBlueColor) text-(--blueColor)"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-(--blueColor) hover:bg-(--darkBlueColor) text-white"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {isSubmitting
                                ? (isEditMode ? "Actualizando..." : "Guardando...")
                                : (isEditMode ? "Actualizar" : "Guardar Historial")
                            }
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
