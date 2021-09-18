'use strict'

const ProductCost = require('../models/ProductCost.js');
const Currency = require('../models/Currency.js');
const empty = require('../helpers/empty.js');

const products_costs = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns currencies
	 */
	'index-costs': async function() {
		try {
			return await ProductCost.findAll({raw:true});
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
	 'generate_product_cost': async function(params) {
        try {

            // busco todas las monedas
            const currencies = Currency.findAll();

            // creo un nuevo costo de producto
            const new_cost =  await ProductCost.create({
                productId: params.productId,
                currencyId: params.currencyId,
                cost: params.cost
            });

            return {message: "Agregado con exito", code: 1};
        } catch (error) {
            if( !empty( error.errors ) )
                return {message: error.errors[0].message, code: 0};
            else
                return { message: error.message, code: 0 };
        }
    },

};

module.exports = products_costs;