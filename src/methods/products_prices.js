'use strict'

const ProductPrice = require('../models/ProductPrice.js');

const products_prices = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns prices
	 */
	'index-prd-prices': async function() {
		try {
			return await ProductPrice.findAll({raw:true});
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
	 'create-prd-price': async function(params) {
        try {

            // creo un nuevo precio
            const new_price =  await ProductPrice.create({
                name: params.name,
                price: params.price,
                is_default: params.is_default
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
	 * @returns {json} price
	 */
	'show-prd-price': async function(id) {
		try {
			let price = await ProductPrice.findByPk(id, {raw: true});

			if(price === null) throw new Error("Este precio no existe");

			return price;

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
	'update-prd-price': async function(params) {

		try {

            if(params.price <= 0) throw new Error('Debes ingresar un precio mayor a 0');

			if( empty(params.is_default) ) throw new Error("Debes ingresar si es o no el precio predeterminado");
			if( empty(params.name) ) throw new Error("El nombre del precio es obligatorio");
			if( empty(params.price) ) throw new Error("EL porcentage del precio es obligatorio");

			let price = await ProductPrice.findByPk(params.id);
            let price_default = await ProductPrice.findOne({ where: { is_default: true } });
			
			if( price === null) throw new Error("Este precio no existe");

			price.name = params.name;
			price.price = params.price;

            if( price.id != price_default.id) {
                
                if(params.is_default === true) {
                    price_default.is_default = false;
                    price.is_default = true;
                }
            }

			await price.save();

			return {message: "Actualizado con correctamente", code: 1};
			
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
	'destroy-prd-price': async function(id) {
		try {
			let price = await ProductPrice.findByPk(id);

			if(price === null) throw new Error("Este precio no existe");

			price.destroy();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			return {message: error.message, code: 0};
		}
	}
};

module.exports = products_prices;