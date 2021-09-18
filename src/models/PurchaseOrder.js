const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');
const Provider = require("./Provider.js");
const Currency = require("./Currency.js");
const PurchaseOrderState = require("./PurchaseOrderState.js");

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

    date: {
        type: DataTypes.DATEONLY,
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
        references: {
            model: "providers",
            key: 'id'
        },
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

    tax_amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
    },

    total_products: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue:0
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

    createdAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    
    updatedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }


});

PurchaseOrder.belongsTo(Currency, {foreignKey: 'currency_id'});
PurchaseOrder.belongsTo(Provider, {foreignKey: 'provider_id'});
PurchaseOrder.belongsTo(PurchaseOrderState, {foreignKey: 'state_id'});

module.exports = PurchaseOrder;