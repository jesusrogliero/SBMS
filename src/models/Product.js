const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');
const seed = require
const ProductType = require("./ProductType.js");
const Tax = require('./Tax.js');

const Product = sequelize.define("products", {
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
                msg: "Debes ingresar el nombre del producto"
            },
            notEmpty: {
                args: true,
                msg: "El nombre del producto no es valido"
            }
        }
    },
    stock: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isNumeric: {
                msg: "Debes igresar una existencia correcta"
            },
            notNull: {
                args: true,
                msg: "Debes ingresar la existencia del producto"
            },
            notEmpty: {
                args: true,
                msg: "Debes ingresar una existencia de producto correcta"
            }
        }
    },

    product_type_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        validate: {
            isNumeric: {
                msg: "Debes ingresar un tipo de producto valido (unidad o combo)"
            },
            notNull: {
                msg: "Debes ingresar un tipo de producto"
            }
        }
    },


    taxId: {
        type: DataTypes.NUMBER,
        allowNull: false,
        references: {
            model: "taxes",
            key: "id"
        },
        validate: {
            isNumeric: {
                args: true,
                msg: "Ingrese un impuesto correcto"
            },
            notEmpty: {
                args: true,
                msg: "El impuesto es obligatorio"
            },
            notNull: {
                args: true,
                msg: "El impuesto es obligatorio"
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

Product.belongsTo(Tax);
Product.belongsTo(ProductType, {foreignKey: 'product_type_id'});

module.exports = Product;