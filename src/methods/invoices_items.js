'use strict'

const sequelize = require('sequelize');
const empty = require('../helpers/empty.js');
const Invoice = require('../models/Invoice.js');
const InvoiceState = require('../models/InvoiceState.js');
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
	'index-invoices-items': async function() {
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
				raw:true
			});

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
	 'create-invoice-item': async function(params) {
        try {

            if(params.quantity < 1) throw new Error('La cantidad de producto es incorrecta');

            let order = await Invoice.findByPk(params.invoice_id);

            if( Object.keys(order).length === 0 ) {
                order = await Invoice.create({
                    state_id: 1,
                    client_id: client.id,
                    currency_id: params.currency_id,
                    invoice_id: params.invoice_id
                });
            }

			const product = await Product.findByPk(params.product_id, {raw: true});

			if( empty(product) )
				throw new Error('El producto seleccionado no existe');

			const product_cost = await ProductCost.findOne({
				where: {
					product_id: params.product_id,
					currency_id: order.currency_id
				},
				raw: true
			});
			
			const price = await Price.findByPk(params.price_id, {raw: true});

			const tax = await Tax.findByPk(product.taxId, {raw: true});

			const item = InvoiceItem.build({
				product_id: params.product_id,
				invoice_id: order.id,
				quantity: params.quantity
			});

			let price_prd = parseFloat(product_cost.cost + (product_cost.cost * price.price) );
			
			item.subtotal = price_prd * params.quantity;
			item.tax_amount = parseFloat(item.subtotal * tax.percentage);
			item.total = parseFloat( item.subtotal + item.tax_amount);
			item.price = price_prd;

			order.tax_amount = order.tax_amount + item.tax_amount;
			order.subtotal = order.subtotal + item.subtotal;
			order.total = order.total + item.total;
			order.total_products = order.total_products + 1;

			await item.save();
			await order.save();

            return {message: "Agregado con exito", code: 1};
            
        } catch (error) {
			console.log(error);
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
	'show-invoice_item': async function(id) {
		try {
			let order = await Invoice.findByPk(id, {raw: true});

			if( empty(order) ) throw new Error("Esta venta no existe");

			return order;

		} catch (error) {
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
			const item = await InvoiceItem.findByPk(params.id, {raw: true});

			if( empty(item) ) throw new Error("Este producto no existe");

			const order = await Invoice.findByPk(params.invoice_id, {raw: true});

			if( order.state_id != 1) throw new Error('Esta orden ya fue procesada');

			order.subtotal = order.subtotal - item.subtotal;
			order.tax_amount = order.tax_amount - item.tax_amount;
			order.total = order.total - item.total;

			const tax = await Tax.findByPk(product.taxId);

			item.subtotal = parseFloat( params.quantity * item.price).toFixed(2);
			item.tax_amount = parseFloat(item.subtotal * tax.percentage).toFixed(2);
			item.total = item.subtotal + item.tax_amount;

			order.subtotal = order.subtotal + item.subtotal;
			order.tax_amount = order.tax_amount + item.tax_amount;
			order.total = order.total + item.total;

			await item.save();
			await order.save();

			return {message: "El producto fue actualizado correctamente", code: 1};

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
			return {message: error.message, code: 0};
		}
	}
};

module.exports = invoices_items;