import { useMemo } from "react";
import { Calendar, Mail, Users, Briefcase, GraduationCap, UserCheck, UserX, Loader2 } from "lucide-react";
import { useSearchStore } from "@/stores/search.store";
import { useStudentById, useRepresentativeById } from "@/hooks/useUsers";
import type { IStudent, IRepresentative, StudentEnrollment, StudentRepresentative, RepStudent } from "@/services/users/user.interface";

const roleColors: Record<string, string> = {
  Administrador: "bg-purple-100 text-purple-700",
  Profesor: "bg-blue-100 text-blue-700",
  Representante: "bg-amber-100 text-amber-700",
  Coordinador: "bg-teal-100 text-teal-700",
  Secretario: "bg-pink-100 text-pink-700",
  Estudiante: "bg-blue-100 text-blue-700",
};

function calcAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function PersonDetailView() {
  const { selectedPerson } = useSearchStore();
  const person = selectedPerson;

  const studentId = person?.type === "student" ? person.id : null;
  const repUserId = person?.type === "representative" ? person.id : null;

  const { data: studentDetail, isLoading: loadingStudent } = useStudentById(studentId);
  const { data: repDetail, isLoading: loadingRep } = useRepresentativeById(repUserId);

  const studentData = useMemo(() => {
    if (!studentDetail) return null;
    if (typeof studentDetail === "object" && "success" in studentDetail && studentDetail.success) {
      return studentDetail.data;
    }
    return studentDetail as IStudent;
  }, [studentDetail]);

  const repData = useMemo(() => {
    if (!repDetail) return null;
    if (typeof repDetail === "object" && "success" in repDetail && repDetail.success) {
      return repDetail.data;
    }
    return repDetail as IRepresentative;
  }, [repDetail]);

  if (!person) return null;

  const initials = `${person.person.firstNames.charAt(0)}${person.person.lastNames.charAt(0)}`;
  const roleLabel = person.type === "student" ? "Estudiante" : person.role ?? "—";
  const colorClass = roleColors[roleLabel] || "bg-gray-100 text-gray-700";
  const isActive = person.type === "student" ? person.studentStatus : person.userStatus;
  const birthDate = person.person.birthDate;
  const age = birthDate ? calcAge(birthDate) : null;

  const enrollments = studentData?.enrollments ?? [];
  const activeEnrollment = enrollments.find((e: StudentEnrollment) => e.status === true);
  const representatives = studentData?.representatives ?? [];

  const linkedStudents = repData?.representative?.students ?? [];

  return (
    <>
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 bg-linear-to-br from-(--blueColor) to-(--darkBlueColor) rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-md">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-800">
              {person.person.firstNames} {person.person.lastNames}
            </h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colorClass}`}>
              {roleLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-sm text-gray-500">
              {person.person.identificationNumber}
            </span>
            {isActive !== undefined && (
              isActive ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  <UserCheck size={12} />
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  <UserX size={12} />
                  Inactivo
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-(--blueColor) mb-3">
            <Calendar size={16} />
            <span className="text-sm font-semibold text-gray-700">Informaci&oacute;n Personal</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fecha de Nacimiento</span>
              <span className="font-medium text-gray-800">
                {birthDate ? new Date(birthDate).toLocaleDateString("es-ES") : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Edad</span>
              <span className="font-medium text-gray-800">{age !== null ? `${age} años` : "—"}</span>
            </div>
            {person.person.gender && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">G&eacute;nero</span>
                <span className="font-medium text-gray-800 capitalize">{person.person.gender}</span>
              </div>
            )}
          </div>
        </div>

        {person.type !== "student" && (person.email || person.phone) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-(--blueColor) mb-3">
              <Mail size={16} />
              <span className="text-sm font-semibold text-gray-700">Contacto</span>
            </div>
            <div className="space-y-2.5">
              {person.email && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-800">{person.email}</span>
                </div>
              )}
              {person.phone && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tel&eacute;fono</span>
                  <span className="font-medium text-gray-800">{person.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {person.type === "student" && (
        <>
          {loadingStudent ? (
            <div className="flex items-center justify-center gap-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Cargando detalles del estudiante...
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4">
                <div className="flex items-center gap-2 text-(--blueColor) mb-3">
                  <GraduationCap size={16} />
                  <span className="text-sm font-semibold text-gray-700">Inscripci&oacute;n</span>
                </div>
                {activeEnrollment ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                      Inscrito
                    </span>
                    <span className="text-sm text-gray-500">
                      {activeEnrollment.section?.highSchoolLevel?.level ?? ""} - {activeEnrollment.section?.section ?? ""}
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    No inscrito
                  </span>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4">
                <div className="flex items-center gap-2 text-(--blueColor) mb-3">
                  <Users size={16} />
                  <span className="text-sm font-semibold text-gray-700">Representantes</span>
                </div>
                {representatives.length > 0 ? (
                  <div className="space-y-2">
                    {representatives.map((sr: StudentRepresentative) => (
                      <div key={sr.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-800">
                            {sr.representative.user.person.firstNames} {sr.representative.user.person.lastNames}
                          </span>
                          <span className="text-gray-400 ml-2">({sr.relationship ?? "—"})</span>
                        </div>
                        {sr.isPrimary && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Principal</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No tiene representantes asignados</p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {person.type === "representative" && (
        <>
          {loadingRep ? (
            <div className="flex items-center justify-center gap-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Cargando detalles del representante...
            </div>
          ) : (
            <>
              {(person.occupation || repData?.representative?.occupation) && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4">
                  <div className="flex items-center gap-2 text-(--blueColor) mb-3">
                    <Briefcase size={16} />
                    <span className="text-sm font-semibold text-gray-700">Ocupaci&oacute;n</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {person.occupation || repData?.representative?.occupation}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-4">
                <div className="flex items-center gap-2 text-(--blueColor) mb-3">
                  <GraduationCap size={16} />
                  <span className="text-sm font-semibold text-gray-700">Estudiantes</span>
                </div>
                {linkedStudents.length > 0 ? (
                  <div className="space-y-2">
                    {linkedStudents.map((sr: RepStudent) => (
                      <div key={sr.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-800">
                          {sr.student.person.firstNames} {sr.student.person.lastNames}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">({sr.relationship ?? "—"})</span>
                          {sr.student.status ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Inactivo</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No tiene estudiantes vinculados</p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
