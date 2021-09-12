const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const Taxes = sequelize.define("taxes", {
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
                msg: "Debes ingresar el nombre el nombre del impuesto"
            },
            notEmpty: {
                args: true,
                msg: "El nombre del impuesto no es valido"
            }
        }
    },
    percentage: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            isDecimal:{
                args: true,
                msg: "Debes ingresar un impuesto valido"
            },
            notNull: {
                args: true,
                msg: "Debes ingresar el impuesto"
            },
            notEmpty: {
                args: true,
                msg: "Debes ingresar el impuesto"
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


module.exports = Taxes;