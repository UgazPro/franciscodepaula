import { getDataApi } from "../api";
import type { IStudent, IStaff, IRepresentative } from "./user.interface";

const usersUrl = '/users';
const studentsUrl = '/users/students';

interface SearchPersonResult {
  id: number;
  type: 'student' | 'employee' | 'representative';
  studentStatus?: boolean | null;
  person: {
    id: number;
    firstNames: string;
    lastNames: string;
    identificationNumber: string;
    profilePhoto?: string;
  };
  role?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    take: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const getStudents = async (params?: {
  page?: number;
  take?: number;
  search?: string;
  view?: string;
  levelId?: number;
  section?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  ageExact?: number;
}): Promise<IStudent[] | PaginatedResponse<IStudent>> => {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set('page', String(params.page));
    if (params?.take !== undefined) qs.set('take', String(params.take));
    if (params?.search) qs.set('search', params.search);
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

export const searchStudents = async (search?: string): Promise<IStudent[]> => {
  const results = await getDataApi(`${usersUrl}/search?q=${encodeURIComponent(search || '')}`);
  if (!Array.isArray(results)) return [];
  return (results as SearchPersonResult[])
    .filter((r) => r.type === 'student' && r.studentStatus !== false)
    .map((r) => ({
      id: r.id,
      personId: r.person.id,
      person: r.person,
      birthCountry: '',
      state: '',
      municipality: '',
      parish: '',
      currentParish: '',
      previousSchool: '',
      address: '',
      status: true,
      admissionDate: new Date(),
      sectionId: null,
    })) as IStudent[];
};

export const getStaff = async () : Promise<IStaff[]> => {
    return await getDataApi(`${usersUrl}/staff`);
};

export const checkIdentification = async (
  value: string,
  excludePersonId?: number,
): Promise<{ exists: boolean }> => {
  const qs = new URLSearchParams({ value });
  if (excludePersonId !== undefined) {
    qs.set('excludePersonId', String(excludePersonId));
  }
  return await getDataApi(`${usersUrl}/check-identification?${qs.toString()}`);
};

export const searchRepresentatives = async (search?: string): Promise<IRepresentative[]> => {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return await getDataApi(`${usersUrl}/representatives${qs}`);
};

export const getRepresentatives = async (params?: {
  page?: number;
  take?: number;
  search?: string;
  view?: string;
  minStudents?: number;
}): Promise<IRepresentative[] | PaginatedResponse<IRepresentative>> => {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set('page', String(params.page));
  if (params?.take !== undefined) qs.set('take', String(params.take));
  if (params?.search) qs.set('search', params.search);
  if (params?.view) qs.set('view', params.view);
  if (params?.minStudents !== undefined) qs.set('minStudents', String(params.minStudents));
  const query = qs.toString();
  return await getDataApi(`${usersUrl}/representatives${query ? `?${query}` : ''}`);
};


