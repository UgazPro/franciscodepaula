export type ViewMode = "list" | "grid";
export type userRolesNames = "Administrador" | "Director" | "SubDirector" | "Coordinador" | "Administrativo" | "Contador" | "Secretaria" | "Docente" | "Representante";

export interface IStudent {
    id:             number;
    personId:       number;
    birthCountry:   string;
    state:          string;
    parish:         string;
    previousSchool: string;
    address:        string;
    status:         string;
    admissionDate:  Date;
    sectionId:      null;
    person:         Person;
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





