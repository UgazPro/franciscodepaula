import { User, MapPin, School, Cake, Clock, Globe, Map, Landmark } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import {
    calculateMartialTime,
    dateFormatterIntoLong,
} from "@/helpers/formatter";

interface StudentInfoProps {
    selectedStudent: any;
    person: any;
    fullName: string;
}

export default function StudentInfo({ selectedStudent, person, fullName }: StudentInfoProps) {

    return (

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

    );

}
