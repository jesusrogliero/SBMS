'use strict'

const sequelize = require('../connection.js');
const { Op} = require("sequelize");
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

			return await Invoice.findAll(query);
		
		} catch (error) {
			log.error(error);
			return { message: error.message, code:0} ;
		}
	},


	/**
	 * mustra el total vendido hoy
	 * 
	 * @returns invoices
	 */
	'get-sold-today': async function() {
		try {

			let invoices = await Invoice.findAll({
				where: {
					createdAt: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
					state_id: 3
				},
				raw: true
			});

			const default_currency = await Currency.findByPk(1);

			let sold_today = 0;

			for (let i = 0; i < invoices.length; i++) {

				let currency = await Currency.findByPk(invoices[i].currency_id);

				let exchange_rate = currency.exchange_rate / default_currency.exchange_rate;

				let monto = invoices[i].total * exchange_rate;

				sold_today = monto + sold_today;
			}


			return {
				sold: parseFloat( sold_today ).toFixed(2),
				symbol: default_currency.symbol
			};

		} catch (error) {
			log.error(error);
			return { message: error.message, code:0} ;
		}
	},


		/**
	 * mustra el total vendido hoy
	 * 
	 * @returns invoices
	 */
		 'get-sold-week': async function() {
			try {

				let today = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10);
				let last_week = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 2204800)).toISOString().substr(0, 10);
				
				let invoices = await Invoice.findAll({
					where: {
						createdAt: {
							[Op.between]: [last_week, today],  
						},
						state_id: 3
					},
					raw: true
				});

	
				const default_currency = await Currency.findByPk(1);
	
				let sold_week = 0;
	
				for (let i = 0; i < invoices.length; i++) {
	
					let currency = await Currency.findByPk(invoices[i].currency_id);
	
					let exchange_rate = currency.exchange_rate / default_currency.exchange_rate;
	
					let monto = invoices[i].total * exchange_rate;
	
					sold_week = monto + sold_week;
				}
				
				return {
					sold: parseFloat( sold_week ).toFixed(2),
					symbol: default_currency.symbol
				};
	
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
                currency_id: params.currency_id
            });
			
            return {invoice: order.dataValues, message: "Agregado con exito", code: 1};
            
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
	 * funcion que ve si un cliente tiene una factura pendiente
	 * 
	 * @param {int} id 
	 * @returns {json} invoice
	 */
	'show-invoice-client': async function(client_id) {
		try {
			let order = await Invoice.findOne({
				attributes: {
					include: [
						[sequelize.col('currency.symbol'), 'currency_symbol'],
					]
				},
				include: [
					{
						model: Currency,
						required: true,
						attributes: []
					},
				],

				where: {
					client_id: client_id,
					state_id: 1
				},
				raw: true
			});

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


			// valido que haya stock disponible
			for (let i = 0; i < items.length; i++) {
				let product = await Product.findByPk(items[i].product_id);
				
				if( (product.stock - items[i].quantity) < 0 )
					throw new Error(`No es posible facturar este producto: ${product.name} por falta de existencia`);
				

				// si se trata de un combo
				if(product.product_type_id === 2) {
					
					let comboItems = await ComboItem.findAll({
						where: {
							combo_id: product.id,
						}
					});


					// recorro todos los items del combo
					for (let j = 0; j < comboItems.length; j++) {
					
						let prd = await Product.findByPk(comboItems[j].product_id);

						// calculo la cantidad de producto segun la cantidad de combo que facture
						let quantity_item = comboItems[j].quantity * items[i].quantity;

						// verifico que haya existencia
						if( (prd.stock - quantity_item) < 0 ) 
							throw new Error(`No es posible facturar este combo: ${product.name} por falta de stock en el producto: ${prd.name}`);
		
					}

				}
			}


			for (let i = 0; i < items.length; i++) {

				let product = await Product.findByPk(items[i].product_id);
				product.stock = product.stock - items[i].quantity;

				// si se trata de un combo
				if(product.product_type_id === 2) {
					
					let comboItems = await ComboItem.findAll({
						where: {
							combo_id: product.id,
						}
					});


					// recorro todos los items del combo
					for (let j = 0; j < comboItems.length; j++) {
					
						let prd = await Product.findByPk(comboItems[j].product_id);

						// calculo la cantidad de producto segun la cantidad de combo que facture
						let quantity_item = comboItems[j].quantity * items[i].quantity;

						// verifico que haya existencia
						if( (prd.stock - quantity_item) < 0 ) 
							throw new Error(`No es posible facturar este combo: ${product.name} por falta de stock en el producto: ${prd.name}`);
				
						prd.stock = prd.stock - quantity_item;

						await prd.save();	
					}

				}

				await product.save();
			}


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