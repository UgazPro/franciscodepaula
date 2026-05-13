import { useStudentsStore } from "@/stores/students.store";
import { useEffect } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import type { IStudent } from "@/services/users/user.interface";
import { useDeleteStudent } from "@/queries/useUserMutations";
import { studentActionColumns, studentColumns } from "@/services/users/student.tables";
import { useLocation } from "react-router";

interface StudentListViewProps {
    filteredStudents: IStudent[];
}

export default function StudentListView({ filteredStudents }: StudentListViewProps) {

    const location = useLocation();

    const { startEdit, selectedStudent } = useStudentsStore();

    const selectStudent = useStudentsStore((state) => state.selectStudent);

    const { mutateAsync: deleteStudent } = useDeleteStudent();

    const columns = location.pathname.includes("/control-estudio") ? studentActionColumns({ startEdit, deleteStudent, }) : studentColumns();

    useEffect(() => {
        console.log("Selected Student:", selectedStudent);
    }, [selectedStudent]);

    return (

        <div className="rounded-lg border border-gray-300 shadow-sm overflow-hidden bg-white">

            <TableComponent
                data={filteredStudents}
                columns={columns}
                onRowClick={(student) => {
                    selectStudent(student);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
            />

        </div>

    );

}






