import { useState, useMemo, useEffect } from "react";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { TableComponent } from "@/components/table/TableComponent";
import { PaginationComponent } from "@/components/table/PaginationComponent";
import { useStaff, useRoles } from "@/hooks/useUsers";
import { useCreateEmployee, useUpdateEmployee } from "@/queries/useEmployeeMutations";
import { employeeSchema, type EmployeeFormValues } from "@/services/employee/employee.schema";
import { employeeFieldsByName } from "@/services/employee/employeeForm.data";
import { employeeColumns } from "@/services/employee/employee.tables";
import SearchFilterComponent from "@/components/filters/SearchFilter";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";
import type { IStaff } from "@/services/users/user.interface";

export default function Employees() {
  const { data: employees = [], isLoading } = useStaff();
  const { data: roles = [] } = useRoles();
  const { mutateAsync: createEmployee } = useCreateEmployee();
  const { mutateAsync: updateEmployee } = useUpdateEmployee();

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<IStaff | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const allEmployees = employees as IStaff[];

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return allEmployees;
    const q = searchTerm.toLowerCase();
    return allEmployees.filter(
      (emp) =>
        emp.person.firstNames.toLowerCase().includes(q) ||
        emp.person.lastNames.toLowerCase().includes(q) ||
        emp.person.identificationNumber.includes(q)
    );
  }, [allEmployees, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredEmployees.length, itemsPerPage]);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstNames: "",
      lastNames: "",
      identificationNumber: "",
      birthDate: undefined as never,
      gender: "",
      email: "",
      phone: "",
      roleId: undefined as never,
      hireDate: undefined as never,
    },
  });

  useEffect(() => {
    if (formMode === "edit" && selectedEmployee) {
      form.reset({
        firstNames: selectedEmployee.person.firstNames,
        lastNames: selectedEmployee.person.lastNames,
        identificationNumber: selectedEmployee.person.identificationNumber,
        birthDate: new Date(selectedEmployee.person.birthDate),
        gender: selectedEmployee.person.gender,
        email: selectedEmployee.email,
        phone: selectedEmployee.phone ?? "",
        roleId: selectedEmployee.userRoles[0]?.roleId,
        hireDate: selectedEmployee.employee?.hireDate ? new Date(selectedEmployee.employee.hireDate) : undefined as never,
      });
    }
  }, [formMode, selectedEmployee, form]);

  const handleCreate = () => {
    form.reset({
      firstNames: "",
      lastNames: "",
      identificationNumber: "",
      birthDate: undefined as never,
      gender: "",
      email: "",
      phone: "",
      roleId: undefined as never,
      hireDate: undefined as never,
    });
    setSelectedEmployee(null);
    setFormMode("create");
  };

  const handleEdit = (emp: IStaff) => {
    setSelectedEmployee(emp);
    setFormMode("edit");
  };

  const handleBack = () => {
    setFormMode(null);
    setSelectedEmployee(null);
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      const payload = {
        profilePhoto: formMode === "edit" ? selectedEmployee!.person.profilePhoto ?? "" : "",
        firstNames: data.firstNames,
        lastNames: data.lastNames,
        identificationNumber: data.identificationNumber,
        birthDate: data.birthDate,
        gender: data.gender,
        email: data.email,
        phone: data.phone ?? "",
        roleId: data.roleId,
        password: data.identificationNumber,
        hireDate: data.hireDate,
      };

      if (formMode === "edit" && selectedEmployee) {
        await updateEmployee({ id: selectedEmployee.id, data: payload });
      } else {
        await createEmployee({ data: payload });
      }
      handleBack();
    } catch {
      // interceptor handles the toast
    }
  };

  const f = employeeFieldsByName;

  const roleField = useMemo(() => ({
    ...employeeFieldsByName.roleId,
    options: (roles as { id: number; role: string }[]).map((r) => ({ label: r.role, value: r.id })),
  }), [roles]);

  const listView = (
    <div className="">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
        <SearchFilterComponent
          searchTerm={searchTerm}
          setSearchTerm={(term) => { setSearchTerm(term); setCurrentPage(1); }}
          placeHolder="Buscar por nombre, apellido o cédula..."
          width="w-92"
        />
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium cursor-pointer"
        >
          <Plus size={18} />
          Crear empleado
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin" />
          Cargando empleados...
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          {searchTerm ? "No se encontraron empleados" : "No hay empleados registrados"}
        </div>
      ) : (
        <>
          <TableComponent
            data={paginatedEmployees as IStaff[]}
            columns={employeeColumns(handleEdit)}
            maxHeight={455}
          />
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredEmployees.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
          />
        </>
      )}
    </div>
  );

  const formView = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-(--lightBlueColor)/20">
        <button type="button" onClick={handleBack} className="p-2 hover:bg-(--grayColor) rounded-lg transition cursor-pointer">
          <ArrowLeft size={20} className="text-(--darkBlueColor)" />
        </button>
        <h2 className="text-lg font-semibold text-(--darkBlueColor)">
          {formMode === "create" ? "Crear Empleado" : "Editar Empleado"}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldRenderer field={f.firstNames} />
            <FieldRenderer field={f.lastNames} />
            <FieldRenderer field={f.identificationNumber} />
            <FieldRenderer field={roleField} />
            <FieldRenderer field={f.birthDate} />
            <FieldRenderer field={f.gender} />
            <FieldRenderer field={f.hireDate} />
            <FieldRenderer field={f.email} />
            <FieldRenderer field={f.phone} />
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-(--lightBlueColor)/20">
            <Button type="button" variant="outline"
              className="border-(--lightBlueColor) text-(--darkBlueColor) hover:bg-(--grayColor) cursor-pointer"
              onClick={handleBack}>
              Cancelar
            </Button>
            <Button type="submit"
              className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer">
              {formMode === "create" ? "Crear empleado" : "Actualizar empleado"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  return (
    <PageTransitionComponent
      primaryChildren={listView}
      secondaryChildren={formView}
      toggle={!!formMode}
    />
  );
}
