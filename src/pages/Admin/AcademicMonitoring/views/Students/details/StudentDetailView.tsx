import { X, User, CheckCircle, XCircle, GraduationCap, Edit } from "lucide-react";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useStudentsStore } from "@/stores/students.store";
import { useAcademicHistory } from "@/hooks/useAcademicHistory";

import StudentInfo from "./views/StudentInfo";
import RepresentativeInfo from "./views/RepresentativeInfo";
import AcademicHistoryInfo from "./views/AcademicHistoryInfo";

export default function StudentDetailView() {

    const {
        selectedStudent,
        setScreen,
        startEdit,
    } = useStudentsStore();

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

                <StudentInfo
                    selectedStudent={selectedStudent}
                    person={person}
                    fullName={fullName}
                />

                <RepresentativeInfo
                    representatives={selectedStudent.representatives || []}
                />

                <AcademicHistoryInfo
                    academicHistory={academicHistory}
                />

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
