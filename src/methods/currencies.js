'use strict'

const Currency = require('../models/Currency.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');

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
			log.error(error);
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

			if(params.exchange_rate < 2) throw new Error('Debes ingresar una tasa de cambio correcta');

            // creo una nueva moneda
            const new_currency =  await Currency.create({
                name: params.name,
                symbol: params.symbol,
                exchange_rate: params.exchange_rate
            });

            return {message: "Agregado con exito", code: 1};
        } catch (error) {
			
			if( !empty( error.errors ) ) {
				log.error(error.errors[0]);
				return {message: error.errors[0].message, code: 0};
			
			}else{
				log.error(error);
				return { message: error.message, code: 0 };
			}
				
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
			log.error(error);
			return {message: error.message, code: 0};
		}
	},

	/**
	 * funcion que muestra el symbolo de la moneda
	 * 
	 * @param {int} id 
	 * @returns {json} currency
	 */
		 'show-currency-symbol': async function(id) {
			try {
				let currency = await Currency.findOne({
					attributes: ['symbol'],
					where: {
						id: id
					},
					raw: true
				});
	
				if(currency === null) throw new Error("Esta moneda no existe");
				
				return currency;
	
			} catch (error) {
				log.error(error);
				return {message: error.message, code: 0};
			}
		},

	
	/**
	 * funcion que actualiza la tasa de cambio de una moneda
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	 'update-exchange_rate': async function(params) {

		try {

			// valido la informacion
			if( empty(params.id) ) throw new Error("Error al cambiar actualizar la tasa de cambio");
			if( empty(params.exchange_rate) ) throw new Error("Debes ingresar una tasa de cambio correcta");
			if( empty(params.exchange_rate < 2) ) throw new Error("Debes ingresar una tasa de cambio correcta");

			let currency = await Currency.findByPk(params.id);

			// en caso que aun no se haya creado la moneda dolar
			if( empty(currency) ) 
				throw new Error('Debes crear moneda Dolar para establecer una tasa de cambio');
			
			if( currency.exchange_rate === 1 && currency.id === 1)
				throw new Error("No es posible actualizar la tasa de cambio de la moneda predeterminada");

			currency.exchange_rate = params.exchange_rate;

			await currency.save();

			return {message: "Actualizado Correctamente", code: 1};
			
		} catch (error) {
			log.error(error);
			return { message: error.message, code: 0 };
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
			if( empty(params.exchange_rate < 2) ) throw new Error("Debes ingresar una tasa de cambio correcta");

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
			log.error(error);
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
			log.error(error);
			return {message: error.message, code: 0};
		}
	}
};

module.exports = currencies;