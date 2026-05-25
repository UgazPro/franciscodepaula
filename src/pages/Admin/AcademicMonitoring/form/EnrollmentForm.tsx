import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { User,  FileText,  UserCheck,  ChevronLeft,  ChevronRight,  Check, Camera, X, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ==================== ESQUEMAS DE VALIDACIÓN ====================

const step1Schema = z.object({
  // Datos Personales
  firstNames: z.string().min(2, "Los nombres son requeridos"),
  lastNames: z.string().min(2, "Los apellidos son requeridos"),
  identificationNumber: z.string().min(6, "La cédula es requerida"),
  birthDate: z.string().or(z.date()),
  gender: z.string().min(1, "Seleccione un género"),
  profilePhoto: z.string().optional(),
});

const step2Schema = z.object({
  // Datos Generales
  birthCountry: z.string().min(2, "El país de nacimiento es requerido"),
  state: z.string().min(2, "El estado es requerido"),
  parish: z.string().min(2, "La parroquia es requerida"),
  address: z.string().min(5, "La dirección es requerida"),
  previousSchool: z.string().optional(),
  admissionDate: z.string().or(z.date()),
});

const step3Schema = z.object({
  // Datos del Representante
  representativeFirstNames: z.string().min(2, "Los nombres del representante son requeridos"),
  representativeLastNames: z.string().min(2, "Los apellidos del representante son requeridos"),
  representativeIdentification: z.string().min(6, "La cédula del representante es requerida"),
  representativeBirthDate: z.string().or(z.date()),
  representativeGender: z.string().min(1, "Seleccione el género"),
  representativeEmail: z.string().email("Email inválido"),
  representativePhone: z.string().min(10, "Teléfono requerido"),
  representativeRelation: z.string().min(2, "Indique la relación con el estudiante"),
  representativeProfession: z.string().optional(),
  representativePhoto: z.string().optional(),
});

const studentWizardSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type StudentWizardFormValues = z.infer<typeof studentWizardSchema>;

interface EnrollmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StudentWizardFormValues) => Promise<void>;
  initialData?: Partial<StudentWizardFormValues>;
  mode?: "create" | "edit";
  step: number;
  setStep: (step: number) => void;
}

// Datos de ejemplo para selects
const countries = ["Venezuela", "Colombia", "España", "Argentina", "México", "Perú", "Chile", "Ecuador"];
const states = ["Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", "Cojedes", "Delta Amacuro", "Falcón", "Guárico", "La Guaira", "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo", "Yaracuy", "Zulia", "Distrito Capital"];
const parishes = ["Altagracia", "Antímano", "Candelaria", "Caricuao", "Catedral", "Coche", "El Junquito", "El Paraíso", "El Recreo", "El Valle", "La Pastora", "La Vega", "Macarao", "San Agustín", "San Bernardino", "San José", "San Juan", "San Pedro", "Santa Rosalía", "Santa Teresa", "Sucre", "23 de Enero"];
const relations = ["Padre", "Madre", "Representante Legal", "Tío(a)", "Abuelo(a)", "Hermano(a) Mayor", "Otro"];

