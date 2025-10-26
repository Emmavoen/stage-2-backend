import { sequelize } from "../../config/connectDb";
import { fetchCountry } from "../../utils/fetchCountry";
import { fetchExchangeRate } from "../../utils/fetchExchangeRate";
import { generateSummaryImage } from "../../utils/imageService";
import ApiError from "../../utils/response/apiError";
import AppStatus from "../app-status/app-status.model";
import type {
  ICountryApiResponse,
  ICountryResponseDto,
} from "./country.interface";
import Country from "./country.model";
import { Op, type Transaction } from "sequelize";

export class CountryService {
  static async refreshCountries(): Promise<{ total: number; time: Date }> {
    const countries = await fetchCountry();
    const rates = await fetchExchangeRate();
    const transaction: Transaction = await sequelize.transaction();

    try {
      // .map(async) creates an array of promises. We must await them.
      const processingPromises = countries.map(
        async (country: ICountryApiResponse) => {
          // --- Validation from Spec ---
          if (!country.name || !country.population) {
            console.warn(
              `Skipping country with missing data: ${country.name || "Unknown"}`
            );
            return; // Skip this iteration
          }

          // --- Currency & Rate Logic (from your code) ---
          const currencyCode =
            country.currencies && country.currencies.length > 0
              ? country.currencies[0].code
              : null;

          const exchangeRate =
            currencyCode && rates.rates[currencyCode]
              ? rates.rates[currencyCode]
              : null;

          // --- Safe GDP Calculation (Fixes the crash) ---
          let estimated_gdp: number | null = 0; // Default to 0 (if no currency)
          const multiplier = Math.random() * (2000 - 1000) + 1000;

          if (currencyCode) {
            if (exchangeRate) {
              // Case 1: All data exists
              estimated_gdp = (country.population * multiplier) / exchangeRate;
            } else {
              // Case 2: Currency exists, but no rate found
              estimated_gdp = null; // As per spec
            }
          }
          // Case 3: No currency, estimated_gdp remains 0

          // --- Data for DB (from your code) ---
          const countryData = {
            name: country.name,
            capital: country.capital || null,
            region: country.region || null,
            population: country.population,
            currency_code: currencyCode,
            exchange_rate: exchangeRate, // Already correctly null if not found
            estimated_gdp: estimated_gdp, // Use our new safe variable
            flag_url: country.flag || null,
          };

          // --- Upsert Logic (findOrCreate + update) ---
          const [dbCountry, created] = await Country.findOrCreate({
            where: { name: { [Op.like]: country.name } }, // <-- FIXED
            defaults: countryData,
            transaction: transaction,
          });

          if (!created) {
            // --- THIS IS THE MISSING UPDATE LOGIC ---
            // If the country already existed, update it with the fresh data
            // This recalculates GDP with a new random multiplier
            await dbCountry.update(countryData, { transaction: transaction });
          }
        }
      ); // end of .map()

      // --- COMPLETE THE PROCESS ---

      // 1. Wait for all DB operations to finish
      await Promise.all(processingPromises);

      // 2. Update the global AppStatus table
      const refreshTime = new Date();
      const totalCountries = await Country.count({ transaction: transaction });

      await AppStatus.upsert(
        {
          id: 1,
          total_countries: totalCountries,
          last_refreshed_at: refreshTime,
        },
        { transaction: transaction }
      );

      // 3. Commit the transaction
      await transaction.commit();

      // 4. Generate the image *after* a successful commit
      await generateSummaryImage(totalCountries, refreshTime);

      // 5. Return success data to the controller
      return { total: totalCountries, time: refreshTime };
    } catch (error) {
      // If any promise fails, roll back the entire transaction
      await transaction.rollback();
      console.error("Failed to refresh country data:", error);
      throw ApiError.internal();
      //  error; // Re-throw the error for the controller to handle
    }
  }

  // ... (Your other service methods like findOne, findAll, delete)
}

// import { sequelize } from "../../config/connectDb";
// import { fetchCountry } from "../../utils/fetchCountry";
// import { fetchExchangeRate } from "../../utils/fetchExchangeRate";
// import type {
//   ICountryApiResponse,
//   ICountryResponseDto,
// } from "./country.interface";
// import Country from "./country.model";
// import { Op, type Transaction } from "sequelize";

// export class CountryService {
//   static async getCountries() {
//     const countries = await fetchCountry();

//     const rates = await fetchExchangeRate();
//     const transaction: Transaction = await sequelize.transaction();
//     try {
//       const countryList: ICountryResponseDto[] = countries.map(async
//         (country: ICountryApiResponse) => {
//           const currencyCode =
//             country.currencies && country.currencies.length > 0
//               ? country.currencies[0].code
//               : null;
//           const exchangeRate =
//             currencyCode && rates.rates[currencyCode]
//               ? rates.rates[currencyCode]
//               : null;
//           const multiplier = Math.random() * (2000 - 1000) + 1000;
//           const gdp = (country.population * multiplier) / exchangeRate!;
//           const countryData = {
//             name: country.name,
//             capital: country.capital,
//             region: country.region,
//             population: country.population,
//             currency_code: currencyCode,
//             exchange_rate: currencyCode
//               ? rates.rates[currencyCode] ?? null
//               : null,
//             estimated_gdp: gdp,
//             flag_url: country.flag,
//           };

//           const [dbCountry, created] = await Country.findOrCreate({
//         where: { name: { [Op.iLike]: country.name } },
//         defaults: countryData,
//         transaction: transaction,
//       });
//         }
//       );
//       // Upsert logic: Find by name (case-insensitive), then create or update

//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   }
// }
