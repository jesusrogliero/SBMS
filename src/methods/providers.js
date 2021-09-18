'use strict'

const Provider = require('../models/Provider.js');
const empty = require('../helpers/empty.js');

const providers = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns clients
	 */
	'index-providers': async function() {
		try {
			return await Provider.findAll({raw:true});
		} catch (error) {
			return { message: error.message, code:0} ;
		}
	},



    /**
     * Metodo que crea un nuevo recurso
     * 
     * @param {Json} params 
     * @returns message
     */
	 'create-provider': async function(params) {
        try {
            const new_provider =  await Provider.create({
                full_name: params.full_name,
                phone: params.phone,

            });

            return {message: "Agregado con exito", code: 1};
        } catch (error) {
            if( !empty( error.errors ) )
                return {message: error.errors[0].message, code: 0};
            else
                return { message: error.message, code: 0 };
        }
    },


	/**
	 * funcion que muestra un recurso
	 * 
	 * @param {int} id 
	 * @returns {json} provider
	 */
	'show-provider': async function(id) {
		try {
			let provider = await Provider.findByPk(id, {raw: true});

			if( empty(provider) ) throw new Error("Este provedor no existe");

			return provider;

		} catch (error) {
			return {message: error.message, code: 0};
		}
	},


	/**
	 * funcion que actualiza un recurso
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	'update-provider': async function(params) {

		try {

			if( empty(params.full_name) ) throw new Error("El nombre del provedor es obligatorio");

			let provider = await Provider.findByPk(params.id);
			
			if( empty(provider) ) throw new Error("El cliente no existe");

			provider.full_name = params.full_name;
			provider.phone = params.phone;

			await provider.save();

			return {message: "Actualizado Correctamente", code: 1};
			
		} catch (error) {
			return { message: error.message, code: 0 };
		}
	},



	/**
	 * funcion que elimina un recurso
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	'destroy-provider': async function(id) {
		try {
			let provider = await Provider.findByPk(id);

			if( empty(provider) ) throw new Error("Este provedor no existe");

			provider.destroy();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			return {message: error.message, code: 0};
		}
	}
};

module.exports = providers;