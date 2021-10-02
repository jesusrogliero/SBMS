const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');
const Product = require('./Product.js');


const InvoiceItem = sequelize.define("invoices_items", {
   
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "products",
            key: "id"
        }
    },

    invoice_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "invoices",
            key: "id"
        },
    },

    quantity: {
        type: DataTypes.NUMBER,
        allowNull: false,
        validate: {
            isNumeric: {
                msg: "Debes ingresar la cantidad de producto correcta"
            },
            notNull: {
                msg: "Debes ingresar la cantidad de producto"
            }
        }
    },

    price: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0
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

    createdAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    
    updatedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }

});

InvoiceItem.belongsTo(Product, {foreignKey: 'product_id'});

module.exports = InvoiceItem;