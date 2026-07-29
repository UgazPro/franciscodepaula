import { Loader2 } from "lucide-react";
import { CalendarFieldComponent } from "@/components/form/renderFormComponents/CalendarFieldComponent";
import type { ApprovedSubject } from "../enrollment.schema";

interface LevelSubject {
  id: number;
  subject: { subject: string; code: string | null };
  highSchoolLevel: { level: string };
}

interface Step5RepitienteProps {
  levelSubjects: LevelSubject[];
  loadingSubjects: boolean;
  approvedSubjects: ApprovedSubject[];
  setApprovedSubjects: React.Dispatch<React.SetStateAction<ApprovedSubject[]>>;
  schools: any[];
  selectedSchoolId: number | null;
  setSelectedSchoolId: (id: number | null) => void;
  previousYearEndDate: string;
}

export default function Step5Repitiente({
  levelSubjects,
  loadingSubjects,
  approvedSubjects,
  setApprovedSubjects,
  schools,
  selectedSchoolId,
  setSelectedSchoolId,
  previousYearEndDate,
}: Step5RepitienteProps) {
  const updateSubject = (lsId: number, subjectName: string, patch: Record<string, unknown>) => {
    setApprovedSubjects(prev => {
      const existing = prev.find(a => a.levelSubjectId === lsId);
      const filtered = prev.filter(a => a.levelSubjectId !== lsId);
      filtered.push({
        levelSubjectId: lsId,
        subjectName,
        isRepeating: patch.isRepeating !== undefined ? patch.isRepeating as boolean : existing?.isRepeating ?? false,
        finalScore: patch.finalScore !== undefined ? patch.finalScore as number | undefined : existing?.finalScore,
        typeOf: patch.typeOf !== undefined ? patch.typeOf as ApprovedSubject["typeOf"] : existing?.typeOf,
        approvalDate: patch.approvalDate !== undefined ? patch.approvalDate as string : existing?.approvalDate ?? "",
      });
      return filtered;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Indique las materias aprobadas del año anterior. Las materias con "Cursar" se cursarán este año.
      </p>
      {loadingSubjects ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-(--blueColor)" />
          <span className="ml-2 text-gray-500">Cargando materias...</span>
        </div>
      ) : levelSubjects.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No hay materias para este nivel</p>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Materia</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 w-28">Calificación</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 w-28">Aprobada</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 min-w-[200px]">Fecha de Aprobación</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700 w-20">Cursar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {levelSubjects.map((ls) => {
                const existing = approvedSubjects.find(a => a.levelSubjectId === ls.id);
                const isRepeating = existing?.isRepeating ?? false;
                const finalScore = existing?.finalScore;
                const typeOf = existing?.typeOf;
                const approvalDate = existing?.approvalDate ?? "";

                const isAutoDateType = ["F", "E", "Q", "T"].includes(typeOf ?? "");

                return (
                  <tr key={ls.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium">{ls.subject.subject}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        disabled={isRepeating}
                        value={finalScore ?? ""}
                        placeholder={isRepeating ? "P" : "—"}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "");
                          if (v) {
                            const n = Math.min(20, Math.max(1, parseInt(v)));
                            v = String(n);
                          }
                          updateSubject(ls.id, ls.subject.subject, { finalScore: v ? parseInt(v) : undefined });
                        }}
                        onKeyDown={(e) => {
                          if (["-", "e", "E", ".", ",", "+"].includes(e.key)) e.preventDefault();
                        }}
                        className={`w-20 h-9 px-2 text-center text-sm border rounded focus:outline-none focus:ring-1 focus:ring-(--blueColor) ${isRepeating ? "bg-gray-100 border-gray-300 text-gray-500" : "border-gray-300"}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        disabled={isRepeating}
                        value={typeOf ?? ""}
                        onChange={(e) => {
                          const val = e.target.value as ApprovedSubject["typeOf"] | "";
                          const patch: Record<string, unknown> = { typeOf: val || undefined };
                          if (["F", "E", "Q", "T"].includes(val)) {
                            patch.approvalDate = previousYearEndDate;
                          } else if (val === "P" || val === "R") {
                            patch.approvalDate = "";
                          }
                          updateSubject(ls.id, ls.subject.subject, patch);
                        }}
                        className={`w-24 h-9 px-1 text-center text-sm border rounded focus:outline-none focus:ring-1 focus:ring-(--blueColor) ${isRepeating ? "bg-gray-100 border-gray-300 text-gray-500" : "border-gray-300"}`}
                      >
                        <option value="">—</option>
                        <option value="F">F</option>
                        <option value="R">R</option>
                        <option value="P">P</option>
                        <option value="E">E</option>
                        <option value="Q">Q</option>
                        <option value="T">T</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={isRepeating || isAutoDateType ? "opacity-50 pointer-events-none" : ""}>
                        <CalendarFieldComponent
                          value={approvalDate ? new Date(approvalDate + "T00:00:00") : undefined}
                          onChange={(date) =>
                            updateSubject(ls.id, ls.subject.subject, {
                              approvalDate: date
                                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                : "",
                            })
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isRepeating}
                        onChange={(e) => {
                          updateSubject(ls.id, ls.subject.subject, {
                            isRepeating: e.target.checked,
                            finalScore: undefined,
                            typeOf: undefined,
                            approvalDate: "",
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-(--blueColor) focus:ring-(--blueColor) cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {levelSubjects.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Escuela de Origen <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSchoolId ?? ""}
            onChange={(e) => setSelectedSchoolId(Number(e.target.value) || null)}
            className="w-full max-w-md h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--blueColor)"
          >
            <option value="">Seleccione una escuela...</option>
            {schools.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.schoolName}{s.schoolCity ? ` — ${s.schoolCity}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
