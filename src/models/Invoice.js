const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');
const Currency = require("./Currency.js");
const Client = require('./Client.js');
const InvoiceState = require("./InvoiceState.js");


const Invoice = sequelize.define("invoices", {
   
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "clients",
            key: "id"
        },
        validate: {
            notEmpty: {
                msg: "Debes ingresar un cliente"
            },
            isNumeric: {
                msg: "El cliente ingresado no es valido"
            }
        }
    },

    state_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 1,
        references: {
            model: "invoices_states",
            key: "id"
        }
    },

    currency_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        references: {
            model: "currencies",
            key: "id"
        },
        validate: {
            notEmpty: {
                msg: "Debes ingresar una moneda"
            },
            isNumeric: {
                msg: "La moneda ingresada no es valida"
            }
        }
    },

    exchange_rate: {
        type: DataTypes.NUMBER,
        allowNull: false
    },

    tax_amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0
    },

    subtotal: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0
    },

    total: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
    },

    total_products: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 0,
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

Invoice.belongsTo(Client, {foreignKey: 'client_id'});
Invoice.belongsTo(Currency, {foreignKey: 'currency_id'});
Invoice.belongsTo(InvoiceState, {foreignKey: 'state_id'});

module.exports = Invoice;