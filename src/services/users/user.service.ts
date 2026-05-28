import { getDataApi } from "../api";
import type { IStudent, IStaff } from "./user.interface";

const usersUrl = '/users';
const studentsUrl = '/users/students';

export const getStudents = async () : Promise<IStudent[]> => {
    return await getDataApi(studentsUrl);
};

export const getStaff = async () : Promise<IStaff[]> => {
    return await getDataApi(`${usersUrl}/staff`);
};






