const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const Provider = sequelize.define("providers", {
    
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },

    full_name: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: {
                args: true,
                msg: "Debes ingresar el nombre del provedor"
            },
            notEmpty: {
                args: true,
                msg: "Debes ingresar el nombre del provedor"
            }
        }
    },
    
    phone: {
        type: DataTypes.TEXT,
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


module.exports = Provider;