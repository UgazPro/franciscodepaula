import type { IStudent } from "@/services/users/user.interface";
import { calculateAge } from "@/helpers/formatter";

interface StudentCardViewProps {
    filteredStudents: IStudent[];
    onStudentClick: (student: IStudent) => void;
}

export default function StudentCardView({ filteredStudents, onStudentClick }: StudentCardViewProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredStudents.map((student) => {
                const enrollment = student.enrollments?.[0];
                const rep = student.representatives?.[0]?.representative;

                return (
                    <div
                        key={student.id}
                        onClick={() => {
                            onStudentClick(student);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {student.person.firstNames.charAt(0)}
                                    {student.person.lastNames.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-800 truncate">
                                        {student.person.firstNames} {student.person.lastNames}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {calculateAge(student.person.birthDate)} años
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                    student.status
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {student.status ? "Activo" : "Inactivo"}
                            </span>
                        </div>

                        <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-xs text-gray-400 w-20 shrink-0">Cédula:</span>
                                <span className="font-mono text-gray-800">{student.person.identificationNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-xs text-gray-400 w-20 shrink-0">Grado:</span>
                                <span className="font-medium text-gray-800">
                                    {enrollment
                                        ? `${enrollment.section.highSchoolLevel.level} - ${enrollment.section.section}`
                                        : "Sin asignar"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-xs text-gray-400 w-20 shrink-0">Rep.:</span>
                                <span className="text-gray-600 truncate">
                                    {rep
                                        ? `${rep.user.person.firstNames} ${rep.user.person.lastNames}`
                                        : "Sin representante"}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
