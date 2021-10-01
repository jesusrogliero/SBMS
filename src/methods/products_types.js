'use strict'
const ProductType = require('../models/ProductType.js');

const products_types = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns products_types
	 */
	'index-products_types': async function() {
		try {
			return await ProductType.findAll({raw:true});
		} catch (error) {
			return { message: error.message, code:0} ;
		}
	},

};

module.exports = products_types;
