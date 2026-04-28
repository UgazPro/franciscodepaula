import type { Column } from "@/components/table/TableComponent";
import { Edit, Trash2 } from "lucide-react";
import type { IStudent } from "./user.interface";
import { DeleteDialog } from "@/components/dialog/DeleteDialogComponent";
import { calculateAge } from "@/helpers/formatter";

interface Actions {
    startEdit: (student: IStudent) => void;
    deleteStudent: (id: number) => void;
}

export const studentColumns = ({ startEdit, deleteStudent }: Actions): Column<IStudent>[] => [
    {
        header: "Estudiante",
        render: (student) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    {student.person.firstNames.charAt(0)}
                    {student.person.lastNames.charAt(0)}
                </div>
                <div>
                    <p className="font-medium text-gray-800">
                        {student.person.firstNames} {student.person.lastNames}
                    </p>
                    <p className="text-xs text-gray-400">
                        {calculateAge(student.person.birthDate)} años
                    </p>
                </div>
            </div>
        ),
    },
    {
        header: "Identificación",
        render: (student) => (
            <span className="font-mono text-gray-800">{student.person.identificationNumber}</span>
        ),
    },
    // {
    //     header: "Grado/Sección",
    //     render: (student) => (
    //         <>
    //             <span className="font-medium text-gray-800">
    //                 {student.sectionId}
    //             </span>
    //             <span className="text-gray-400 ml-1">
    //                 - Sección {student.sectionId}
    //             </span>
    //         </>
    //     ),
    // },
    // {
    //     header: "Representante",
    //     accessor: "id",
    //     className: "text-gray-600",
    // },
    // {
    //     header: "Contacto",
    //     render: (student) => (
    //         <>
    //             <p className="text-sm text-gray-600">{student.telefono}</p>
    //             <p className="text-xs text-gray-400">{student.email}</p>
    //         </>
    //     ),
    // },
    // {
    //     header: "Promedio",
    //     render: (student) => (
    //         <div className="flex items-center gap-2">
    //             <div className="w-12 bg-gray-200 rounded-full h-1.5">
    //                 <div
    //                     className="bg-green-500 h-1.5 rounded-full"
    //                     style={{ width: `${student.promedio}%` }}
    //                 />
    //             </div>
    //             <span className="text-sm font-medium">
    //                 {student.promedio}%
    //             </span>
    //         </div>
    //     ),
    // },
    {
        header: "Estado",
        render: (student) => (
            <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}
            >
                {student.status ? 'Activo' : 'Inactivo'}
            </span>
        ),
    },
    {
        header: "Acciones",
        headerClassName: "text-right",
        className: "text-right",
        render: (student) => (
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        startEdit(student);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                    <Edit size={16} />
                </button>
                <DeleteDialog
                    preposition="a"
                    whatsDeleting={`${student.person.firstNames} ${student.person.lastNames}`}
                    onConfirm={() => deleteStudent(student.id)}
                />
            </div>
        ),
    },
];