export function EnrollmentForm({ open,  onClose,  onSubmit,  initialData,  mode = "create", step, setStep }: EnrollmentFormProps) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(null);
  const [representativePhotoPreview, setRepresentativePhotoPreview] = useState<string | null>(null);
  const [studentPhotoFile, setStudentPhotoFile] = useState<File | null>(null);
  const [representativePhotoFile, setRepresentativePhotoFile] = useState<File | null>(null);

  const methods = useForm<StudentWizardFormValues>({
    // resolver: zodResolver(studentWizardSchema),
    defaultValues: {
      firstNames: "",
      lastNames: "",
      identificationNumber: "",
      birthDate: "",
      gender: "",
      profilePhoto: "",
      birthCountry: "",
      state: "",
      parish: "",
      address: "",
      previousSchool: "",
      admissionDate: new Date().toISOString().split('T')[0],
      representativeFirstNames: "",
      representativeLastNames: "",
      representativeIdentification: "",
      representativeBirthDate: "",
      representativeGender: "",
      representativeEmail: "",
      representativePhone: "",
      representativeRelation: "",
      representativeProfession: "",
      representativePhoto: "",
      ...initialData,
    },
  });

  const { handleSubmit, formState: { errors }, trigger, watch, setValue } = methods;

  // Validar paso actual y avanzar
  const validateStep = async () => {

    let fieldsToValidate: (keyof StudentWizardFormValues)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["firstNames", "lastNames", "identificationNumber", "birthDate", "gender"];
    } else if (step === 2) {
      fieldsToValidate = ["birthCountry", "state", "parish", "address"];
    } else if (step === 3) {
      fieldsToValidate = [
        "representativeFirstNames", "representativeLastNames", "representativeIdentification",
        "representativeBirthDate", "representativeGender", "representativeEmail",
        "representativePhone", "representativeRelation"
      ];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        // Enviar formulario
        setIsSubmitting(true);
        try {
          const formData = methods.getValues();
          await onSubmit(formData);
          onClose();
          resetForm();
        } catch (error) {
          console.error("Error al guardar:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const resetForm = () => {
    methods.reset();
    setStep(1);
    setStudentPhotoPreview(null);
    setRepresentativePhotoPreview(null);
    setStudentPhotoFile(null);
    setRepresentativePhotoFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleStudentPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen no puede superar 2MB");
        return;
      }
      setStudentPhotoFile(file);
      const preview = URL.createObjectURL(file);
      setStudentPhotoPreview(preview);
      setValue("profilePhoto", preview);
    }
  };

  const handleRepresentativePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen no puede superar 2MB");
        return;
      }
      setRepresentativePhotoFile(file);
      const preview = URL.createObjectURL(file);
      setRepresentativePhotoPreview(preview);
      setValue("representativePhoto", preview);
    }
  };

  const removeStudentPhoto = () => {
    setStudentPhotoPreview(null);
    setStudentPhotoFile(null);
    setValue("profilePhoto", "");
  };

  const removeRepresentativePhoto = () => {
    setRepresentativePhotoPreview(null);
    setRepresentativePhotoFile(null);
    setValue("representativePhoto", "");
  };

  return (

      <div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(validateStep)}>
            <div className="">
              
              {/* ==================== PASO 1: DATOS PERSONALES ==================== */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User size={20} className="text-blue-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">Datos Personales del Estudiante</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Foto de perfil */}
                    <div className="md:col-span-2 flex justify-center mb-4">
                      <div className="relative">
                        <Avatar className="w-28 h-28 border-4 border-blue-900 shadow-lg">
                          {studentPhotoPreview ? (
                            <AvatarImage src={studentPhotoPreview} alt="Foto" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-blue-900 to-green-500 text-white text-2xl">
                              <Camera size={28} />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <label className="absolute -bottom-2 -right-2 p-1.5 bg-green-500 rounded-full cursor-pointer shadow-md hover:bg-green-600 transition">
                          <Camera size={16} className="text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleStudentPhotoChange}
                          />
                        </label>
                        {studentPhotoPreview && (
                          <button
                            type="button"
                            onClick={removeStudentPhoto}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full shadow-md hover:bg-red-600 transition"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Campos del paso 1 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombres <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...methods.register("firstNames")}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                            errors.firstNames ? "border-red-500" : "border-gray-200"
                          )}
                          placeholder="Ej: María José"
                        />
                        {errors.firstNames && (
                          <p className="text-red-500 text-xs mt-1">{errors.firstNames.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apellidos <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...methods.register("lastNames")}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                            errors.lastNames ? "border-red-500" : "border-gray-200"
                          )}
                          placeholder="Ej: González Pérez"
                        />
                        {errors.lastNames && (
                          <p className="text-red-500 text-xs mt-1">{errors.lastNames.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cédula <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...methods.register("identificationNumber")}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                            errors.identificationNumber ? "border-red-500" : "border-gray-200"
                          )}
                          placeholder="Ej: V-12345678"
                        />
                        {errors.identificationNumber && (
                          <p className="text-red-500 text-xs mt-1">{errors.identificationNumber.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Nacimiento <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          {...methods.register("birthDate")}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                            errors.birthDate ? "border-red-500" : "border-gray-200"
                          )}
                        />
                        {errors.birthDate && (
                          <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Género <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...methods.register("gender")}
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                            errors.gender ? "border-red-500" : "border-gray-200"
                          )}
                        >
                          <option value="">Seleccione un género</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                        </select>
                        {errors.gender && (
                          <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== PASO 2: DATOS GENERALES ==================== */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText size={20} className="text-blue-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">Datos Generales del Estudiante</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País de Nacimiento <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...methods.register("birthCountry")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.birthCountry ? "border-red-500" : "border-gray-200"
                        )}
                      >
                        <option value="">Seleccione un país</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      {errors.birthCountry && (
                        <p className="text-red-500 text-xs mt-1">{errors.birthCountry.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado de Nacimiento <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...methods.register("state")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.state ? "border-red-500" : "border-gray-200"
                        )}
                      >
                        <option value="">Seleccione un estado</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parroquia de Nacimiento <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...methods.register("parish")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.parish ? "border-red-500" : "border-gray-200"
                        )}
                      >
                        <option value="">Seleccione una parroquia</option>
                        {parishes.map(parish => (
                          <option key={parish} value={parish}>{parish}</option>
                        ))}
                      </select>
                      {errors.parish && (
                        <p className="text-red-500 text-xs mt-1">{errors.parish.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parroquia donde Vive <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...methods.register("address")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.address ? "border-red-500" : "border-gray-200"
                        )}
                      >
                        <option value="">Seleccione una parroquia</option>
                        {parishes.map(parish => (
                          <option key={parish} value={parish}>{parish}</option>
                        ))}
                      </select>
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección Completa <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...methods.register("address")}
                        rows={3}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.address ? "border-red-500" : "border-gray-200"
                        )}
                        placeholder="Ej: Av. Principal, Casa #123, Urbanización Las Mercedes"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Escuela Previa
                      </label>
                      <input
                        {...methods.register("previousSchool")}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: U.E. Colegio San José"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Admisión
                      </label>
                      <input
                        type="date"
                        {...methods.register("admissionDate")}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== PASO 3: DATOS DEL REPRESENTANTE ==================== */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCheck size={20} className="text-blue-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">Datos del Representante</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Foto del representante */}
                    <div className="md:col-span-2 flex justify-center mb-4">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-blue-900 shadow-lg">
                          {representativePhotoPreview ? (
                            <AvatarImage src={representativePhotoPreview} alt="Foto Representante" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-blue-900 to-green-500 text-white text-xl">
                              <User size={28} />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <label className="absolute -bottom-2 -right-2 p-1.5 bg-green-500 rounded-full cursor-pointer shadow-md hover:bg-green-600 transition">
                          <Camera size={16} className="text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleRepresentativePhotoChange}
                          />
                        </label>
                        {representativePhotoPreview && (
                          <button
                            type="button"
                            onClick={removeRepresentativePhoto}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full shadow-md hover:bg-red-600 transition"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombres <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...methods.register("representativeFirstNames")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.representativeFirstNames ? "border-red-500" : "border-gray-200"
                        )}
                        placeholder="Ej: Carlos José"
                      />
                      {errors.representativeFirstNames && (
                        <p className="text-red-500 text-xs mt-1">{errors.representativeFirstNames.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellidos <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...methods.register("representativeLastNames")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.representativeLastNames ? "border-red-500" : "border-gray-200"
                        )}
                        placeholder="Ej: González Rodríguez"
                      />
                      {errors.representativeLastNames && (
                        <p className="text-red-500 text-xs mt-1">{errors.representativeLastNames.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cédula <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...methods.register("representativeIdentification")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.representativeIdentification ? "border-red-500" : "border-gray-200"
                        )}
                        placeholder="Ej: V-87654321"
                      />
                      {errors.representativeIdentification && (
                        <p className="text-red-500 text-xs mt-1">{errors.representativeIdentification.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Nacimiento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        {...methods.register("representativeBirthDate")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.representativeBirthDate ? "border-red-500" : "border-gray-200"
                        )}
                      />
                      {errors.representativeBirthDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.representativeBirthDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Género <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...methods.register("representativeGender")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.representativeGender ? "border-red-500" : "border-gray-200"
                        )}
                      >
                        <option value="">Seleccione un género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                      {errors.representativeGender && (
                        <p className="text-red-500 text-xs mt-1">{errors.representativeGender.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...methods.register("representativeEmail")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.representativeEmail ? "border-red-500" : "border-gray-200"
                        )}
                        placeholder="Ej: correo@ejemplo.com"
                      />
                      {errors.representativeEmail && (
                        <p className="text-red-500 text-xs mt-1">{errors.representativeEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...methods.register("representativePhone")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.representativePhone ? "border-red-500" : "border-gray-200"
                        )}
                        placeholder="Ej: 0412-1234567"
                      />
                      {errors.representativePhone && (
                        <p className="text-red-500 text-xs mt-1">{errors.representativePhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relación con el Estudiante <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...methods.register("representativeRelation")}
                        className={cn(
                          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                          errors.representativeRelation ? "border-red-500" : "border-gray-200"
                        )}
                      >
                        <option value="">Seleccione una relación</option>
                        {relations.map(relation => (
                          <option key={relation} value={relation}>{relation}</option>
                        ))}
                      </select>
                      {errors.representativeRelation && (
                        <p className="text-red-500 text-xs mt-1">{errors.representativeRelation.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profesión
                      </label>
                      <input
                        {...methods.register("representativeProfession")}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: Ingeniero, Docente, Comerciante"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
  );
}