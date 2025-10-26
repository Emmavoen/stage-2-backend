import { DataTypes, Model, type CreationOptional } from "sequelize";
import { sequelize } from "../../config/connectDb";
import type { ICountry } from "./country.interface";

// Interface for model attributes
// NOTE: Timestamps (createdAt, last_refreshed_at) are removed from here
// because they are managed by Sequelize's 'timestamps' option, not
// part of the manual attribute definition in init().

// Interface for model creation (omit auto-generated fields)
type CountryCreationAttributes = Omit<ICountry, "id">;

class Country extends Model<ICountry, CountryCreationAttributes> {
  // These are your columns defined in CountryAttributes
  declare id: CreationOptional<number>;
  declare name: string;
  declare capital: string | null;
  declare region: string | null;
  declare population: number;
  declare currency_code: string | null;
  declare exchange_rate: number | null;
  declare estimated_gdp: number | null;
  declare flag_url: string | null;

  // We declare the timestamp fields here so TypeScript knows they exist
  // on the model instance, even though they aren't in CountryAttributes.
  declare readonly last_refreshed_at: CreationOptional<Date>;
}

Country.init(
  {
    // This object now correctly matches the CountryAttributes interface
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    capital: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    population: {
      type: DataTypes.BIGINT, // Use BIGINT for large numbers
      allowNull: false,
    },
    currency_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    exchange_rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    estimated_gdp: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    flag_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "Countries",
    timestamps: true, // This tells Sequelize to create/manage the timestamp fields
    updatedAt: "last_refreshed_at", // This aliases 'updatedAt' to 'last_refreshed_at'
    createdAt: false, // This explicitly names the 'createdAt' field
  }
);

export default Country;
