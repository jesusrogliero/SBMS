const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const ProductCost = sequelize.define("products_costs", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    
    product_id: {
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


    currency_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        references: {
            model: "currencies",
            key: "id"
        },
        validate: {
            isNumeric:{
                args: true,
                msg: "Debes ingresar una moneda valida"
            },
            notNull: {
                args: true,
                msg: "La moneda es obligatoria"
            },
            notEmpty: {
                args: true,
                msg: "La moneda es obligatoria"
            }
        }
    },

    price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
});


module.exports = ProductCost;