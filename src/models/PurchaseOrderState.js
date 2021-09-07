const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const PurchaseOrderState = sequelize.define("purchase_orders_state", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    state: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});


module.exports = PurchaseOrderState;