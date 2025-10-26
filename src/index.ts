import express, { type Request, type Response } from "express";
import { sequelize } from "./config/connectDb";
import config from "./config/config";
import countryRouter from "./modules/country/country.routes";
// import apiRoutes from "./routes";
// import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Middleware
app.use(express.json());

// API Routes
app.use("/countries", countryRouter);

// Root health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to the Country API (TypeScript). API is live.",
    endpoints: {
      status: "/api/status",
      refresh: "POST /api/countries/refresh",
      all_countries: "/api/countries",
      countries_by_region: "/api/countries?region=Africa",
      country_by_name: "/api/countries/Nigeria",
      summary_image: "/api/countries/image",
    },
  });
});

// Global Error Handler
// app.use(errorHandler);

const PORT = config.port;

const startServer = async () => {
  try {
    // 1. Authenticate DB connection
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // 2. Sync models with DB
    // { alter: true } checks the current state of the table in the database and then
    // performs the necessary changes in the table to make it match the model.
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");

    // 3. Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1); // Exit with failure
  }
};

startServer();
