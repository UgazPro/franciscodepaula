import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useStudentsStore } from "@/stores/students.store";
import { useCreateStudent, useUpdateStudent } from "@/queries/useUserMutations";
import { useUserData } from "@/helpers/token";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema, type StudentFormValues } from "@/services/users/student.schema";
import { studentLeftFields, studentMiddleFields, studentRightFields } from "@/services/users/userForm.data";
import { FormComponent } from "@/components/form/FormComponent";
import ProfilePictureComponent from "@/components/picture/ProfilePictureImage";

export default function StudentsForm() {

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const user = useUserData();

    const { selectedStudent, mode, finishForm } = useStudentsStore();

    const { mutateAsync: createStudent } = useCreateStudent();
    const { mutateAsync: updateStudent } = useUpdateStudent();

    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            // Person Data
            profilePhoto: "",

            firstNames: "",
            lastNames: "",
            identificationNumber: "",

            birthDate: new Date(), // importante para zod + react-hook-form

            gender: "",

            // Student Data
            birthCountry: "",
            state: "",
            parish: "",
            previousSchool: "",
            address: "",
            status: true,

            admissionDate: new Date(),

            sectionId: undefined,
        }
    });

    useEffect(() => {

        if (!selectedStudent || mode !== "edit") return;

        if (mode === "edit" && selectedStudent) {

            form.reset({
                profilePhoto: selectedStudent.person.profilePhoto,
                firstNames: selectedStudent.person.firstNames,
                lastNames: selectedStudent.person.lastNames,
                identificationNumber: selectedStudent.person.identificationNumber,
                birthDate: new Date(selectedStudent.person.birthDate),
                gender: selectedStudent.person.gender,

                // Student selectedStudent
                birthCountry: selectedStudent.birthCountry,
                state: selectedStudent.state,
                parish: selectedStudent.parish,
                previousSchool: selectedStudent.previousSchool,
                address: selectedStudent.address,
                status: true,
                admissionDate: new Date(selectedStudent.admissionDate),
                sectionId: undefined,
            });

            // setImagePreview(selectedStudent.profileImg || null);
        }

    }, [mode, selectedStudent]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("El archivo debe ser una imagen");
            return;
        }

        if (file.size > 1024 * 1024) {
            alert("La imagen no puede superar 1MB");
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveFoto = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const sendForm = async (data: StudentFormValues) => {

        console.log(data);

        const payload = {
            profilePhoto: data.profilePhoto,
            firstNames: data.firstNames,
            lastNames: data.lastNames,
            identificationNumber: data.identificationNumber,
            birthDate: data.birthDate,
            gender: data.gender,

            // Student Data
            birthCountry: data.birthCountry,
            state: data.state,
            parish: data.parish,
            previousSchool: data.previousSchool,
            address: data.address,
            status: true,
            admissionDate: data.admissionDate,
            sectionId: undefined,
        };

        if (mode === "create") {
            await createStudent({ data: payload });
        } else {
            console.log(data);
            await updateStudent({
                id: selectedStudent!.id,
                data: payload,
            });
        }


        console.log(payload);

        finishForm();
    };

    return (

        <Form {...form}>

            <form onSubmit={form.handleSubmit(sendForm)}>

                <div className="grid grid-cols-3 gap-6 my-6">

                    {/* Left */}
                    <div className="space-y-4">
                        <FormComponent
                            form={form}
                            fields={studentLeftFields}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormComponent
                            form={form}
                            fields={studentMiddleFields}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormComponent
                            form={form}
                            fields={studentRightFields}
                            otherType={
                                <ProfilePictureComponent
                                    imagePreview={imagePreview}
                                    handleImageChange={handleImageChange}
                                    handleRemoveFoto={handleRemoveFoto}
                                />
                            }
                        />
                    </div>


                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button" variant="outline" className="cursor-pointer"
                        onClick={finishForm}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        className="bg-red-700 hover:bg-red-800 cursor-pointer"
                    >
                        {mode === "create" ? "Guardar Estudiante" : "Actualizar Estudiante"}
                    </Button>
                </div>

            </form>
        </Form>

    );

}
