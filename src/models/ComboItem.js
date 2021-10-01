const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');
const Product = require('./Product.js');

const ComboItem = sequelize.define("combos_items", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    combo_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },

    product_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        },
        validate: {
            notNull: {
                args: true,
                msg: "Debes ingresar un producto al combo"
            },
            isNumeric: {
                args: true,
                msg: "El producto ingresado no es correcto"
            }
        }
    },

    quantity: {
        type: DataTypes.NUMBER,
        allowNull: false,
        validate: {
            notNull: {
                args: true,
                msg: "Debes especificar cuando que cantidad de un producto se incluira en el combo"
            },
            isNumeric: {
                args: true,
                msg: "La cantidad de producto a ingresar al combo es incorrecta"
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

ComboItem.belongsTo(Product, {foreignKey: 'combo_id'});
ComboItem.belongsTo(Product, {foreignKey: 'product_id'});

module.exports = ComboItem;