import { useState } from "react";
import { X, User, UserCheck, MapPin, Cake, Clock, CheckCircle, XCircle, School, Edit, GraduationCap, Globe, Map, Landmark, Star, History, BookOpen, AlertTriangle } from "lucide-react";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { useStudentsStore } from "@/stores/students.store";
import { useAcademicHistory, type AcademicHistoryEntry } from "@/hooks/useAcademicHistory";

import {
    calculateMartialTime,
    dateFormatterIntoLong,
} from "@/helpers/formatter";
import DialogComponent from "@/components/dialog/DialogComponent";

export default function StudentDetailView() {

    const {
        selectedStudent,
        setScreen,
        startEdit,
    } = useStudentsStore();

    const [selectedEntry, setSelectedEntry] = useState<AcademicHistoryEntry | null>(null);

    const { data: academicHistory } = useAcademicHistory(selectedStudent?.id ?? null);

    if (!selectedStudent) return null;

    const person = selectedStudent.person;

    const fullName = `${person.firstNames} ${person.lastNames}`;

    return (

        <div className="min-h-full p-6 relative w-full bg-white shadow-xl border order-(--lightBlueColor) rounded-2xl">

            {/* HEADER */}
            <div className="bg-linear-to-r from-(--grayColor) to-(--lightBlueColor)/20 border order-(--lightBlueColor) rounded-2xl">

                <div className="p-6">

                    <div className="flex justify-between items-start gap-4">

                        {/* INFO */}
                        <div className="flex items-center gap-5">

                            {/* FOTO */}
                            <div className="h-24 w-24 rounded-full bg-linear-to-br from-(--blueColor) to-(--darkBlueColor) p-1 shadow-lg">

                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">

                                    {person.profilePhoto ? (
                                        <img
                                            src={person.profilePhoto}
                                            alt={fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-10 w-10 text-(--blueColor)" />
                                    )}

                                </div>

                            </div>

                            {/* TEXTOS */}
                            <div>

                                <h2 className="text-3xl font-bold text-(--blueColor)">
                                    {fullName}
                                </h2>

                                <div className="flex flex-wrap items-center gap-3 mt-3">

                                    {selectedStudent.status ? (
                                        <Badge className="bg-(--greenColor)/10 text-(--greenColor) border-(--greenColor)/30">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Activo
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-100 text-red-700 border-red-200">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Inactivo
                                        </Badge>
                                    )}

                                    <Badge
                                        variant="outline"
                                        className="order-(--lightBlueColor) text-(--blueColor)"
                                    >
                                        <GraduationCap className="h-3 w-3 mr-1" />
                                        Estudiante
                                    </Badge>

                                </div>

                            </div>

                        </div>

                        {/* CLOSE */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setScreen("list")}
                            className="hover:bg-white/60"
                        >
                            <X className="h-5 w-5 text-(--blueColor)" />
                        </Button>

                    </div>

                </div>

            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-4">

                {/* GRID 3 COLUMNAS: PERSONAL | UBICACIÓN | ACADÉMICO */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* PERSONAL */}
                    <Card className="border order-(--lightBlueColor) shadow-sm">

                        <CardContent className="px-6 py-1">

                            <div className="flex items-center gap-2 mb-5">

                                <User className="h-5 w-5 text-(--blueColor)" />

                                <h3 className="text-lg font-semibold text-(--blueColor)">
                                    Información Personal
                                </h3>

                            </div>

                            <div className="space-y-5">

                                <div className="grid grid-cols-2 gap-4">

                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Cédula
                                        </p>

                                        <p className="font-semibold text-(--blueColor)">
                                            {person.identificationNumber}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Género
                                        </p>

                                        <p className="font-semibold text-(--blueColor)">
                                            {person.gender}
                                        </p>
                                    </div>

                                </div>

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">
                                        Fecha de Nacimiento
                                    </p>

                                    <div className="flex items-center gap-2">

                                        <Cake className="h-4 w-4 text-(--blueColor)" />

                                        <p className="font-medium text-gray-800">
                                            {dateFormatterIntoLong(person.birthDate)}
                                        </p>

                                    </div>

                                </div>

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">
                                        Tiempo en la Institución
                                    </p>

                                    <div className="flex items-center gap-2">

                                        <Clock className="h-4 w-4 text-(--blueColor)" />

                                        <p className="font-medium text-gray-800">
                                            {
                                                calculateMartialTime(
                                                    selectedStudent.admissionDate
                                                ).text
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </CardContent>

                    </Card>

                    {/* UBICACION */}
                    <Card className="border order-(--lightBlueColor) shadow-sm">

                        <CardContent className="px-6 py-1">

                            <div className="flex items-center gap-2 mb-5">

                                <MapPin className="h-5 w-5 text-(--blueColor)" />

                                <h3 className="text-lg font-semibold text-(--blueColor)">
                                    Información de Ubicación
                                </h3>

                            </div>

                            <div className="space-y-5">

                                <div className="flex items-start gap-3">

                                    <div className="h-10 w-10 rounded-full bg-(--grayColor) flex items-center justify-center">

                                        <Globe className="h-5 w-5 text-(--blueColor)" />

                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            País de Nacimiento
                                        </p>

                                        <p className="font-medium text-gray-800">
                                            {selectedStudent.birthCountry || "No registrado"}
                                        </p>
                                    </div>

                                </div>

                                <div className="flex items-start gap-3">

                                    <div className="h-10 w-10 rounded-full bg-(--grayColor) flex items-center justify-center">

                                        <Map className="h-5 w-5 text-(--blueColor)" />

                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Estado / Parroquia
                                        </p>

                                        <p className="font-medium text-gray-800">
                                            {selectedStudent.state || "No registrado"}{" "}
                                            {selectedStudent.parish && `- ${selectedStudent.parish}`}
                                        </p>
                                    </div>

                                </div>

                                <div className="flex items-start gap-3">

                                    <div className="h-10 w-10 rounded-full bg-(--grayColor) flex items-center justify-center">

                                        <Landmark className="h-5 w-5 text-(--blueColor)" />

                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Dirección
                                        </p>

                                        <p className="font-medium text-gray-800">
                                            {selectedStudent.address || "No registrada"}
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </CardContent>

                    </Card>

                    {/* ACADEMICO */}
                    <Card className="border order-(--lightBlueColor) shadow-sm">

                        <CardContent className="px-6 py-1">

                            <div className="flex items-center gap-2 mb-5">

                                <School className="h-5 w-5 text-(--blueColor)" />

                                <h3 className="text-lg font-semibold text-(--blueColor)">
                                    Información Académica
                                </h3>

                            </div>

                            <div className="space-y-5">

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">
                                        Nivel / Sección
                                    </p>

                                    <Badge className="bg-(--blueColor)/10 text-(--blueColor) border-(--blueColor)/20">
                                        {(() => {
                                            const enrollment = selectedStudent.enrollments?.[0];
                                            return enrollment
                                                ? `${enrollment.section.highSchoolLevel.level} - ${enrollment.section.section}`
                                                : "Sin asignar";
                                        })()}
                                    </Badge>

                                </div>

                            </div>

                        </CardContent>

                    </Card>

                </div>

                {/* REPRESENTANTES */}
                <Card className="border order-(--lightBlueColor) shadow-sm">

                    <CardContent className="px-6 py-1">

                        <div className="flex items-center gap-2 mb-5">

                            <UserCheck className="h-5 w-5 text-(--blueColor)" />

                            <h3 className="text-lg font-semibold text-(--blueColor)">
                                Representantes
                            </h3>

                        </div>

                        {!selectedStudent.representatives || selectedStudent.representatives.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400">Sin representantes asignados</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedStudent.representatives.map((studentRep) => {
                                    const rep = studentRep.representative;
                                    if (!rep) return null;
                                    const repPerson = rep.user.person;
                                    const isPrimary = studentRep.isPrimary === true;
                                    return (
                                        <Card key={studentRep.id} className={`border shadow-sm ${isPrimary ? "border-(--blueColor)/40 bg-(--blueColor)/5" : "order-(--lightBlueColor)"}`}>
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-linear-to-br from-(--blueColor) to-(--darkBlueColor) flex items-center justify-center text-white font-bold shrink-0">
                                                        {repPerson.firstNames.charAt(0)}{repPerson.lastNames.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-gray-800 truncate">
                                                            {repPerson.firstNames} {repPerson.lastNames}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {studentRep.relationship || "Sin parentesco"}
                                                            </span>
                                                            {isPrimary ? (
                                                                <Badge className="bg-(--blueColor)/10 text-(--blueColor) border-(--blueColor)/30 text-[11px] px-2 py-0.5">
                                                                    <Star className="h-3 w-3 mr-0.5 inline" />
                                                                    Representante Legal
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-gray-500 border-gray-300 text-[11px] px-2 py-0.5">
                                                                    Representante
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Cédula</p>
                                                        <p className="font-medium text-gray-800">{repPerson.identificationNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Teléfono</p>
                                                        <p className="font-medium text-gray-800">{rep.user.phone || "—"}</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-gray-500">Correo Electrónico</p>
                                                    <p className="font-medium text-gray-800 truncate">{rep.user.email || "—"}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                    </CardContent>

                </Card>

                {/* HISTORIAL ACADEMICO */}
                {academicHistory && academicHistory.history.length > 0 && (
                    <Card className="border order-(--lightBlueColor) shadow-sm">

                        <CardContent className="px-6 py-1">

                            <div className="flex items-center gap-2 mb-5">

                                <History className="h-5 w-5 text-(--blueColor)" />

                                <h3 className="text-lg font-semibold text-(--blueColor)">
                                    Historial Académico
                                </h3>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {academicHistory.history.map((entry, idx) => (
                                    <Card
                                        key={idx}
                                        className={`border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                                            entry.isCurrentSchool
                                                ? "border-(--blueColor)/40 bg-(--blueColor)/5"
                                                : "order-(--lightBlueColor) hover:border-(--blueColor)/20"
                                        }`}
                                        onClick={() => setSelectedEntry(entry)}
                                    >
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {entry.schoolYearName || "Sin año escolar"}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {entry.level}{entry.section ? ` - ${entry.section}` : ""}
                                                    </p>
                                                </div>
                                                {entry.isCurrentSchool && (
                                                    <Badge className="bg-(--blueColor)/10 text-(--blueColor) border-(--blueColor)/30 text-[10px] px-1.5 py-0.5 shrink-0">
                                                        Actual
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <School className="h-3.5 w-3.5 text-gray-400" />
                                                <p className="text-xs text-gray-500 truncate">
                                                    {entry.schoolName}
                                                </p>
                                            </div>

                                            {entry.isCurrentSchool && entry.averageGrade != null && (
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">Promedio: </span>
                                                        <span className={`font-bold ${
                                                            entry.averageGrade >= 10 ? "text-green-600" :
                                                            entry.averageGrade >= 8 ? "text-yellow-600" :
                                                            "text-red-600"
                                                        }`}>
                                                            {entry.averageGrade.toFixed(1)}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}

                                            {entry.isCurrentSchool && entry.totalSubjects != null && (
                                                <p className="text-xs text-gray-500">
                                                    {entry.totalSubjects} materias · {entry.totalGrades} evaluaciones
                                                </p>
                                            )}

                                            {entry.failedSubjects.length > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                                    <Badge variant="outline" className="text-red-600 border-red-200 text-[10px] px-1.5 py-0.5">
                                                        {entry.failedSubjects.length} reprobada{entry.failedSubjects.length > 1 ? "s" : ""}
                                                    </Badge>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                        </CardContent>

                    </Card>
                )}

                {/* MODAL DETALLE HISTORIAL */}
                <DialogComponent
                    openDialog={selectedEntry !== null}
                    onClose={() => setSelectedEntry(null)}
                    dialogTitle={selectedEntry ? `${selectedEntry.level}${selectedEntry.section ? ` - ${selectedEntry.section}` : ""}` : ""}
                    dialogDescription={selectedEntry ? `${selectedEntry.schoolYearName || "Sin año escolar"} · ${selectedEntry.schoolName}` : ""}
                    className="max-w-3xl"
                >
                    {selectedEntry && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {selectedEntry.isCurrentSchool && selectedEntry.subjects.length > 0 ? (
                                <>
                                    {/* Promedio general */}
                                    {selectedEntry.averageGrade != null && (
                                        <div className="flex items-center gap-3 p-3 bg-(--grayColor)/50 rounded-lg">
                                            <BookOpen className="h-5 w-5 text-(--blueColor)" />
                                            <div>
                                                <p className="text-sm text-gray-500">Promedio General</p>
                                                <p className={`text-lg font-bold ${
                                                    selectedEntry.averageGrade >= 10 ? "text-green-600" :
                                                    selectedEntry.averageGrade >= 8 ? "text-yellow-600" :
                                                    "text-red-600"
                                                }`}>
                                                    {selectedEntry.averageGrade.toFixed(1)} / 20
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Materias */}
                                    <div className="space-y-3">
                                        {selectedEntry.subjects.map((subject, sIdx) => (
                                            <Card key={sIdx} className="border order-(--lightBlueColor)">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="font-semibold text-gray-800">{subject.subjectName}</p>
                                                        {subject.definitiva != null && (
                                                            <span className={`text-sm font-bold ${
                                                                subject.definitiva >= 10 ? "text-green-600" :
                                                                subject.definitiva >= 8 ? "text-yellow-600" :
                                                                "text-red-600"
                                                            }`}>
                                                                {subject.definitiva.toFixed(1)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {subject.grades.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {subject.grades.map((grade, gIdx) => (
                                                                <div key={gIdx} className="flex items-center justify-between text-xs text-gray-600">
                                                                    <span className="truncate mr-2">
                                                                        {grade.topic} ({grade.evaluationType} · {grade.percentage}%)
                                                                    </span>
                                                                    <span className={`font-medium shrink-0 ${
                                                                        grade.score != null
                                                                            ? grade.score >= 10 ? "text-green-600" : grade.score >= 8 ? "text-yellow-600" : "text-red-600"
                                                                            : "text-gray-400"
                                                                    }`}>
                                                                        {grade.score != null ? grade.score.toFixed(1) : "—"}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400">Sin evaluaciones registradas</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <School className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        {selectedEntry.isCurrentSchool
                                            ? "Sin calificaciones detalladas para este año"
                                            : "Escuela anterior · Sin calificaciones registradas en el sistema"
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Materias reprobadas */}
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
                    )}
                </DialogComponent>

                {/* ESTADO */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <Card className="border order-(--lightBlueColor) shadow-sm">

                        <CardContent className="p-6">

                            <div className="flex items-center gap-2 mb-5">

                                <ShieldCheck className="h-5 w-5 text-(--blueColor)" />

                                <h3 className="text-lg font-semibold text-(--blueColor)">
                                    Estado General
                                </h3>

                            </div>

                            <div className="space-y-5">

                                <div className="text-center py-3">

                                    <div className="h-16 w-16 rounded-full bg-(--greenColor)/10 flex items-center justify-center mx-auto mb-3">

                                        <CheckCircle className="h-8 w-8 text-(--greenColor)" />

                                    </div>

                                    <p className="font-semibold text-(--greenColor) text-lg">
                                        Estudiante Regular
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Sin incidencias registradas
                                    </p>

                                </div>

                            </div>

                        </CardContent>

                    </Card>

                </div> */}

            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 bg-white border-t order-(--lightBlueColor) p-4 rounded-b-2xl">

                <div className="flex justify-between items-center flex-wrap gap-4">

                    <div className="text-sm text-gray-500">

                        Última actualización:{" "}
                        {
                            format(
                                new Date(),
                                "dd/MM/yyyy 'a las' HH:mm",
                                { locale: es }
                            )
                        }

                    </div>

                    <div className="flex gap-3">

                        <Button
                            variant="outline"
                            className="order-(--lightBlueColor) text-(--blueColor) hover:bg-(--grayColor)"
                            onClick={() => setScreen("list")}
                        >
                            Cerrar
                        </Button>

                        <Button
                            onClick={() => startEdit(selectedStudent)}
                            className="bg-(--blueColor) hover:bg-(--darkBlueColor) text-white"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Información
                        </Button>

                    </div>

                </div>

            </div>

        </div>

    );

}
