'use strict'

const empty = require('../helpers/empty.js');
const Tax = require('../models/Tax.js');
const log = require('electron-log');

let Taxes = {

    /**
     * Ruta que muestra todos los recurso
     * 
     * @returns products
     */
     'index-taxes': async function() {

        try {
            return await Tax.findAll({
                attributes: { 
                    include: [ Tax.sequelize.literal("(percentage*100) || '%' AS percentage") ]
                },
                raw: true
            });

        } catch (error) {
            log.error(error);
            return {message: error.message, code: 0};
        }

    },


    /**
     * Metodo que crea un nuevo recurso
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-tax': async function(params) {

        try {

            if(params.percentage < 0) throw new Error('El porcentaje ingresado no es correcto');

            await Tax.create({
                name: params.name,
                percentage: params.percentage /100,
            });
    
            return {message: "Agregado con exito", code: 1};
        
        } catch (error) {
            
            if( !empty( error.errors ) ) {
                log.error(error.errors[0]);
                return {message: error.errors[0].message, code: 0};
            
            }else {
                log.error(error);
                return { message: error.message, code: 0 };
            }
                
        }

    },
    

    /**
     * funcion que muestra un recurso
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'show-tax': async function(id) {
        try {
            const tax = await Tax.findByPk(id, {
                attributes: {
                    include: [Tax.sequelize.literal('percentage*100 AS percentage')]
                },  
                raw: true
            });

            if(tax === null) throw new Error("Este impuesto no existe");

            return tax;

        }catch(error) {
            log.error(error);
            return {message: error.message, code: 0};
        }
    },
    


    /**
     * funcion que actualiza los datos de un recurso
     * 
     * @param {*} params 
     * @returns 
     */
    'update-tax': async function(params) {

        try {

            // valido que hayan llegado bien los datos
            if(empty(params.name)) throw new Error("El nombre del impuesto es obligatorio");
            if(empty(params.percentage)) throw new Error("La porcentaje es obligatorio");
            if(params.percentage <= 0) throw new Error("El porcentaje debe ser mayor a 0");

            let tax = await Tax.findByPk(params.id);

            // verifico que exista
            if(tax === null) {
                throw new Error("Este impuesto no existe");
            }

            // actualizo la informacion
            tax.name = params.name;
            tax.percentage = params.percentage /100;

            tax.save();

            return { message: "Actualizado Correctamente", code: 1 };

        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }


    },
    

    /**
     * funcion que elimina a un recurso
     * 
     * @param {*} params 
     * @returns 
     */
    'destroy-tax': async function destroy(id) {
        try {
            let tax = await Tax.findByPk(id);

            if (tax === null) throw new Error("El impuesto no existe");

            if(tax.id === 1) throw new Error("No es Posible eliminar este Impuesto");
            
            tax.destroy();

            return { message: "Eliminado Correctamente", code: 1 };

        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }
    }

};

module.exports = Taxes;