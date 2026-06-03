import { getDataApi } from "../api";

export interface ICountry {
  id: number;
  name: string;
}

export interface IState {
  id: number;
  countryId: number;
  name: string;
}

export interface IMunicipality {
  id: number;
  stateId: number;
  name: string;
}

export interface IParish {
  id: number;
  municipalityId: number;
  name: string;
}

const locationsUrl = "/locations";

export const getCountries = async (): Promise<ICountry[]> => {
  return getDataApi(`${locationsUrl}/countries`);
};

export const getStates = async (countryId: number): Promise<IState[]> => {
  return getDataApi(`${locationsUrl}/states?countryId=${countryId}`);
};

export const getMunicipalities = async (
  stateId: number,
): Promise<IMunicipality[]> => {
  return getDataApi(`${locationsUrl}/municipalities?stateId=${stateId}`);
};

export const getParishes = async (
  municipalityId: number,
): Promise<IParish[]> => {
  return getDataApi(`${locationsUrl}/parishes?municipalityId=${municipalityId}`);
};
