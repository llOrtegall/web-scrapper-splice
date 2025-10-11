import { DataTypes, Model, CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize"
import { connPostgreSQL } from "../database/connPg"

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare role: CreationOptional<string>;
  declare is_active: CreationOptional<boolean>;
  declare password: string;
}

User.init({
  id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  password: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize: connPostgreSQL,
  tableName: 'users',
  timestamps: true,
});
