'use strict'

const PurchaseOrder = require('../models/PurchaseOrder.js');

const purchase_orders = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns prices
	 */
	'index-purchases': async function() {
		try {
			return await PurchaseOrder.findAll({raw:true});
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
	 'create-purchase': async function(params) {
        try {

            // creo una nueva compra
            const new_order =  await PurchaseOrder.create({
                state_id: params.state_id,
                observation: params.observation,
                date: params.date,
                provider_id: params.provider_id,
                currency_id: params.currency_id,
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
	'show-purchase': async function(id) {
		try {
			let order = await ProductPrice.findByPk(id, {raw: true});

			if(order === null) throw new Error("Esta orden de compra no existe");

			return order;

		} catch (error) {
			return {message: error.message, code: 0};
		}
	},


    /**
	 * funcion que aprueba una orden de compra
	 * 
	 * @param {int} id 
	 * @returns message
	 */
	'approve-purchase': async function(id) {
		try {

            // codigo para aprovar la orden
            
		} catch (error) {
			return {message: error.message, code: 0};
		}
	},


	/**
	 * funcion que elimina un recurso
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	'destroy-purchase': async function(id) {
		try {
			let order = await PurchaseOrder.findByPk(id);

			if(order === null) throw new Error("Esta compra no existe");

            if(order.state_id != 1) throw new Error("Esta orden ya fue procesada");

			order.destroy();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			return {message: error.message, code: 0};
		}
	}
};

module.exports = purchase_orders;