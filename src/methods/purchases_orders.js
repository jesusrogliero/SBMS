'use strict'

const sequelize = require('sequelize');
const empty = require('../helpers/empty.js');
const PurchaseOrder = require('../models/PurchaseOrder.js');
const Currency = require('../models/Currency.js');
const Provider = require('../models/Provider.js');
const PurchaseOrderState = require('../models/PurchaseOrderState.js');

const purchase_orders = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns prices
	 */
	'index-purchases': async function() {
		try {
			let a =  await PurchaseOrder.findAll({
				attributes: {
					include: [
						[sequelize.col('currency.name'), 'currency_name'],
						sequelize.col('purchase_orders_state.state'),
						sequelize.col('provider.full_name'),
						[sequelize.col('currency.symbol'), 'currency_symbol'],
					]
				},
				include: [
					{
						model: Currency,
						required: true,
						attributes: []
					},
					{
						model: Provider,
						required: true,
						attributes: []
					},
					{
						model: PurchaseOrderState,
						required: true,
						attributes: []
					},
				],
				raw:true
			});
			console.log(a);
			return a;
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
                observation: params.observation,
                date: params.date,
				tax: params.tax,
				state_id: 1,
                provider_id: params.provider_id,
                currency_id: params.currency_id,
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
	 * @returns {json} price
	 */
	'show-purchase': async function(id) {
		try {
			let order = await ProductPrice.findByPk(id, {raw: true});

			if( empty(order) ) throw new Error("Esta orden de compra no existe");

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

			if( empty(order) ) throw new Error("Esta compra no existe");

            if(order.state_id != 1) throw new Error("Esta orden ya fue procesada");

			order.destroy();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			return {message: error.message, code: 0};
		}
	}
};

module.exports = purchase_orders;