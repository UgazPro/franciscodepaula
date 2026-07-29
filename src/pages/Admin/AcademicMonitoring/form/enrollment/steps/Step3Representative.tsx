import { Search } from "lucide-react";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import type { FormField } from "@/components/form/formComponent.interface";
import type { UseFormReturn } from "react-hook-form";
import type { EnrollmentFormValues } from "../enrollment.schema";
import type { IRepresentative } from "@/services/users/user.interface";
import type { RefObject } from "react";

interface Step3RepresentativeProps {
  form: UseFormReturn<EnrollmentFormValues>;
  f3: Record<string, FormField>;
  representativeMode: string;
  repSearchQuery: string;
  repSearchResults: IRepresentative[];
  repSearchOpen: boolean;
  repHighlightIdx: number;
  repSearchRef: RefObject<HTMLDivElement | null>;
  onRepSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRepKeyDown: (e: React.KeyboardEvent) => void;
  onSelectRepresentative: (rep: IRepresentative) => void;
}

export default function Step3Representative({
  form,
  f3,
  representativeMode,
  repSearchQuery,
  repSearchResults,
  repSearchOpen,
  repHighlightIdx,
  repSearchRef,
  onRepSearchChange,
  onRepKeyDown,
  onSelectRepresentative,
}: Step3RepresentativeProps) {
  const { setValue } = form;

  const representativeModeRenderer = (field: FormField) => {
    if (field.name !== "representativeMode") return null;
    return (
      <div className="space-y-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setValue("representativeMode", "create"); setValue("existingRepresentative", undefined as never); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              representativeMode === "create"
                ? "bg-(--blueColor) text-white shadow-sm"
                : "border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor)"
            }`}
          >
            Nuevo Representante
          </button>
          <button
            type="button"
            onClick={() => { setValue("representativeMode", "existing"); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              representativeMode === "existing"
                ? "bg-(--blueColor) text-white shadow-sm"
                : "border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor)"
            }`}
          >
            Ya existe
          </button>
        </div>
        {form.formState.errors.representativeMode && (
          <p className="text-sm text-red-500">{form.formState.errors.representativeMode.message}</p>
        )}
      </div>
    );
  };

  const existingRepresentativeRenderer = (field: FormField) => {
    if (field.name !== "existingRepresentative" || representativeMode !== "existing") return null;
    return (
      <div ref={repSearchRef} className="space-y-2 relative">
        <label className="text-sm font-medium text-(--darkBlueColor)">Buscar representante por nombre o cédula</label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--lightBlueColor)" />
          <input
            type="text"
            value={repSearchQuery}
            onChange={onRepSearchChange}
            onKeyDown={onRepKeyDown}
            onFocus={() => { if (repSearchResults.length > 0) {} }}
            placeholder="Escriba para buscar..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-(--lightBlueColor)/40 text-sm text-(--darkBlueColor) placeholder:text-(--lightBlueColor) focus:outline-none focus:ring-2 focus:ring-(--blueColor)/30"
          />
        </div>
        {repSearchOpen && repSearchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-(--lightBlueColor)/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {repSearchResults.map((rep, i) => (
              <button
                type="button"
                key={rep.id}
                onMouseDown={() => onSelectRepresentative(rep)}
                className={`w-full text-left px-4 py-3 text-sm transition cursor-pointer ${
                  i === repHighlightIdx
                    ? "bg-(--blueColor)/10 text-(--darkBlueColor)"
                    : "hover:bg-(--grayColor) text-(--darkBlueColor)"
                }`}
              >
                <div className="font-medium">{rep.person.firstNames} {rep.person.lastNames}</div>
                <div className="text-xs text-(--lightBlueColor) flex gap-3 mt-0.5">
                  <span>{rep.person.identificationNumber}</span>
                  <span>{rep.occupation}</span>
                  <span>{rep.studentCount} estudiante(s)</span>
                </div>
              </button>
            ))}
          </div>
        )}
        {form.formState.errors.existingRepresentative && (
          <p className="text-sm text-red-500">{form.formState.errors.existingRepresentative.message as string}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <FieldRenderer field={f3.representativeMode} customFieldRenderer={representativeModeRenderer} />

      {representativeMode === "existing" && (
        <>
          <FieldRenderer field={f3.existingRepresentative} customFieldRenderer={existingRepresentativeRenderer} />
          <FieldRenderer field={f3.representativeRelation} />
        </>
      )}

      {representativeMode !== "existing" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FieldRenderer field={f3.representativeFirstNames} />
          <FieldRenderer field={f3.representativeLastNames} />
          <FieldRenderer field={f3.representativeIdentification} />
          <FieldRenderer field={f3.representativeGender} />
          <FieldRenderer field={f3.representativeBirthDate} />
          <FieldRenderer field={f3.representativeRelation} />
          <FieldRenderer field={f3.representativeEmail} />
          <FieldRenderer field={f3.representativePhone} />
          <FieldRenderer field={f3.representativeProfession} />
        </div>
      )}
    </div>
  );
}
