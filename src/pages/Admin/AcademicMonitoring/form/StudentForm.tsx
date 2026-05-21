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

            birthDate: new Date(),

            gender: "",

            // Student Data
            birthCountry: "",
            state: "",
            parish: "",
            previousSchool: "",
            address: "",
            status: true,

            admissionDate: new Date(),

            // sectionId: 0,
        }
    });

    useEffect(() => {

        if (!selectedStudent || mode !== "edit") return;

        if (mode === "edit" && selectedStudent) {

            form.reset({
                profilePhoto: "",
                firstNames: selectedStudent.person.firstNames,
                lastNames: selectedStudent.person.lastNames,
                identificationNumber: selectedStudent.person.identificationNumber,
                birthDate: new Date(selectedStudent.person.birthDate),
                gender: selectedStudent.person.gender,

                // Student
                birthCountry: selectedStudent.birthCountry,
                state: selectedStudent.state,
                parish: selectedStudent.parish,
                previousSchool: selectedStudent.previousSchool,
                address: selectedStudent.address,
                status: true,
                admissionDate: new Date(selectedStudent.admissionDate),
                // sectionId: 0,
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
            profilePhoto: "",
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
            // sectionId: 0,
        };

        if (mode === "create") {
            await createStudent({ data: payload });
        } else {
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

            <form
                onSubmit={form.handleSubmit(sendForm)}
                className="rounded-3xl bg-(--grayColor) border border-(--lightBlueColor)/30 p-4 shadow-lg"
            >

                <div className="grid lg:grid-cols-3 gap-3 my-3">

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

                <div className="mt-5 pt-6 border-t border-(--lightBlueColor)/30 flex justify-end gap-4">
                    <Button
                        type="button" variant="outline" 
                        className="border-(--lightBlueColor) text-(--darkBlueColor) hover:bg-(--grayColor) cursor-pointer"
                        onClick={finishForm}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer"
                    >
                        {mode === "create" ? "Guardar Estudiante" : "Actualizar Estudiante"}
                    </Button>
                </div>

            </form>
        </Form>

    );

}
