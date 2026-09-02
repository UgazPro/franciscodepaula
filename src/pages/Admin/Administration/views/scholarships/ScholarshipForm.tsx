import { useState, useEffect } from "react";
import { useForm, FormProvider, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { scholarshipFormFields } from "./scholarship.fields";
import StudentAutocomplete from "./StudentAutocomplete";
import { useCreateScholarship, useUpdateScholarship } from "@/queries/useScholarshipMutations";
import type { StudentScholarshipResponse } from "@/services/administration/scholarships.types";
import type { IStudent } from "@/services/users/user.interface";

const scholarshipSchema = z.object({
  amount: z.coerce.number({ error: "Ingrese el monto de la beca" }).int("Solo se permiten números enteros").positive("El monto debe ser mayor a 0"),
  startDate: z.date({ error: "Seleccione una fecha de inicio" }),
  endDate: z.date().optional().nullable(),
  reason: z.string().optional(),
});

type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;

interface ScholarshipFormProps {
  scholarship: StudentScholarshipResponse | null;
  schoolYearId: number;
  assignedById: number;
  onBack: () => void;
}

export default function ScholarshipForm({ scholarship, schoolYearId, assignedById, onBack }: ScholarshipFormProps) {
  const isEditing = !!scholarship;
  const { mutateAsync: createScholarship } = useCreateScholarship();
  const { mutateAsync: updateScholarship } = useUpdateScholarship();

  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);

  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipSchema) as Resolver<ScholarshipFormValues>,
    defaultValues: {
      amount: undefined as never,
      startDate: new Date(),
      endDate: null,
      reason: "",
    },
  });

  useEffect(() => {
    if (scholarship) {
      setSelectedStudent({
        id: scholarship.student.id,
        personId: scholarship.student.personId,
        status: scholarship.student.status,
        person: scholarship.student.person,
      } as IStudent);
      form.setValue("amount", Number(scholarship.amount));
      form.setValue("startDate", new Date(scholarship.startDate));
      form.setValue("endDate", scholarship.endDate ? new Date(scholarship.endDate) : null);
      form.setValue("reason", scholarship.reason ?? "");
    } else {
      setSelectedStudent(null);
      form.reset();
    }
  }, [scholarship, form]);

  const onSubmit = async (data: ScholarshipFormValues) => {
    if (!selectedStudent) return;
    try {
      if (isEditing) {
        await updateScholarship({
          id: scholarship.id,
          data: {
            amount: data.amount,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate?.toISOString() ?? undefined,
            reason: data.reason,
          },
        });
      } else {
        await createScholarship({
          studentId: selectedStudent.id,
          schoolYearId,
          amount: data.amount,
          assignedById,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate?.toISOString(),
          reason: data.reason,
        });
      }
      onBack();
    } catch {
      // interceptor handles the toast
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-(--grayColor) rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={20} className="text-(--darkBlueColor)" />
          </button>
          <h2 className="text-lg font-semibold text-(--darkBlueColor)">
            {isEditing ? "Editar Beca" : "Asignar Beca"}
          </h2>
        </div>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                Estudiante <span className="text-red-500">*</span>
              </label>
              <StudentAutocomplete
                onSelect={setSelectedStudent}
                selectedStudent={selectedStudent}
                onClear={() => setSelectedStudent(null)}
                disabled={isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-(--darkBlueColor) mb-1">
                Beca ($) <span className="text-red-500">*</span>
              </label>
              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const filtered = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(filtered === "" ? "" : Number(filtered));
                        }}
                        onKeyDown={(e) => {
                          if ([".", ",", "-", "e", "E", "+", " "].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        disabled={isEditing}
                        placeholder="0"
                        className={`w-full pl-7 pr-4 h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent ${
                          fieldState.error ? "border-red-500" : "border-(--lightBlueColor)/30"
                        } ${isEditing ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
                      />
                    </div>
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRenderer field={scholarshipFormFields[1]} disabled={isEditing} />
            <FieldRenderer field={scholarshipFormFields[2]} />
          </div>

          <FieldRenderer field={scholarshipFormFields[3]} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onBack} className="cursor-pointer">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedStudent || form.formState.isSubmitting}
              className="bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md cursor-pointer disabled:opacity-50"
            >
              {form.formState.isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Asignar"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
