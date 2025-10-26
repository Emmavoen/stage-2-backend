import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT || 8080,

  databaseUrl: process.env.DATABASE_URL,

  api: {
    countries: process.env.COUNTRIES_API_URL,
    rates: process.env.RATES_API_URL,
  },
};

// Updated validation
if (!config.databaseUrl || !config.api.countries || !config.api.rates) {
  throw new Error(
    "Missing critical environment variables. Check .env file for DATABASE_URL and API URLs."
  );
}

export default config;
