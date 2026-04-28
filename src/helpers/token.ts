import { useAuthStore } from "@/stores/auth.store";
import { jwtDecode } from "jwt-decode";

export interface IToken {
  id: number;
  personId: number;
  roleId: number;
  email: string;
  phone: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
  person: Person;
  iat: number;
  exp: number;
}

export interface Person {
  id: number;
  profilePhoto: string;
  firstNames: string;
  lastNames: string;
  identificationNumber: string;
  birthDate: Date;
  gender: string;
}

export interface Role {
  id: number;
  role: string;
}

export const getAuthToken = () => {
  return useAuthStore.getState().token;
}

export const getUserDataFromToken = (token: string | null) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<IToken>(token);
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export function useUserData() {
  const token = useAuthStore((s) => s.token);
  return getUserDataFromToken(token);
}

export function getUserDataSafe() {
  const token = useAuthStore.getState().token;
  return getUserDataFromToken(token);
}

