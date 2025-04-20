

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CsvUpload = sequelize.define(
  'CsvUpload',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    upload_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    update_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  
    generalAccessType: {
      type: DataTypes.ENUM('viewer', 'editor', 'restricted'),
      allowNull: false,
      defaultValue: 'restricted',
    },
   
  },
  {
    tableName: 'csv_uploads', // Matches DB table name
    timestamps: false, // Disables automatic timestamps
  }
);

module.exports = CsvUpload;
