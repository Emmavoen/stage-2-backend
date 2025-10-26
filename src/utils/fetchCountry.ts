import config from "../config/config";
import type { ICountryApiResponse } from "../modules/country/country.interface";
import ApiError from "./response/apiError";

export const fetchCountry = async (): Promise<ICountryApiResponse[]> => {
  const response = await fetch(`${config.api.countries}`);

  if (!response.ok) {
    throw ApiError.internal();
  }

  const data = (await response.json()) as ICountryApiResponse[];
  return data;
};
