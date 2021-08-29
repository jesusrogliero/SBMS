'use strict'

const empty = require('../helpers/empty.js');
const Tax = require('../models/Tax.js');

let Taxes = {

    /**
     * Ruta que muestra todos los recurso
     * 
     * @returns products
     */
     'index-taxes': async function() {

        return await Tax.findAll({raw:true});

    },


    /**
     * Metodo que crea un nuevo recurso
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-tax': async function(params) {

        try {

            if(params.percentage < 0) throw new Error('El porcentaje debe ser mayor a 0');

            await Tax.create({
                name: params.name,
                parcentage: params.parcentage,
            });
    
            return {message: "Agregado con exito", code: 1};
        
        } catch (error) {
            return {message: error.message, code: 0};
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
            const tax = await Tax.findByPk(id, {raw: true});

            if(tax === null) throw new Error("Este impusto no existe");

            return tax;

        }catch(error) {
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
            if(empty(params.percentage)) throw new Error("La orcentaje es obligatorio");
            if(params.percentage < 0) throw new Error("El porcentaje debe ser mayor a 0");

            let tax = await Tax.findByPk(params.id);

            // verifico que exista
            if(tax === null) {
                throw new Error("Este impuesto no existe");
            }

            // actualizo la informacion
            tax.name = params.name;
            tax.percentage = params.percentage;

            product.save();

            return { message: "Actualizado Correctamente", code: 1 };

        } catch (error) {
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
            
            tax.destroy();

            return { message: error.message, code: 1 };

        } catch (error) {
            return { message: error.message, code: 0 };
        }
    }

};

module.exports = Taxes;