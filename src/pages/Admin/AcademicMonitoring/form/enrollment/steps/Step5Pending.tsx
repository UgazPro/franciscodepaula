import { Loader2 } from "lucide-react";
import type { PendingSubject } from "../enrollment.schema";

interface LevelSubject {
  id: number;
  subject: { subject: string; code: string | null };
  highSchoolLevel: { level: string };
}

interface Step5PendingProps {
  levelSubjects: LevelSubject[];
  loadingSubjects: boolean;
  pendingSubjects: PendingSubject[];
  setPendingSubjects: React.Dispatch<React.SetStateAction<PendingSubject[]>>;
  previousLevelName: string | null;
}

export default function Step5Pending({
  levelSubjects,
  loadingSubjects,
  pendingSubjects,
  setPendingSubjects,
  previousLevelName,
}: Step5PendingProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Seleccione las materias reprobadas del nivel anterior{previousLevelName ? ` (${previousLevelName})` : ""} (máximo 2).
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
                <th className="text-center px-4 py-3 font-medium text-gray-700 w-24">Seleccionar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {levelSubjects.map((ls) => {
                const isSelected = pendingSubjects.some(p => p.levelSubjectId === ls.id);
                return (
                  <tr key={ls.id} className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-3 text-gray-800 font-medium">{ls.subject.subject}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isSelected && pendingSubjects.length >= 2}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPendingSubjects(prev => [...prev, { levelSubjectId: ls.id, subjectName: ls.subject.subject }]);
                          } else {
                            setPendingSubjects(prev => prev.filter(p => p.levelSubjectId !== ls.id));
                          }
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
    </div>
  );
}
