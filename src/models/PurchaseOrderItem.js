const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const PurchaseOrderItem = sequelize.define("purchase_orders_items", {
   
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    Purchase_order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "purchases_orders",
            key: "id"
        }
    },

    product_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        references: {
            model: "products",
            key: "id"
        },
        validate: {
            notNull: {
                args: true,
                msg: "Debes ingresar el producto"
            }
        }
    },

    quantity: {
        type: DataTypes.NUMBER,
        allowNull: false,
        validate: {
            isNumeric: {
                msg: "Debes ingresar la catidad de productos correcta"
            },
            notNull: {
                args: true,
                msg: "Debes ingresar la cantidad de producto"
            },
            notEmpty: {
                args: true,
                msg: "Debes ingresar la catidad de productos correcta"
            }
        }
    },

    price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            isDecimal: {
                args: true,
                msg: "Debes ingresar un precio correcto"
            },
            notNull: {
                args: true,
                msg: "Debes ingresar el precio del producto"
            },
        }
    },

    tax: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isDecimal: {
                args: true,
                msg: "Debes ingresar un impuesto correcto"
            },
        }
    },

    subtotal: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
    },

    tax_amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
    },

    total: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0
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


module.exports = PurchaseOrderItem;