export type ViewMode = "list" | "grid";
export type userRolesNames = "Administrador" | "Director" | "SubDirector" | "Coordinador" | "Administrativo" | "Contador" | "Secretaria" | "Docente" | "Representante";

export interface IStudent {
    id:             number;
    personId:       number;
    birthCountry:   string;
    state:          string;
    municipality:   string;
    parish:         string;
    currentParish:  string;
    address:        string;
    status:         boolean;
    admissionDate:  Date;
    sectionId:      null;
    person:         Person;
    enrollments?:   StudentEnrollment[];
    representatives?: StudentRepresentative[];
}

export interface StudentEnrollment {
    id: number;
    schoolYearId: number;
    sectionId: number;
    enrollmentDate: string | null;
    status: boolean | null;
    section: {
        id: number;
        section: string;
        highSchoolLevel: { id: number; level: string };
    };
}

export interface RepStudent {
    id: number;
    firstNames: string;
    lastNames: string;
    identificationNumber: string;
    status: boolean;
    section: string | null;
    relationship: string | null;
    birthDate: string | null;
    paymentCount: number;
}

export interface IRepresentative {
    id: number;
    occupation: string | null;
    email: string;
    phone: string | null;
    person: {
        id: number;
        firstNames: string;
        lastNames: string;
        identificationNumber: string;
        gender: string;
        birthDate: Date;
        profilePhoto: string;
    };
    studentCount: number;
    status: boolean;
    students?: RepStudent[];
}

export interface StudentRepresentative {
    id: number;
    relationship: string | null;
    isPrimary: boolean | null;
    representative: {
        id: number;
        occupation: string | null;
        user: {
            email: string;
            phone: string | null;
            person: Person;
        };
    };
}

export interface IStaff {
    id: number;
    personId: number;
    email: string;
    phone: string | null;
    status: boolean | null;
    createdAt: string;
    updatedAt: string;
    person: Person;
    userRoles: { id: number; userId: number; roleId: number; role: { id: number; role: string } }[];
    employee: { id: number; userId: number; baseHourRate: number | null; hireDate: Date | string | null } | null;
}

export interface Person {
    id:                   number;
    profilePhoto:         string;
    firstNames:           string;
    lastNames:            string;
    identificationNumber: string;
    birthDate:            Date;
    gender:               string;
}





