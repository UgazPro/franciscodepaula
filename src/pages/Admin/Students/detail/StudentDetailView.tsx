import { X, User, MapPin, Cake, Calendar, Clock, CheckCircle, XCircle, School, History, ChevronRight, Edit, GraduationCap, Globe, Map, Landmark, ShieldCheck, BookOpen, Activity } from "lucide-react";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { useStudentsStore } from "@/stores/students.store";

import {
    calculateMartialTime,
    dateFormatterIntoLong,
} from "@/helpers/formatter";

export default function StudentDetailView() {

    const {
        selectedStudent,
        setScreen,
        openForm,
    } = useStudentsStore();

    if (!selectedStudent) return null;

    const person = selectedStudent.person;

    const fullName = `${person.firstNames} ${person.lastNames}`;

    return (

        <div className="min-h-full p-6 relative w-full max-w-6xl mx-auto my-6 bg-white shadow-xl border order-(--lightBlueColor) rounded-2xl">

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
            <div className="p-6 space-y-6">

                {/* GRID 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* PERSONAL */}
                    <Card className="border order-(--lightBlueColor) shadow-sm">

                        <CardContent className="p-6">

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

                        <CardContent className="p-6">

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

                </div>

                {/* GRID 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ACADEMICO */}
                    <Card className="border order-(--lightBlueColor) shadow-sm">

                        <CardContent className="p-6">

                            <div className="flex items-center gap-2 mb-5">

                                <School className="h-5 w-5 text-(--blueColor)" />

                                <h3 className="text-lg font-semibold text-(--blueColor)">
                                    Información Académica
                                </h3>

                            </div>

                            <div className="space-y-5">

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">
                                        Fecha de Admisión
                                    </p>

                                    <div className="flex items-center gap-2">

                                        <Calendar className="h-4 w-4 text-(--blueColor)" />

                                        <p className="font-medium text-gray-800">
                                            {dateFormatterIntoLong(selectedStudent.admissionDate)}
                                        </p>

                                    </div>

                                </div>

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">
                                        Escuela Previa
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {selectedStudent.previousSchool || "No registrada"}
                                    </p>

                                </div>

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">
                                        Sección
                                    </p>

                                    <Badge className="bg-(--blueColor)/10 text-(--blueColor) border-(--blueColor)/20">
                                        {selectedStudent.sectionId
                                            ? `Sección ${selectedStudent.sectionId}`
                                            : "Sin asignar"}
                                    </Badge>

                                </div>

                            </div>

                        </CardContent>

                    </Card>

                    {/* ASISTENCIA */}
                    <Card className="border order-(--lightBlueColor) shadow-sm">

                        <CardContent className="p-6">

                            <div className="flex items-center justify-between mb-5">

                                <div className="flex items-center gap-2">

                                    <Activity className="h-5 w-5 text-(--blueColor)" />

                                    <h3 className="text-lg font-semibold text-(--blueColor)">
                                        Asistencia
                                    </h3>

                                </div>

                                <Badge className="bg-(--greenColor)/10 text-(--greenColor) border-(--greenColor)/20">
                                    92%
                                </Badge>

                            </div>

                            <div className="space-y-4">

                                <Progress
                                    value={92}
                                    className="h-3"
                                />

                                <p className="text-sm text-gray-600">
                                    Excelente rendimiento de asistencia.
                                </p>

                                <div className="pt-2 border-t border-gray-200">

                                    <div className="flex items-center justify-between">

                                        <span className="text-sm text-gray-500">
                                            Clases asistidas
                                        </span>

                                        <span className="font-semibold text-(--blueColor)">
                                            48
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </CardContent>

                    </Card>

                    {/* ESTADO */}
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

                </div>

                {/* HISTORIAL */}
                <Card className="border order-(--lightBlueColor) shadow-sm">

                    <CardContent className="p-6">

                        <div className="flex items-center justify-between mb-6">

                            <div className="flex items-center gap-2">

                                <History className="h-5 w-5 text-(--blueColor)" />

                                <h3 className="text-lg font-semibold text-(--blueColor)">
                                    Historial Académico
                                </h3>

                            </div>

                            <Badge
                                variant="outline"
                                className="order-(--lightBlueColor) text-(--blueColor)"
                            >
                                Próximamente dinámico
                            </Badge>

                        </div>

                        <div className="space-y-3">

                            {[
                                "Inscripción completada",
                                "Asignación de sección",
                                "Entrega de documentos",
                            ].map((item, index) => (

                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-4 rounded-xl border order-(--lightBlueColor) bg-(--grayColor) hover:bg-(--lightBlueColor)/10 transition"
                                >

                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">

                                        <BookOpen className="h-5 w-5 text-(--blueColor)" />

                                    </div>

                                    <div className="flex-1">

                                        <p className="font-medium text-(--blueColor)">
                                            {item}
                                        </p>

                                    </div>

                                    <ChevronRight className="h-4 w-4 text-gray-400" />

                                </div>

                            ))}

                        </div>

                    </CardContent>

                </Card>

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
                            onClick={() => console.log("Editar información")}
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