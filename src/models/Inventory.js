const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const Inventory = sequelize.define("inventories", {
    
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

    lot: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: "El numero de lote es obligatorio"
            },
            notEmpty: {
                msg: "El numero de lote es obligatorio"
            }
        }
    },

    quantity: {
        type: DataTypes.NUMBER,
        allowNull: false,
        validate: {
            isNumeric: {
                msg: "La existencia del lote es incorrecta"
            },
            notEmpty: {
                msg: "La existencia de lote es obligatoria"
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


module.exports = Inventory;