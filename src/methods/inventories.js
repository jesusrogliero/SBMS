'use strict'

const Inventory = require('../models/Inventory.js');

const Inventories = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns clients
	 */
	'index-inventories': async function() {
		try {
			return await Inventory.findAll({raw:true});
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
	 'create-inventory': async function(params) {
        try {

            // creo un nuevo inventario
            const new_inventory =  await Inventory.create({
                product_id: params.product_id,
                lot: params.lot,
                quantity: params.quantity
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
	 * @returns {json} client
	 */
	'show-inventory': async function(id) {
		try {
			let inventory = await Inventory.findByPk(id, {raw: true});

			if(inventory === null) throw new Error("Este lote no existe");

			return inventory;

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
	'update-inventory': async function(params) {

		try {

            if(params.quantity < 0) throw new Error('La existencia del lote debe ser mayor a 0');

			if( empty(params.product_id) ) throw new Error("El producto es obligatorio");
			if( empty(params.lot) ) throw new Error("El numero de lote es obligatorio");
			if( empty(params.quantity) ) throw new Error("La cantidad del lote es obligatorio");

			let inventory = await Inventory.findByPk(params.id);
			
			if( inventory === null) throw new Error("Este lote no existe");

			inventory.name = params.name;
			inventory.lastname = params.lastname;
			inventory.cedula = params.cedula;

			await inventory.save();

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
	'destroy-inventory': async function(id) {
		try {
			let inventory = await Inventory.findByPk(id);

			if(inventory === null) throw new Error("Este lote no existe");

			inventory.destroy();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			return {message: error.message, code: 0};
		}
	}
};

module.exports = Inventories;