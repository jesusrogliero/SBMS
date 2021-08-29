const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const ReasonsVisits = sequelize.define("reasons_visits", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});


module.exports = ReasonsVisits;