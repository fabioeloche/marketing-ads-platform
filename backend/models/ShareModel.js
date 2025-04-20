const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const CsvUploads = require("./CsvUpload");
const User = require("./User");

const ShareModel = sequelize.define("Share", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CsvUploads,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  accessType: {
    type: DataTypes.ENUM("viewer", "editor"),
    
    allowNull: false,
  },
  sharedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  sharedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = ShareModel;
