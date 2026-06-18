import { Search, ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  representativeCreateSchema,
  representativeEditSchema,
  type RepresentativeFormValues,
} from "@/services/users/representative.schema";
import {
  representativeFields,
} from "@/services/users/representativeForm.data";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { useCreateRepresentative, useUpdateRepresentative } from "@/queries/useRepresentativeMutations";
import { searchStudents } from "@/services/users/user.service";
import type { IRepresentative, IStudent } from "@/services/users/user.interface";
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface RepresentativeFormProps {
  mode: "create" | "edit";
  selectedRepresentative?: IRepresentative | null;
  onClose: () => void;
}

const fieldsByName = Object.fromEntries(
  representativeFields.map((f) => [f.name, f])
);

export default function RepresentativeForm({ mode, selectedRepresentative, onClose }: RepresentativeFormProps) {
  const { mutateAsync: createRepresentative } = useCreateRepresentative();
  const { mutateAsync: updateRepresentative } = useUpdateRepresentative();

  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState<IStudent[]>([]);
  const [studentSearchOpen, setStudentSearchOpen] = useState(false);
  const [studentHighlightIdx, setStudentHighlightIdx] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const studentSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const form = useForm<RepresentativeFormValues>({
    resolver: zodResolver(mode === "create" ? representativeCreateSchema : representativeEditSchema),
    defaultValues: {
      firstNames: "",
      lastNames: "",
      identificationNumber: "",
      birthDate: new Date(),
      gender: "",
      email: "",
      phone: "",
      occupation: "",
      studentId: undefined,
      relationship: "",
    },
  });

  const { setValue } = form;

  useEffect(() => {
    if (mode !== "edit" || !selectedRepresentative) return;
    form.reset({
      firstNames: selectedRepresentative.person.firstNames,
      lastNames: selectedRepresentative.person.lastNames,
      identificationNumber: selectedRepresentative.person.identificationNumber,
      birthDate: selectedRepresentative.person.birthDate ? new Date(selectedRepresentative.person.birthDate) : new Date(),
      gender: selectedRepresentative.person.gender ?? "",
      email: selectedRepresentative.email,
      phone: selectedRepresentative.phone ?? "",
      occupation: selectedRepresentative.occupation ?? "",
      relationship: (selectedRepresentative as any).relationship ?? "",
    });
  }, [mode, selectedRepresentative]);

  const updateDropdownPosition = useCallback(() => {
    if (searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 320),
        zIndex: 9999,
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (studentSearchOpen) {
      updateDropdownPosition();
    }
  }, [studentSearchOpen, studentSearchResults, updateDropdownPosition]);

  useEffect(() => {
    if (!studentSearchOpen) return;
    window.addEventListener("scroll", updateDropdownPosition, { passive: true });
    return () => window.removeEventListener("scroll", updateDropdownPosition);
  }, [studentSearchOpen, updateDropdownPosition]);

  const fetchStudents = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchStudents(query || undefined);
      setStudentSearchResults(results ?? []);
      setStudentSearchOpen(true);
      setStudentHighlightIdx(-1);
    } catch {
      setStudentSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleStudentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setStudentSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchStudents(q), 300);
  };

  const selectStudent = (student: IStudent) => {
    setValue("studentId", student.id);
    setStudentSearchQuery(`${student.person.firstNames} ${student.person.lastNames} - ${student.person.identificationNumber}`);
    setStudentSearchOpen(false);
    setStudentSearchResults([]);
  };

  const handleStudentKeyDown = (e: React.KeyboardEvent) => {
    if (!studentSearchOpen || studentSearchResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setStudentHighlightIdx((prev) => (prev < studentSearchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setStudentHighlightIdx((prev) => (prev > 0 ? prev - 1 : studentSearchResults.length - 1));
    } else if (e.key === "Enter" && studentHighlightIdx >= 0) {
      e.preventDefault();
      selectStudent(studentSearchResults[studentHighlightIdx]);
    } else if (e.key === "Escape") {
      setStudentSearchOpen(false);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        studentSearchRef.current &&
        !studentSearchRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("#student-search-dropdown")
      ) {
        setStudentSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const sendForm = async (data: RepresentativeFormValues) => {
    const payload: any = {
      profilePhoto: "",
      firstNames: data.firstNames,
      lastNames: data.lastNames,
      identificationNumber: data.identificationNumber,
      birthDate: data.birthDate,
      gender: data.gender,
      email: data.email,
      phone: data.phone ?? "",
      occupation: data.occupation ?? "",
    };

    try {
      if (mode === "create") {
        payload.studentId = data.studentId;
        payload.relationship = data.relationship;
        await createRepresentative({ data: payload });
      } else {
        payload.relationship = data.relationship;
        await updateRepresentative({
          id: selectedRepresentative!.id,
          data: payload,
        });
      }
      onClose();
    } catch (error: any) {
      console.log(error);
    }
  };

  const f = fieldsByName;

  const showDropdown = studentSearchOpen && studentSearchQuery.length >= 2;

  return (
    <div className="h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-(--lightBlueColor)/20">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-(--grayColor) rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={20} className="text-(--darkBlueColor)" />
          </button>
          <h2 className="text-lg font-semibold text-(--darkBlueColor)">
            {mode === "create" ? "Crear Representante" : "Editar Representante"}
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(sendForm)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldRenderer field={f.firstNames} />
              <FieldRenderer field={f.lastNames} />
              <FieldRenderer field={f.identificationNumber} />
              <FieldRenderer field={f.occupation} />
              <FieldRenderer field={f.birthDate} />
              <FieldRenderer field={f.gender} />
              <FieldRenderer field={f.email} />
              <FieldRenderer field={f.phone} />
            </div>

            {mode === "create" && (
              <div className="mt-6 pt-6 border-t border-(--lightBlueColor)/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div ref={studentSearchRef} className="space-y-2 relative">
                    <label className="text-sm font-medium text-(--darkBlueColor) block">
                      Buscar estudiante para vincular <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--lightBlueColor)" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={studentSearchQuery}
                        onChange={handleStudentSearchChange}
                        onKeyDown={handleStudentKeyDown}
                        onFocus={() => { if (studentSearchResults.length > 0) setStudentSearchOpen(true); }}
                        placeholder="Escriba para buscar estudiante..."
                        className="w-full pl-10 pr-4 h-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor)/30 focus:border-transparent border-(--lightBlueColor)/30 text-sm text-(--darkBlueColor) placeholder:text-(--lightBlueColor)"
                      />
                    </div>
                    {form.formState.errors.studentId && (
                      <p className="text-sm text-red-500">{form.formState.errors.studentId.message as string}</p>
                    )}
                  </div>
                  <FieldRenderer field={f.relationship} />
                </div>
              </div>
            )}

            {mode === "edit" && (
              <div className="mt-6 pt-6 border-t border-(--lightBlueColor)/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRenderer field={f.relationship} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-(--lightBlueColor)/20">
              <Button
                type="button" variant="outline"
                className="border-(--lightBlueColor) text-(--darkBlueColor) hover:bg-(--grayColor) cursor-pointer"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer"
              >
                {mode === "create" ? "Crear representante" : "Actualizar representante"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {showDropdown && createPortal(
        <div
          id="student-search-dropdown"
          style={dropdownStyle}
          className="bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
        >
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              Buscando...
            </div>
          ) : studentSearchResults.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">
              No se encontraron resultados
            </div>
          ) : (
            <div className="max-h-[180px] overflow-y-auto [overflow-anchor:none]">
              {studentSearchResults.map((student, i) => (
                <button
                  type="button"
                  key={student.id}
                  onMouseDown={() => selectStudent(student)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 text-left ${
                    i === studentHighlightIdx ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="w-9 h-9 bg-linear-to-br from-(--blueColor) to-(--darkBlueColor) rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {student.person.firstNames.charAt(0)}
                    {student.person.lastNames.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {student.person.firstNames} {student.person.lastNames}
                    </p>
                    <p className="text-xs text-gray-400">
                      {student.person.identificationNumber}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 bg-blue-100 text-blue-700">
                    Estudiante
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
