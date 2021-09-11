const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const Currency = sequelize.define("Currencies", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {            
            notNull: {
                args: true,
                msg: "Debes ingresar el nombre de la moneda"
            },
            notEmpty: {
                args: true,
                msg: "El nombre de la moneda no es valido"
            }
        }
    },
    symbol: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: {
                args: true,
                msg: "Debes ingresar el simbolo de la moneda"
            },
            notEmpty: {
                args: true,
                msg: "Debes ingresar el simbolo de la moneda"
            }
        }
    },
    exchange_rate: {
        type: DataTypes.NUMBER,
        allowNull: false,
        validate: {
            isNumeric: {
                args: true,
                msg: "Ingrese una tasa de cambio correcta"
            },
            notEmpty: {
                args: true,
                msg: "La tasa de cambio es obligatoria"
            },
            notNull: {
                args: true,
                msg: "La tasa de cambio es obligatoria"
            }
        }
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


module.exports = Currency;