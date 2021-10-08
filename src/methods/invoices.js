'use strict'

const sequelize = require('../connection.js');
const { Op } = require("sequelize");
const log = require('electron-log');
const empty = require('../helpers/empty.js');
const Invoice = require('../models/Invoice.js');
const InvoiceState = require('../models/InvoiceState.js');
const InvoiceItem = require('../models/InvoiceItem.js');
const Currency = require('../models/Currency.js');
const Product = require('../models/Product.js');
const ajust_stock_combo = require('./products.js')['ajust-stock-combo'];
const ComboItem = require('../models/ComboItem.js');
const Client = require('../models/Client.js');


const invoices = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns invoices
	 */
	'index-invoices': async function(date) {
		try {

			let query = {
				attributes: {
					include: [
						[sequelize.col('currency.name'), 'currency_name'],
						sequelize.col('invoices_state.state'),
                        Invoice.sequelize.literal("client.name || ' ' || client.lastname AS client_name"),
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
						model: Client,
						required: true,
						attributes: []
					},
					{
						model: InvoiceState,
						required: true,
						attributes: []
					},
				],
				raw:true
			};

			if(date.length === 2 ) {
				query.where = {
					createdAt: {
						[Op.gte]: date[0],
						[Op.lte]: date[1]
					}
				}
			}

			if(date.length === 1 ) {
				query.where = {
					createdAt: date[0]
				}
			}

			let res = await Invoice.findAll(query);
			log.info(res);
			return res;

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
	 'create-invoice': async function(params) {
        try {

			let order = await Invoice.findOne({
				where: {
					client_id: params.client_id,
					state_id: 1
				},
				raw: true
			});

			if( !empty(order) )
				throw new Error(`Este cliente ya tiene una venta pendiente: Orden Nº ${order.id}`);

            // creo una nueva compra
            order =  await Invoice.create({
				state_id: 1,
                client_id: params.client_id,
                currency_id: params.currency_id,
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
	 * @returns {json} invoice
	 */
	'show-invoice': async function(id) {
		try {
			let order = await Invoice.findByPk(id, {raw: true});

			if( empty(order) ) throw new Error("Esta venta no existe");

			return order;

		} catch (error) {
			log.error(error);
			return {message: error.message, code: 0};
		}
	},


    /**
	 * funcion que aprueba una venta
	 * 
	 * @param {int} id 
	 * @returns message
	 */
	'approve-invoice': async function(id) {

		try {

			let res = await ajust_stock_combo();

			if(res.code === 0)
				throw res;

			const order = await Invoice.findByPk(id);
		
			if( empty(order) ) throw new Error("Esta orden de compra no existe");

			if( order.state_id != 2) throw new Error('Esta orden aun no ha sido generada');


			// busco todos los items de la orden
			let items = await InvoiceItem.findAll({
				where: { invoice_id: order.id },
				raw: true
			});

			
			items.forEach(async (item) => {
				let product = await Product.findByPk(item.product_id);
				
				if( (product.stock - item.quantity) <= 0 )
					throw new Error(`No es posible facturar este producto: ${product.name} por falta de existencia`);

				product.stock = product.stock - item.quantity;

				// si se trata de un combo
				if(product.product_type_id === 2) {
					
					let comboItems = await ComboItem.findAll({
						where: {
							combo_id: product.id,
						}
					});

					// recorro todos los items del combo
					comboItems.forEach( async comboItem => {
						let prd = await Product.findByPk(comboItem.product_id);

						// calculo la cantidad de producto segun la cantidad de combo que facture
						let quantity_item = comboItem.quantity * item.quantity;

						// verifico que haya existencia
						if( (prd.stock - quantity_item) <= 0 ) 
							throw new Error(`No es posible facturar este combo: ${product.name} por falta de stock en el producto: ${prd.name}`);
				
						prd.stock = prd.stock - quantity_item;

						await prd.save();
							
					});
				}

				await product.save();
			});

			order.state_id = 3;
			await order.save();

			return {message: "Facturado Correctamente", code: 1 };
	
		} catch (error) {
			log.error(error);
			return {message: error.message, code: 0};
		}
	},


	/**
	 * funcion que genera una orden de compra
	 * 
	 * @param {int} id 
	 * @returns message
	 */
	'generate-invoice': async function(id) {
		try {

			let order = await Invoice.findByPk(id);

			if( empty(order) ) throw new Error("Esta venta no existe");

			order.state_id = 2;
			await order.save();

			return {message: "La venta fue generada correctamente", code: 1 };
			
		} catch (error) {
			log.error(error);
			return {message: error.message, code: 0};
		}
	},


	/**
	 * funcion que elimina un recurso
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	'destroy-invoice': async function(id) {
		try {
			let order = await Invoice.findByPk(id);

			if( empty(order) ) throw new Error("Esta venta no existe");

			if(order.state_id != 1) throw new Error("Esta venta ya fue procesada");

			await InvoiceItem.destroy({
				where: {
					invoice_id: order.id
				},
			});

			await order.destroy();

			return {message: "La venta fue eliminada correctamente", code: 1};

		} catch (error) {
			log.error(error);
			return {message: error.message, code: 0};
		}
	}
};

module.exports = invoices;