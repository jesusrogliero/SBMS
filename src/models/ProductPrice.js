const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const ProductPrice = sequelize.define("products_prices", {
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
        type: DataTypes.NUMBER,
        allowNull: false,
        references: {
            model: "products",
            key: "id"
        },
        validate: {    
            isNumeric: {
                args: true,
                msg: "Debe ingresar un producto valido"
            },
            notNull: {
                args: true,
                msg: "Debes ingresar un producto"
            },
            notEmpty: {
                args: true,
                msg: "Debes ingresar un producto"
            }
        }
    },

    is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
    }

});


module.exports = ProductPrice;