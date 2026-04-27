import { postDataApi } from "../api";
import type { AuthLoginData } from "./auth.interface";

const authUrl = '/auth';

export const authLogin = async (data: AuthLoginData) => {
    return await postDataApi(`${authUrl}/login`, data);
}


