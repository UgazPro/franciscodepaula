import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Loader2,
  Calendar,
  ArrowLeft,
  Trash2,
  Users,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DialogComponent from "@/components/dialog/DialogComponent";
import { useTeachers, useTeacherAssignments } from "@/hooks/useTeacherAssignments";
import { useSections } from "@/hooks/useSchoolYears";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import type { SelectField } from "@/components/form/formComponent.interface";
import {
  useClassHours,
  useTeacherSchedule,
  useSectionSchedule,
  useCRPSchedule,
  type ClassHour,
  type ScheduleEntry,
} from "@/hooks/useSchedules";
import { useAssignSchedule, useAssignAllCRPSchedule, useRemoveSchedule } from "@/queries/useScheduleMutations";
import type { TeacherItem } from "@/services/users/user.interface";

interface SchedulesProps {
  tabsComponent?: React.ReactNode;
}

type CalendarMode = "teacher" | "section" | "crp" | null;

const DAY_NAMES = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const RECESS_BY_LEVEL: Record<number, number> = {
  1: 3,
  2: 3,
  3: 5,
  4: 5,
  5: 5,
};

interface AssignFormValues {
  sectionId: string;
  subjectId: string;
  classroom: string;
}

export default function Schedules({ tabsComponent }: SchedulesProps) {
  const [calendarMode, setCalendarMode] = useState<CalendarMode>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedSectionLabel, setSelectedSectionLabel] = useState("");
  const [selectedSectionLevelId, setSelectedSectionLevelId] = useState<number | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignSlotId, setAssignSlotId] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers();
  const { data: sectionsData, isLoading: isLoadingSections } = useSections();
  const { data: teacherAssignmentsData } = useTeacherAssignments();
  const { data: classHoursData } = useClassHours();
  const { data: teacherScheduleData, isLoading: isLoadingTeacherSchedule } =
    useTeacherSchedule(selectedTeacherId);
  const { data: sectionScheduleData, isLoading: isLoadingSectionSchedule } =
    useSectionSchedule(selectedSectionId);
  const { data: crpScheduleData, isLoading: isLoadingCRPSchedule } =
    useCRPSchedule(calendarMode === "crp");
  const { mutateAsync: assignSchedule, isPending: isAssigning } = useAssignSchedule();
  const { mutateAsync: assignAllCRPSchedule, isPending: isAssigningCRP } = useAssignAllCRPSchedule();
  const { mutateAsync: removeSchedule } = useRemoveSchedule();

  const formMethods = useForm<AssignFormValues>({
    defaultValues: { sectionId: "", subjectId: "", classroom: "" },
  });
  const { reset, handleSubmit, control } = formMethods;

  const watchedSectionId = useWatch({ control, name: "sectionId" });
  const watchedSubjectId = useWatch({ control, name: "subjectId" });

  const teachers = useMemo(() => {
    const data = teachersData as TeacherItem[] | undefined;
    return (data ?? []).filter((t) => t.employee);
  }, [teachersData]);

  const sections = useMemo(() => {
    const data = sectionsData as
      | {
          id: number;
          section: string;
          highSchoolLevel: { id: number; level: string };
          schoolYear: { isActive: boolean | null };
        }[]
      | undefined;
    return (data ?? []).filter((s) => s.schoolYear?.isActive);
  }, [sectionsData]);

  const allAssignments = useMemo(() => {
    const data = teacherAssignmentsData as
      | {
          id: number;
          teacherId: number;
          levelSubjectId: number;
          sectionId: number | null;
          isSpecialGroup: boolean;
          groupName: string | null;
          employee: { user: { person: { firstNames: string; lastNames: string } } } | null;
          levelSubject: {
            id: number;
            subject: { id: number; subject: string; code: string };
            highSchoolLevel: { id: number; level: string };
          };
          section: { id: number; section: string; highSchoolLevel: { id: number; level: string } } | null;
          schoolYear: { id: number; isActive: boolean | null };
        }[]
      | undefined;
    return (data ?? []).filter((a) => a.schoolYear?.isActive);
  }, [teacherAssignmentsData]);

  const teacherTGs = useMemo(() => {
    if (!selectedTeacherId) return [];
    return allAssignments.filter((a) => a.teacherId === selectedTeacherId);
  }, [allAssignments, selectedTeacherId]);

  const sectionTGs = useMemo(() => {
    if (!selectedSectionId) return [];
    return allAssignments.filter((a) => a.sectionId === selectedSectionId && !a.isSpecialGroup);
  }, [allAssignments, selectedSectionId]);

  const teacherHasOnlyCRPs = useMemo(() => {
    if (!selectedTeacherId) return false;
    const regularTGs = teacherTGs.filter((a) => !a.isSpecialGroup);
    return regularTGs.length === 0 && teacherTGs.length > 0;
  }, [teacherTGs, selectedTeacherId]);

  const sectionsForTeacher = useMemo(() => {
    const seen = new Map<number, { id: number; label: string }>();
    for (const a of teacherTGs) {
      if (!a.section) continue;
      if (!seen.has(a.section.id)) {
        seen.set(a.section.id, {
          id: a.section.id,
          label: `${a.section.highSchoolLevel.level} — Sección ${a.section.section}`,
        });
      }
    }
    return Array.from(seen.values());
  }, [teacherTGs]);

  const subjectsForAssign = useMemo(() => {
    if (calendarMode === "teacher") {
      if (!watchedSectionId) return [];
      const sectionIdNum = Number(watchedSectionId);
      return teacherTGs
        .filter((a) => a.sectionId === sectionIdNum)
        .map((a) => ({
          id: a.levelSubjectId,
          label: `${a.levelSubject.subject.code} — ${a.levelSubject.subject.subject}`,
        }));
    }
    return sectionTGs.map((a) => ({
      id: a.levelSubjectId,
      label: `${a.levelSubject.subject.code} — ${a.levelSubject.subject.subject}`,
    }));
  }, [calendarMode, watchedSectionId, teacherTGs, sectionTGs]);

  const selectedTG = useMemo(() => {
    const subjectIdNum = Number(watchedSubjectId);
    if (!subjectIdNum) return null;
    if (calendarMode === "teacher") {
      const sectionIdNum = Number(watchedSectionId);
      return teacherTGs.find(
        (a) => a.levelSubjectId === subjectIdNum && a.sectionId === sectionIdNum,
      );
    }
    if (calendarMode === "section") {
      return sectionTGs.find((a) => a.levelSubjectId === subjectIdNum);
    }
    return null;
  }, [calendarMode, watchedSectionId, watchedSubjectId, teacherTGs, sectionTGs]);

  const classHours = useMemo(() => {
    const data = classHoursData as { data: ClassHour[] } | undefined;
    return data?.data ?? [];
  }, [classHoursData]);

  const teacherSchedule = useMemo(() => {
    const data = teacherScheduleData as { data: ScheduleEntry[] } | undefined;
    return data?.data ?? [];
  }, [teacherScheduleData]);

  const sectionSchedule = useMemo(() => {
    const data = sectionScheduleData as { data: ScheduleEntry[] } | undefined;
    return data?.data ?? [];
  }, [sectionScheduleData]);

  const crpSchedule = useMemo(() => {
    const data = crpScheduleData as { data: ScheduleEntry[] } | undefined;
    return data?.data ?? [];
  }, [crpScheduleData]);

  const currentSchedule = calendarMode === "teacher"
    ? teacherSchedule
    : calendarMode === "section"
      ? sectionSchedule
      : crpSchedule;
  const isLoadingSchedule =
    calendarMode === "teacher"
      ? isLoadingTeacherSchedule
      : calendarMode === "section"
        ? isLoadingSectionSchedule
        : isLoadingCRPSchedule;

  const scheduleMap = useMemo(() => {
    const map = new Map<string, ScheduleEntry>();
    for (const entry of currentSchedule) {
      map.set(`${entry.dayOfWeek}-${entry.block}`, entry);
    }
    return map;
  }, [currentSchedule]);

  const getRecessBlock = useCallback(
    (levelId: number | null) => {
      if (!levelId) return null;
      return RECESS_BY_LEVEL[levelId] ?? null;
    },
    [],
  );

  const handleSelectTeacher = useCallback(
    (teacher: TeacherItem) => {
      setSelectedTeacherId(teacher.employee.id);
      setSelectedTeacherName(
        `${teacher.person.firstNames} ${teacher.person.lastNames}`,
      );
      setIsAnimating(true);
      requestAnimationFrame(() => {
        setCalendarMode("teacher");
        setIsAnimating(false);
      });
    },
    [],
  );

  const handleSelectSection = useCallback(
    (section: {
      id: number;
      section: string;
      highSchoolLevel: { id: number; level: string };
    }) => {
      setSelectedSectionId(section.id);
      setSelectedSectionLabel(
        `${section.highSchoolLevel.level} — Sección ${section.section}`,
      );
      setSelectedSectionLevelId(section.highSchoolLevel.id);
      setIsAnimating(true);
      requestAnimationFrame(() => {
        setCalendarMode("section");
        setIsAnimating(false);
      });
    },
    [],
  );

  const handleSelectCRP = useCallback(() => {
    setIsAnimating(true);
    requestAnimationFrame(() => {
      setCalendarMode("crp");
      setIsAnimating(false);
    });
  }, []);

  const handleCellClick = useCallback(
    (dayOfWeek: number, block: number) => {
      const key = `${dayOfWeek}-${block}`;
      if (scheduleMap.has(key)) return;

      const recessBlock = getRecessBlock(
        calendarMode === "section" ? selectedSectionLevelId : null,
      );
      if (recessBlock === block) return;

      const slot = classHours.find((ch) => ch.block === block);
      if (!slot) return;

      const allSlots = classHours;
      const slotIndex = allSlots.findIndex((ch) => ch.block === block);
      const scheduleSlotId = (dayOfWeek - 1) * allSlots.length + slotIndex + 1;

      if (calendarMode === "teacher" && teacherHasOnlyCRPs) return;

      if (calendarMode === "crp") {
        setAssignSlotId(scheduleSlotId);
        setAssignDialogOpen(true);
        return;
      }

      setAssignSlotId(scheduleSlotId);
      reset({ sectionId: "", subjectId: "", classroom: "" });
      setAssignDialogOpen(true);
    },
    [scheduleMap, classHours, calendarMode, selectedSectionLevelId, getRecessBlock, reset, teacherHasOnlyCRPs],
  );

  const handleAssign = handleSubmit(async (values) => {
    if (!assignSlotId) return;

    if (calendarMode === "crp") {
      await assignAllCRPSchedule({
        scheduleSlotId: assignSlotId,
        classroom: values.classroom || undefined,
      });
      setAssignDialogOpen(false);
      setAssignSlotId(null);
      reset({ sectionId: "", subjectId: "", classroom: "" });
      return;
    }

    if (!selectedTG) return;
    await assignSchedule({
      teachingGroupId: selectedTG.id,
      scheduleSlotId: assignSlotId,
      classroom: values.classroom || undefined,
    });
    setAssignDialogOpen(false);
    setAssignSlotId(null);
    reset({ sectionId: "", subjectId: "", classroom: "" });
  });

  const handleRemove = async (id: number) => {
    await removeSchedule(id);
  };

  const handleBack = () => {
    setIsAnimating(true);
    requestAnimationFrame(() => {
      setCalendarMode(null);
      setSelectedTeacherId(null);
      setSelectedTeacherName("");
      setSelectedSectionId(null);
      setSelectedSectionLabel("");
      setSelectedSectionLevelId(null);
      setIsAnimating(false);
    });
  };

  const sortedClassHours = useMemo(
    () => [...classHours].sort((a, b) => a.block - b.block),
    [classHours],
  );

  const assignDialogSlot = useMemo(() => {
    if (!assignSlotId || !classHours.length) return null;
    const slotIndex = (assignSlotId - 1) % classHours.length;
    return classHours[slotIndex] ?? null;
  }, [assignSlotId, classHours]);

  const assignDialogDay = useMemo(() => {
    if (!assignSlotId || !classHours.length) return null;
    const dayIndex = Math.floor((assignSlotId - 1) / classHours.length);
    return DAY_NAMES[dayIndex + 1] ?? null;
  }, [assignSlotId, classHours]);

  const sectionField: SelectField = useMemo(
    () => ({
      name: "sectionId",
      label: "Sección",
      type: "select",
      placeholder: "Seleccionar sección...",
      options: sectionsForTeacher.map((s) => ({ label: s.label, value: String(s.id) })),
      disabled: false,
    }),
    [sectionsForTeacher],
  );

  const subjectField: SelectField = useMemo(
    () => ({
      name: "subjectId",
      label: "Materia",
      type: "select",
      placeholder:
        calendarMode === "teacher" && !watchedSectionId
          ? "Primero seleccione una sección..."
          : "Seleccionar materia...",
      options: subjectsForAssign.map((s) => ({ label: s.label, value: String(s.id) })),
      disabled: calendarMode === "teacher" && !watchedSectionId,
    }),
    [calendarMode, watchedSectionId, subjectsForAssign],
  );

  useEffect(() => {
    if (!assignDialogOpen) {
      reset({ sectionId: "", subjectId: "", classroom: "" });
    }
  }, [assignDialogOpen, reset]);

  const menuView = (
    <div
      className={`transition-all duration-300 ease-in-out ${
        calendarMode || isAnimating
          ? "opacity-0 scale-95 pointer-events-none absolute inset-0"
          : "opacity-100 scale-100"
      }`}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-(--darkBlueColor) to-(--blueColor) rounded-xl">
            <Calendar size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Horarios</h1>
            <p className="text-sm text-gray-500">
              Gestión de horarios escolares
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-700">Profesores</h2>
          </div>
          {isLoadingTeachers ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando...
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 max-h-[370px] overflow-y-auto">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => handleSelectTeacher(teacher)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-blue-50/50 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 group-hover:from-blue-600 group-hover:to-blue-800 transition">
                    {teacher.person.firstNames.charAt(0)}
                    {teacher.person.lastNames.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {teacher.person.firstNames} {teacher.person.lastNames}
                    </p>
                    <p className="text-xs text-gray-400">{teacher.person.identificationNumber}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-purple-600" />
            <h2 className="text-base font-semibold text-gray-700">Secciones</h2>
          </div>
          {isLoadingSections ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Cargando...
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 max-h-[370px] overflow-y-auto">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSelectSection(section)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-purple-50/50 transition cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 group-hover:from-purple-600 group-hover:to-purple-800 transition">
                    {section.highSchoolLevel.level.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {section.highSchoolLevel.level} — Sección {section.section}
                    </p>
                  </div>
                </button>
              ))}
              <button
                onClick={handleSelectCRP}
                className="w-full flex items-center gap-3 p-4 hover:bg-purple-50/50 transition cursor-pointer text-left group"
              >
                <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 group-hover:from-purple-700 group-hover:to-purple-900 transition">
                  CRP
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800">CRP</p>
                  <p className="text-xs text-gray-400">Horario común de todos los CRPs</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const calendarView = (
    <div
      className={`transition-all duration-300 ease-in-out ${
        !calendarMode || isAnimating
          ? "opacity-0 scale-95 pointer-events-none absolute inset-0"
          : "opacity-100 scale-100"
      }`}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={20} className="text-(--blueColor)" />
          </button>
          <div className="p-3 bg-linear-to-br from-(--darkBlueColor) to-(--blueColor) rounded-xl">
            <Calendar size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {calendarMode === "teacher"
                ? selectedTeacherName
                : calendarMode === "section"
                  ? selectedSectionLabel
                  : "CRP"}
            </h1>
            <p className="text-sm text-gray-500">
              {calendarMode === "teacher"
                ? teacherHasOnlyCRPs
                  ? "Horario del docente (solo CRP — solo lectura)"
                  : "Horario del docente"
                : calendarMode === "section"
                  ? "Horario de la sección"
                  : "Horario común de todos los CRPs"}
            </p>
          </div>
        </div>
      </div>

      {isLoadingSchedule ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando horario...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-32">
                    Hora
                  </th>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase"
                    >
                      {DAY_NAMES[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedClassHours.map((ch) => {
                  const recessBlock =
                    calendarMode === "section"
                      ? getRecessBlock(selectedSectionLevelId)
                      : null;
                  const isRecess = recessBlock === ch.block;

                  return (
                    <tr key={ch.id}>
                      <td className="px-4 py-2 text-sm text-gray-600 font-medium whitespace-nowrap">
                        {ch.startTime} - {ch.endTime}
                      </td>
                      {[1, 2, 3, 4, 5].map((day) => {
                        const key = `${day}-${ch.block}`;
                        const entry = scheduleMap.get(key);
                        const isOccupied = !!entry;

                        if (isRecess) {
                          return (
                            <td key={day} className="px-2 py-2 text-center">
                              <div className="h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-400">Recreo</span>
                              </div>
                            </td>
                          );
                        }

                        if (isOccupied) {
                          const cellColor = entry.isSpecialGroup
                            ? "bg-purple-600"
                            : "bg-(--blueColor)";
                          return (
                            <td key={day} className="px-2 py-2 text-center">
                              <div className={`h-16 ${cellColor} rounded-lg flex flex-col items-center justify-center gap-0.5 relative group`}>
                                <span className="text-[10px] font-bold text-white leading-tight">
                                  {entry.subjectCode ?? entry.subject}
                                </span>
                                {calendarMode === "teacher" && entry.section && (
                                  <span className="text-[9px] text-blue-200">
                                    {entry.section}
                                  </span>
                                )}
                                {calendarMode === "teacher" && entry.isSpecialGroup && entry.groupName && (
                                  <span className="text-[9px] text-purple-200">
                                    {entry.groupName}
                                  </span>
                                )}
                                {calendarMode === "section" && entry.teacherName && (
                                  <span className="text-[9px] text-blue-200 leading-tight">
                                    {entry.teacherName}
                                  </span>
                                )}
                                {calendarMode === "crp" && (
                                  <span className="text-[9px] text-purple-200">
                                    {entry.level}
                                  </span>
                                )}
                                {entry.classroom && (
                                  <span className="text-[9px] text-blue-200">
                                    {entry.classroom}
                                  </span>
                                )}
                                {!(calendarMode === "teacher" && teacherHasOnlyCRPs) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemove(entry.id);
                                    }}
                                    className="absolute top-0.5 right-0.5 p-0.5 rounded bg-red-500/80 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                  >
                                    <Trash2 size={10} className="text-white" />
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={day} className="px-2 py-2 text-center">
                            {calendarMode === "teacher" && teacherHasOnlyCRPs ? (
                              <div className="h-16 w-full bg-gray-50 border border-gray-100 rounded-lg" />
                            ) : (
                              <button
                                onClick={() => handleCellClick(day, ch.block)}
                                className="h-16 w-full bg-white border border-gray-200 rounded-lg hover:border-(--blueColor) hover:bg-blue-50 transition cursor-pointer"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const assignFields = useMemo(() => {
    if (calendarMode === "crp") return [];
    const fields = [];
    if (calendarMode === "teacher") {
      fields.push(sectionField);
    }
    fields.push(subjectField);
    return fields;
  }, [calendarMode, sectionField, subjectField]);

  return (
    <div className="relative">
      {tabsComponent}

      {calendarMode ? calendarView : menuView}

      <DialogComponent
        openDialog={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        dialogTitle="Asignar Horario"
        dialogDescription={
          assignDialogDay && assignDialogSlot
            ? `${assignDialogDay} ${assignDialogSlot.startTime} - ${assignDialogSlot.endTime}`
            : ""
        }
        className="max-w-md"
      >
        <FormProvider {...formMethods}>
          <form onSubmit={handleAssign} className="space-y-4 mt-2">
            {assignFields.map((field) => (
              <FieldRenderer key={field.name} field={field} />
            ))}

            <div>
              <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                Aula (opcional)
              </label>
              <input
                type="text"
                {...formMethods.register("classroom")}
                placeholder="Ej: A-101"
                className="w-full h-10 px-4 border border-(--lightBlueColor)/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--blueColor)"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
            <Button
              type="submit"
              disabled={calendarMode !== "crp" && !selectedTG || isAssigning || isAssigningCRP}
              className="bg-linear-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 cursor-pointer disabled:opacity-50"
            >
              {isAssigning || isAssigningCRP ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              Asignar
            </Button>
            </div>
          </form>
        </FormProvider>
      </DialogComponent>
    </div>
  );
}
