const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const Price = sequelize.define("prices", {
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
                msg: "Ingresa el nombre del precio ej (DETAL, POR MAYOR)"
            },
            notEmpty: {
                args: true,
                msg: "Debes ingresar un nombre de precio"
            }
        }
    },
    
    price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {    
            isDecimal: {
                args: true,
                msg: "Debe ingresar un precio valido"
            },
            notNull: {
                args: true,
                msg: "Debes ingresar un precio"
            },
            notEmpty: {
                args: true,
                msg: "Debes ingresar un precio"
            }
        }
    },

    is_default: {
        type: DataTypes.BOOLEAN,
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


module.exports = Price;