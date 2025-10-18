import { DataTypes, Model, CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize"
import { connPostgreSQL } from "../database/connPg.js"

class Count extends Model<InferAttributes<Count>, InferCreationAttributes<Count>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare countPlay: CreationOptional<number>;
  declare countDownload: CreationOptional<number>;
  declare countProcess: CreationOptional<number>;
  declare dateSave: CreationOptional<Date>
}

Count.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dateSave: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  username: { type: DataTypes.STRING, allowNull: false },
  countPlay: { type: DataTypes.INTEGER, defaultValue: 0 },
  countDownload: { type: DataTypes.INTEGER, defaultValue: 0 },
  countProcess: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  sequelize: connPostgreSQL,
});

export { Count };