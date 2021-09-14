'use strict'

const Currency = require('../models/Currency.js');
const empty = require('../helpers/empty.js');

const currencies = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns currencies
	 */
	'index-currencies': async function() {
		try {
			return await Currency.findAll({raw:true});
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
	 'create-currency': async function(params) {
        try {

            // creo una nueva moneda
            const new_currency =  await Currency.create({
                name: params.name,
                symbol: params.symbol,
                exchange_rate: params.exchange_rate
            });

            return {message: "Agregado con exito", code: 1};
        } catch (error) {
            return { message: error.message, code:0 };
        }
    },


	/**
	 * funcion que muestra un recurso
	 * 
	 * @param {int} id 
	 * @returns {json} currency
	 */
	'show-currency': async function(id) {
		try {
			let currency = await Currency.findByPk(id, {raw: true});

			if(currency === null) throw new Error("Esta moneda no existe");

			return currency;

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
	'update-currency': async function(params) {

		try {

			if( empty(params.name) ) throw new Error("El nombre es obligatorio");
			if( empty(params.symbol) ) throw new Error("El simbolo es obligatorio");
			if( empty(params.exchange_rate) ) throw new Error("La tasa de cambio es obligatoria");

			let currency = await Currency.findByPk(params.id);

			if( currency.exchange_rate === 1 && params.exchange_rate != 1)
				throw new Error("No es posible actualizar la tasa de cambio de la moneda predeterminada");
			
			if( currency === null) throw new Error("Esta moneda no existe");

			currency.name = params.name;
			currency.symbol = params.symbol;
			currency.exchange_rate = params.exchange_rate;

			await currency.save();

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
	'destroy-currency': async function(id) {
		try {
			let currency = await Currency.findByPk(id);

			if(currency.exchange_rate === 1)
				throw new Error("No es posible eliminar la moneda predeterminada");

			if(currency === null) throw new Error("Esta moneda no existe");

			currency.destroy();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			return {message: error.message, code: 0};
		}
	}
};

module.exports = currencies;