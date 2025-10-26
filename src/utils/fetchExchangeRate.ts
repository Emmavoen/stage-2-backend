import config from "../config/config";
import type { ICountryRate } from "../modules/country/country.interface";
import ApiError from "./response/apiError";

export const fetchExchangeRate = async (): Promise<ICountryRate> => {
  const response = await fetch(`${config.api.rates}`);

  if (!response.ok) {
    throw ApiError.internal();
  }

  const data = (await response.json()) as ICountryRate;
  return data;
};
