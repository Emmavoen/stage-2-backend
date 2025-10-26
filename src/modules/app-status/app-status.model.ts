import { DataTypes, Model, type CreationOptional } from "sequelize";
import { sequelize } from "../../config/connectDb";

interface AppStatusAttributes {
  id: number;
  total_countries: number;
  last_refreshed_at: Date | null;
}

interface AppStatusCreationAttributes {
  id?: number;
  total_countries: number;
  last_refreshed_at: Date | null;
}

class AppStatus extends Model<
  AppStatusAttributes,
  AppStatusCreationAttributes
> {
  declare id: number;
  declare total_countries: number;
  declare last_refreshed_at: Date | null;
}

AppStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1, // We only ever want one row with id=1
    },
    total_countries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_refreshed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "AppStatus",
    timestamps: false, // No createdAt/updatedAt for this table
  }
);

export default AppStatus;
