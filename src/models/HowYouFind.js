const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const HowYouFind = sequelize.define("how_you_find", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    how: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});


module.exports = HowYouFind;