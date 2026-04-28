import { getDataApi } from "../api";
import type { IStudent } from "./user.interface";

const usersUrl = '/users';
const studentsUrl = '/users/students';

export const getStudents = async () : Promise<IStudent[]> => {
    return await getDataApi(studentsUrl);
};






