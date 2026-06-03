import { getDataApi } from "../api";
import type { IStudent, IStaff } from "./user.interface";

const usersUrl = '/users';
const studentsUrl = '/users/students';

export const getStudents = async (params?: {
  view?: string;
  levelId?: number;
  section?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  ageExact?: number;
}): Promise<IStudent[]> => {
    const qs = new URLSearchParams();
    if (params?.view) qs.set('view', params.view);
    if (params?.levelId !== undefined) qs.set('levelId', String(params.levelId));
    if (params?.section !== undefined) qs.set('section', params.section);
    if (params?.gender) qs.set('gender', params.gender);
    if (params?.ageMin !== undefined) qs.set('ageMin', String(params.ageMin));
    if (params?.ageMax !== undefined) qs.set('ageMax', String(params.ageMax));
    if (params?.ageExact !== undefined) qs.set('ageExact', String(params.ageExact));
    const query = qs.toString();
    return await getDataApi(`${studentsUrl}${query ? `?${query}` : ''}`);
};

export const getStaff = async () : Promise<IStaff[]> => {
    return await getDataApi(`${usersUrl}/staff`);
};






