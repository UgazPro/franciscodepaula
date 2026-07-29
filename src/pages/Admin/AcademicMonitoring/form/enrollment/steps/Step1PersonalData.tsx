import { Camera, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import type { FormField } from "@/components/form/formComponent.interface";

interface Step1PersonalDataProps {
  studentPhotoPreview: string | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: () => void;
  f1: Record<string, FormField>;
}

export default function Step1PersonalData({ studentPhotoPreview, onPhotoChange, onPhotoRemove, f1 }: Step1PersonalDataProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <div className="flex justify-center md:justify-start">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-(--blueColor) shadow-lg">
              {studentPhotoPreview ? (
                <AvatarImage src={studentPhotoPreview} alt="Foto" />
              ) : (
                <AvatarFallback className="bg-linear-to-br from-(--darkBlueColor) to-(--blueColor) text-white text-2xl">
                  <Camera size={24} />
                </AvatarFallback>
              )}
            </Avatar>
            <label className="absolute -bottom-2 -right-2 p-1.5 bg-(--greenColor) rounded-full cursor-pointer shadow-md hover:brightness-110 transition">
              <Camera size={16} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
            </label>
            {studentPhotoPreview && (
              <button type="button" onClick={onPhotoRemove}
                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full shadow-md hover:bg-red-600 transition">
                <X size={12} className="text-white" />
              </button>
            )}
          </div>
        </div>

        <FieldRenderer field={f1.identificationNumber} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldRenderer field={f1.firstNames} />
        <FieldRenderer field={f1.lastNames} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FieldRenderer field={f1.birthDate} />
        <FieldRenderer field={f1.gender} />
      </div>
    </>
  );
}
