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
    previousSchool: string;
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
    section: {
        id: number;
        section: string;
        level: { id: number; level: string };
    };
}

export interface StudentRepresentative {
    id: number;
    representative: {
        id: number;
        relationship: string | null;
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
    email: string;
    phone: string | null;
    status: boolean;
    person: Person;
    role: { id: number; role: string };
    employee: { id: number } | null;
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





