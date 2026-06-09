import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSchoolYears, useLevels, useSections } from "@/hooks/useSchoolYears";
import {
  useCreateSchoolYear,
  useUpdateSchoolYear,
  useToggleSchoolYearActive,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useCreateLevel,
  useUpdateLevel,
  useDeleteLevel,
} from "@/queries/useSchoolYearMutations";
import SchoolYearDialog from "./SchoolYearDialog";
import SectionDialog from "./SectionDialog";
import LevelDialog from "./LevelDialog";
import {
  Plus,
  Power,
  PowerOff,
  Pencil,
  Trash2,
  Loader2,
  GraduationCap,
  BookOpen,
  Layers,
} from "lucide-react";

export default function SchoolYearPanel() {
  const { data: schoolYears = [], isLoading: loadingYears } = useSchoolYears();
  const { data: levels = [] } = useLevels();
  const { data: allSections = [] } = useSections();

  const createSchoolYear = useCreateSchoolYear();
  const updateSchoolYear = useUpdateSchoolYear();
  const toggleActive = useToggleSchoolYearActive();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const createLevel = useCreateLevel();
  const updateLevel = useUpdateLevel();
  const deleteLevel = useDeleteLevel();

  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [editLevelData, setEditLevelData] = useState<{
    id: number;
    level: string;
  } | null>(null);
  const [yearDialogOpen, setYearDialogOpen] = useState(false);
  const [editYearData, setEditYearData] = useState<{
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editSectionData, setEditSectionData] = useState<{
    id: number;
    highSchoolLevelId: number;
    section: string;
  } | null>(null);
  const [preselectedLevelId, setPreselectedLevelId] = useState<number | null>(null);

  const selectedYear = useMemo(
    () => schoolYears.find((y: any) => y.id === selectedYearId) ?? null,
    [schoolYears, selectedYearId],
  );

  const sectionsForYear = useMemo(
    () =>
      selectedYearId
        ? allSections.filter(
            (s: any) => s.schoolYearId === selectedYearId,
          )
        : [],
    [allSections, selectedYearId],
  );

  const sectionsByLevel = useMemo(() => {
    const map: Record<number, any[]> = {};
    for (const sec of sectionsForYear as any[]) {
      if (!map[sec.highSchoolLevelId]) map[sec.highSchoolLevelId] = [];
      map[sec.highSchoolLevelId].push(sec);
    }
    return map;
  }, [sectionsForYear]);

  const sortedLevels = useMemo(
    () => [...(levels as any[])].sort((a, b) => a.id - b.id),
    [levels],
  );

  const handleCreateYear = (data: { name: string; startDate: Date; endDate: Date }) => {
    createSchoolYear.mutate(data, {
      onSuccess: () => {
        setYearDialogOpen(false);
      },
    });
  };

  const handleUpdateYear = (data: { name: string; startDate: Date; endDate: Date }) => {
    if (!editYearData) return;
    updateSchoolYear.mutate(
      { id: editYearData.id, data: data as any },
      {
        onSuccess: () => {
          setYearDialogOpen(false);
          setEditYearData(null);
        },
      },
    );
  };

  const handleToggleActive = (id: number) => {
    toggleActive.mutate(id);
  };

  const openEditYear = (year: any) => {
    setEditYearData({
      id: year.id,
      name: year.name,
      startDate: year.startDate,
      endDate: year.endDate,
    });
    setYearDialogOpen(true);
  };

  const openCreateYear = () => {
    setEditYearData(null);
    setYearDialogOpen(true);
  };

  const openCreateSection = (levelId?: number) => {
    setEditSectionData(null);
    setPreselectedLevelId(levelId ?? null);
    setSectionDialogOpen(true);
  };

  const openEditSection = (section: any) => {
    setEditSectionData({
      id: section.id,
      highSchoolLevelId: section.highSchoolLevelId,
      section: section.section,
    });
    setPreselectedLevelId(section.highSchoolLevelId);
    setSectionDialogOpen(true);
  };

  const handleCreateSection = (data: {
    schoolYearId: number;
    highSchoolLevelId: number;
    section: string;
  }) => {
    createSection.mutate(data, {
      onSuccess: () => setSectionDialogOpen(false),
    });
  };

  const handleUpdateSection = (data: {
    schoolYearId: number;
    highSchoolLevelId: number;
    section: string;
  }) => {
    if (!editSectionData) return;
    updateSection.mutate(
      { id: editSectionData.id, data },
      {
        onSuccess: () => {
          setSectionDialogOpen(false);
          setEditSectionData(null);
        },
      },
    );
  };

  const handleDeleteSection = (id: number) => {
    deleteSection.mutate(id);
  };

  const handleCreateLevel = (data: { level: string }) => {
    createLevel.mutate(data, {
      onSuccess: () => setLevelDialogOpen(false),
    });
  };

  const handleUpdateLevel = (data: { level: string }) => {
    if (!editLevelData) return;
    updateLevel.mutate(
      { id: editLevelData.id, data },
      {
        onSuccess: () => {
          setLevelDialogOpen(false);
          setEditLevelData(null);
        },
      },
    );
  };

  const handleDeleteLevel = (id: number) => {
    deleteLevel.mutate(id);
  };

  const openCreateLevel = () => {
    setEditLevelData(null);
    setLevelDialogOpen(true);
  };

  const openEditLevel = (level: any) => {
    setEditLevelData({ id: level.id, level: level.level });
    setLevelDialogOpen(true);
  };

  if (loadingYears) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-(--lightBlueColor)" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-5 text-(--blueColor)" />
              <CardTitle className="text-(--darkBlueColor) text-lg">
                Gestión de Años Escolares
              </CardTitle>
            </div>
            <Button
              onClick={openCreateYear}
              className="bg-(--blueColor) hover:bg-(--darkBlueColor) cursor-pointer"
            >
              <Plus className="mr-1.5 size-4" />
              Nuevo Año Escolar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {schoolYears.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-(--lightBlueColor)">
              <GraduationCap className="mb-3 size-12 opacity-40" />
              <p className="text-sm font-medium">
                No hay años escolares registrados
              </p>
              <p className="mt-1 text-xs opacity-60">
                Crea el primer año escolar para empezar
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                  {schoolYears.map((year: any) => {
                    const isSelected = selectedYearId === year.id;
                    const isActive = year.isActive;

                    if (isActive) {
                      return (
                        <div key={year.id} className="flex items-stretch">
                          <span
                            onClick={() => setSelectedYearId(year.id)}
                            className={`
                              flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium
                              transition-all duration-200 cursor-pointer select-none
                              ${isSelected
                                ? "bg-(--greenColor)/10 text-(--greenColor) border-(--greenColor) shadow-sm"
                                : "bg-(--greenColor)/5 text-(--greenColor) border-(--greenColor)/40 hover:bg-(--greenColor)/10 hover:border-(--greenColor)"
                              }
                            `}
                          >
                            <span className="size-2 rounded-full bg-(--greenColor)" />
                            {year.name}
                            <span className="ml-1 text-xs opacity-50">
                              ({year._count?.sections ?? 0})
                            </span>
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={year.id} className="flex items-stretch">
                        <button
                          type="button"
                          onClick={() => setSelectedYearId(year.id)}
                          className={`
                            flex items-center gap-2 rounded-l-lg border border-r-0 px-4 py-2.5 text-sm font-medium
                            transition-all duration-200 cursor-pointer
                            ${
                              isSelected
                                ? "bg-white text-(--darkBlueColor) border-(--greenColor) shadow-sm"
                                : "bg-transparent text-(--lightBlueColor) border-gray-200 hover:bg-white hover:text-(--blueColor) hover:border-(--blueColor)"
                            }
                          `}
                        >
                          {year.name}
                          <span className="ml-1 text-xs opacity-50">
                            ({year._count?.sections ?? 0})
                          </span>
                        </button>

                        <button
                          type="button"
                          title={isActive ? "Desactivar" : "Activar"}
                          onClick={() => handleToggleActive(year.id)}
                          disabled={toggleActive.isPending}
                          className={`
                            flex items-center justify-center border px-2.5 text-xs
                            transition-all duration-200 cursor-pointer
                            ${
                              isSelected
                                ? "bg-white text-(--greenColor) border-(--greenColor)"
                                : "bg-transparent text-(--lightBlueColor) border-gray-200 hover:bg-white hover:text-(--greenColor)"
                            }
                            ${toggleActive.isPending ? "opacity-50 pointer-events-none" : ""}
                          `}
                        >
                          {isActive ? (
                            <Power className="size-3.5" />
                          ) : (
                            <PowerOff className="size-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          title="Editar"
                          onClick={() => openEditYear(year)}
                          className={`
                            flex items-center justify-center rounded-r-lg border px-2.5 text-xs
                            transition-all duration-200 cursor-pointer
                            ${
                              isSelected
                                ? "bg-white text-(--blueColor) border-(--greenColor)"
                                : "bg-transparent text-(--lightBlueColor) border-gray-200 hover:bg-white hover:text-(--blueColor)"
                            }
                          `}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
              </div>

              {levels.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="size-4 text-(--blueColor)" />
                      <h3 className="text-sm font-semibold text-(--darkBlueColor)">
                        Niveles
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={openCreateLevel}
                      className="text-(--blueColor) hover:text-(--darkBlueColor) hover:bg-(--blueColor)/5 cursor-pointer"
                    >
                      <Plus className="mr-1 size-3.5" />
                      <span className="text-xs">Nuevo Nivel</span>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sortedLevels.map((level: any) => (
                      <div key={level.id} className="flex items-stretch">
                        <span className="flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-(--darkBlueColor)">
                          {level.level}
                        </span>
                        <button
                          type="button"
                          title="Editar nivel"
                          onClick={() => openEditLevel(level)}
                          className="flex items-center justify-center border border-r-0 border-gray-200 bg-white px-2 text-(--lightBlueColor) transition-all hover:text-(--blueColor) hover:border-(--blueColor) cursor-pointer"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              title="Eliminar nivel"
                              className="flex items-center justify-center rounded-r-lg border border-gray-200 bg-white px-2 text-(--lightBlueColor) transition-all hover:text-red-500 hover:border-red-300 cursor-pointer"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Eliminar nivel
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de eliminar el nivel{" "}
                                <strong>{level.level}</strong>?
                                {level._count?.sections > 0 && (
                                  <span className="mt-2 block text-red-500">
                                    Este nivel tiene {level._count.sections} sección(es) asociada(s). Debes eliminarlas primero.
                                  </span>
                                )}
                                Los niveles sin secciones asociadas se eliminarán permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteLevel(level.id)}
                                className="bg-red-600 hover:bg-red-700 cursor-pointer"
                              >
                                {deleteLevel.isPending && (
                                  <Loader2 className="mr-2 size-4 animate-spin" />
                                )}
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedYear ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-4 text-(--blueColor)" />
                      <h3 className="text-sm font-semibold text-(--darkBlueColor)">
                        Niveles y Secciones — {selectedYear.name}
                      </h3>
                    </div>
                  </div>

                  {sortedLevels.length === 0 ? (
                    <p className="text-sm text-(--lightBlueColor) py-4 text-center">
                      No hay niveles configurados en el sistema.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sortedLevels.map((level: any) => {
                        const levelSections = sectionsByLevel[level.id] ?? [];
                        return (
                          <div
                            key={level.id}
                            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 transition-colors hover:bg-gray-100/50"
                          >
                            <span className="min-w-[100px] text-sm font-medium text-(--darkBlueColor)">
                              {level.level}
                            </span>

                            <div className="flex flex-1 flex-wrap items-center gap-1.5">
                              {levelSections.length === 0 ? (
                                <span className="text-xs text-(--lightBlueColor) italic">
                                  Sin secciones
                                </span>
                              ) : (
                                levelSections.map((sec: any) => (
                                  <div key={sec.id} className="group flex items-center">
                                    <Badge
                                      variant="outline"
                                      className="rounded-md border-(--blueColor)/20 bg-white px-2.5 py-1 text-xs font-medium text-(--blueColor) transition-all group-hover:border-(--blueColor)/40 group-hover:bg-(--blueColor)/5"
                                    >
                                      {sec.section}
                                    </Badge>
                                    <button
                                      type="button"
                                      title="Editar sección"
                                      onClick={() => openEditSection(sec)}
                                      className="ml-0.5 p-0.5 text-(--lightBlueColor) opacity-0 transition-all hover:text-(--blueColor) group-hover:opacity-100 cursor-pointer"
                                    >
                                      <Pencil className="size-3" />
                                    </button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <button
                                          type="button"
                                          title="Eliminar sección"
                                          className="p-0.5 text-(--lightBlueColor) opacity-0 transition-all hover:text-red-500 group-hover:opacity-100 cursor-pointer"
                                        >
                                          <Trash2 className="size-3" />
                                        </button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Eliminar sección
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            ¿Estás seguro de eliminar la sección{" "}
                                            <strong>{sec.section}</strong> de{" "}
                                            {level.level}? Esta acción no se
                                            puede deshacer.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancelar
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleDeleteSection(sec.id)
                                            }
                                            className="bg-red-600 hover:bg-red-700 cursor-pointer"
                                          >
                                            {deleteSection.isPending && (
                                              <Loader2 className="mr-2 size-4 animate-spin" />
                                            )}
                                            Eliminar
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                ))
                              )}
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openCreateSection(level.id)}
                              className="shrink-0 text-(--blueColor) hover:text-(--darkBlueColor) hover:bg-(--blueColor)/5 cursor-pointer"
                            >
                              <Plus className="mr-1 size-3.5" />
                              <span className="text-xs">Sección</span>
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-(--lightBlueColor)">
                  <p className="text-sm font-medium">
                    Selecciona un año escolar para gestionar sus niveles y
                    secciones
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <SchoolYearDialog
        open={yearDialogOpen}
        onClose={() => {
          setYearDialogOpen(false);
          setEditYearData(null);
        }}
        onSubmit={editYearData ? handleUpdateYear : handleCreateYear}
        isPending={
          editYearData
            ? updateSchoolYear.isPending
            : createSchoolYear.isPending
        }
        editData={editYearData}
      />

      <SectionDialog
        open={sectionDialogOpen}
        onClose={() => {
          setSectionDialogOpen(false);
          setEditSectionData(null);
        }}
        onSubmit={editSectionData ? handleUpdateSection : handleCreateSection}
        isPending={
          editSectionData
            ? updateSection.isPending
            : createSection.isPending
        }
        schoolYearId={selectedYearId!}
        editData={editSectionData}
        preselectedLevelId={preselectedLevelId}
      />

      <LevelDialog
        open={levelDialogOpen}
        onClose={() => {
          setLevelDialogOpen(false);
          setEditLevelData(null);
        }}
        onSubmit={editLevelData ? handleUpdateLevel : handleCreateLevel}
        isPending={
          editLevelData
            ? updateLevel.isPending
            : createLevel.isPending
        }
        editData={editLevelData}
      />
    </>
  );

}