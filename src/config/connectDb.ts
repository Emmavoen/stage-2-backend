import { Sequelize } from "sequelize";
import config from "./config";

// Sequelize constructor directly accepts a connection string
const sequelize = new Sequelize(config.databaseUrl!, {
  dialect: "mysql",
  logging: false, // Set to console.log to see SQL queries
});

export { sequelize };
