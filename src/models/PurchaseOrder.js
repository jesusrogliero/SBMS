const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const PurchaseOrder = sequelize.define("purchase_orders", {
   
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    state_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 1
    },

    observation: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: {
                args: true,
                msg: "Debes ingresar una observación"
            },
            notEmpty: {
                args: true,
                msg: "Debes ingresar una observación"
            }
        }
    },

    date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: {
                args: true,
                msg: "La fecha ingresada no es correcta (DD/MM/YYYY)"
            },
            notNull: {
                args: true,
                msg: "Debes ingresar la fecha de compra"
            }
        }
    },

    provider_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        validate: {
            isNumeric: {
                args: true,
                msg: "Debes ingresar un provedor valido"
            },
            notNull: {
                args: true,
                msg: "Debes ingresar el provedor de la compra"
            }
        }
    },

    currency_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        references: {
            model: "currencies",
            key: "id"
        }
    },

    tax_amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
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


});


module.exports = PurchaseOrder;