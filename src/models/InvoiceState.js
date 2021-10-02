const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const InvoiceState = sequelize.define("invoices_states", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    state: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    createdAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    
    updatedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
});

module.exports = InvoiceState;