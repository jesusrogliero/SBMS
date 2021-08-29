const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const Client = sequelize.define("clients", {
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
                msg: "Debes ingresar el nombre del cliente"
            },
            notEmpty: {
                args: true,
                msg: "El nombre del cliente no es valido"
            }
        }
    },
    lastname: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: {
                args: true,
                msg: "Debes ingresar el apellido del cliente"
            },
            notEmpty: {
                args: true,
                msg: "El apellido del cliente no es valido"
            }
        }
    },
    cedula: {
        type: DataTypes.NUMBER,
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                args: true,
                msg: "La cedula de Identidad es obligatoria"
            },
            notEmpty: {
                args: true,
                msg: "La cedula ingresada no es correcta"
            },
            isNumeric: {
                args: true,
                msg: "La cedula ingresada no es correcta"
            }
        }
    }
});


module.exports = Client;