'use strict'

const empty = require('../helpers/empty.js');
const Price = require('../models/Price.js');
const log = require('electron-log');


const prices = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns prices
	 */
	'index-prices': async function() {
		try {
			return await Price.findAll({
				attributes: { 
					include: [ 
						Price.sequelize.literal("(price*100) || '%' AS price"),
						Price.sequelize.literal("IIF(is_default, 'SI', 'NO') AS is_default")
				 	],
				},
				raw:true
			});

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
	 'create-price': async function(params) {
        try {

			let price_default = await Price.findOne({ where: { is_default: true } });

			if( !empty(price_default) && params.is_default == true)
				throw new Error('Ya existe una precio predeterminado');

            // creo un nuevo precio
            const new_price =  await Price.create({
                name: params.name,
                price: params.price / 100,
                is_default: params.is_default
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
	 * @returns {json} price
	 */
	'show-price': async function(id) {
		try {
			let price = await Price.findByPk(id, {
				attributes: {
					include: [Price.sequelize.literal('price*100 AS price')]
				},
				raw: true
			});

			if(price === null) throw new Error("Este precio no existe");
			return price;

		} catch (error) {
			log.error(error);
			return {message: error.message, code: 0};
		}
	},


	/**
	 * funcion que actualiza un recurso
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	'update-price': async function(params) {

		try {

            if(params.price <= 0) throw new Error('Debes ingresar un precio mayor a 0');

			if( empty(params.is_default) ) throw new Error("Debes ingresar si es o no el precio predeterminado");
			if( empty(params.name) ) throw new Error("El nombre del precio es obligatorio");
			if( empty(params.price) ) throw new Error("EL porcentage del precio es obligatorio");

			let price = await Price.findByPk(params.id);
            let price_default = await Price.findOne({ where: { is_default: true } });
			
			if( price === null) throw new Error("Este precio no existe");

			price.name = params.name;
			price.price = params.price / 100;

            if( price.id != price_default.id) {
                
                if(params.is_default === true) {
                    price_default.is_default = false;
                    price.is_default = true;
                }
            }

			await price.save();

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
	'destroy-price': async function(id) {
		try {
			let price = await Price.findByPk(id);

			if(price === null) throw new Error("Este precio no existe");

			if(price.is_default === true)
				throw new Error('No es posible eliminar el precio predeterminado');

			price.destroy();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			log.error(error);
			return {message: error.message, code: 0};
		}
	}
};

module.exports = prices;