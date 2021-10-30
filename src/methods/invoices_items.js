'use strict'

const sequelize = require('sequelize');
const log = require('electron-log');
const empty = require('../helpers/empty.js');
const Invoice = require('../models/Invoice.js');
const InvoiceItem = require('../models/InvoiceItem.js');
const ProductCost = require('../models/ProductCost.js');
const Product = require('../models/Product.js');
const Price = require('../models/Price.js');
const Tax = require('../models/Tax.js');

const invoices_items = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns prices
	 */
	'index-invoices-items': async function(id) {
		try {
			return await InvoiceItem.findAll({
				attributes: {
					include: [
						[sequelize.col('product.name'), 'product_name'],
					]
				},
				include: [
					{
						model: Product,
						required: true,
						attributes: []
					},
				],
				where: {
					invoice_id: id
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
	 'create-invoice-item': async function(params) {
        try {

            if(params.quantity < 1) throw new Error('La cantidad de producto es incorrecta');

			let order = await Invoice.findByPk(params.invoice_id);

			if( empty(order) ) throw new Error('Ocurrio un error al ingresar el producto a la orden');

			const product = await Product.findByPk(params.product_id, {raw: true});

			if( empty(product) )
				throw new Error('El producto seleccionado no existe');

			if( (product.stock - params.quantity) < 0 ) throw new Error('Existencia del producto excedida');

			const product_cost = await ProductCost.findOne({
				where: {
					product_id: params.product_id,
					currency_id: order.currency_id
				},
				raw: true
			});
			
			const price = await Price.findByPk(params.price_id, {raw: true});

			const tax = await Tax.findByPk(product.taxId, {raw: true});

			let item = await InvoiceItem.findOne({
				where: {
					product_id: params.product_id,
					invoice_id: order.id
				}
			});

			if( !empty(item) ) throw new Error('Este producto ya fue agregado');

			item = InvoiceItem.build({
				product_id: params.product_id,
				invoice_id: order.id,
				quantity: params.quantity
			});

			let price_prd = product_cost.cost + (product_cost.cost * price.price);

			item.subtotal = price_prd * params.quantity ;
			item.tax_amount = item.subtotal * tax.percentage;
			item.total = item.subtotal + item.tax_amount;
			item.price = price_prd;


			order.tax_amount = order.tax_amount + item.tax_amount;
			order.subtotal = order.subtotal + item.subtotal;
			order.total = order.total + item.total;
			order.total_products = order.total_products + 1;


			item.subtotal = parseFloat(item.subtotal).toFixed(2);
			item.tax_amount = parseFloat(item.tax_amount).toFixed(2);
			item.total = parseFloat(item.total).toFixed(2);
			item.price = parseFloat(item.price).toFixed(2);

			order.tax_amount = parseFloat( order.tax_amount).toFixed(2);
			order.subtotal = parseFloat(order.subtotal).toFixed(2);
			order.total = parseFloat(order.total).toFixed(2);

			await item.save();
			await order.save();

            return {message: "Agregado con exito", code: 1};
            
        } catch (error) {
			
			if( !empty( error.errors ) ){
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
	'show-invoice_item': async function(id) {
		try {
			let item = await InvoiceItem.findByPk(id, {raw: true});

			if( empty(item) ) throw new Error("Error al mostrar los datos de este producto");

			return item;

		} catch (error) {
			log.error(error);
			return {message: error.message, code: 0};
		}
	},


	/**
	 * funcion que actualiza un recurso
	 * 
	 * @param {int} id 
	 * @returns {json} message
	 */
	'update-invoice_item': async function(params) {
		try {

			if(params.quantity < 1) throw new Error('La cantidad de producto es incorrecta');

			const item = await InvoiceItem.findByPk(params.id);

			if( empty(item) ) throw new Error("Este producto no existe");

			const order = await Invoice.findByPk(params.invoice_id);

			if( order.state_id != 1) throw new Error('Esta orden ya fue procesada');

			order.subtotal = order.subtotal - item.subtotal;
			order.tax_amount = order.tax_amount - item.tax_amount;
			order.total = order.total - item.total;

			const product = await Product.findByPk(item.product_id);
			const tax = await Tax.findByPk(product.taxId);

			if( (product.stock - params.quantity) < 0 ) throw new Error('Existencia del producto excedida');

			item.quantity = parseInt( params.quantity );
			item.subtotal = params.quantity * item.price;
			item.tax_amount = item.subtotal * tax.percentage;
			item.total = item.subtotal + item.tax_amount;

			order.subtotal = order.subtotal + item.subtotal;
			order.tax_amount = order.tax_amount + item.tax_amount;
			order.total = order.total + item.total;

			item.subtotal = parseFloat(item.subtotal).toFixed(2);
			item.tax_amount = parseFloat(item.tax_amount).toFixed(2);
			item.total = parseFloat(item.total).toFixed(2);

			order.tax_amount = parseFloat( order.tax_amount).toFixed(2);
			order.subtotal = parseFloat(order.subtotal).toFixed(2);
			order.total = parseFloat(order.total).toFixed(2);

			await item.save();
			await order.save();

			return {message: "El producto fue actualizado correctamente", code: 1};

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
	'destroy-invoice_item': async function(id) {
		try {

			const item = await InvoiceItem.findByPk(id);

			if( empty(item) ) throw new Error("Error al eliminar el producto de la orden");

			const order = await Invoice.findByPk(item.invoice_id);

            if(order.state_id != 1) throw new Error("Esta venta ya fue procesada");

			order.subtotal = order.subtotal - item.subtotal;
			order.tax_amount = order.tax_amount - item.tax_amount;
			order.total = order.total - item.total;
			order.total_products = order.total_products - 1;

			await item.destroy();
			await order.save();

			return {message: "Producto eliminado correctamente", code: 1};

		} catch (error) {
			log.error(error);
			return {message: error.message, code: 0};
		}
	}
};

module.exports = invoices_items;