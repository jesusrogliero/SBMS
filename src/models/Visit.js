const {DataTypes } = require("sequelize");
const sequelize = require('../connection.js');

const Visit = sequelize.define("visits", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {            
            notNull: {
                arg: true,
                msg: "Debe ingresar la fecha de visita"
            },
            isDate: {
                arg: true,
                msg: "La fecha de visita no es valida"
            },
            notEmpty: {
                args: true,
                msg: "Debe ingresar la fecha de visita"
            }
        }
    },
    client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "clients",
            key: "id"
        },
        validate: {            
            notNull: {
                arg: true,
                msg: "Debe ingresar un cliente"
            },
        }
    },
    reason_visit_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "reasons_visits",
            key: "id"
        },
        validate: {            
            notNull: {
                arg: true,
                msg: "Debe especificar un motivo de visita valido"
            },
            notEmpty: {
                arg: true,
                msg: "Debe especificar el motivo de la visita del cliente"
            }
        }
    },
    attended_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "employees",
            key: "id"
        },
        validate: {            
            notNull: {
                arg: true,
                msg: "Debe especificar un empleado de la compañia"
            },
            notEmpty: {
                arg: true,
                msg: "Debe especificar un empleado valido"
            }
        }
    }
});

module.exports = Visit;