'use strict'

const PurchaseOrderItem = require('../models/PurchaseOrderItem.js');
const PurchaseOrder = require('../models/PurchaseOrder.js');
const Product = require('../models/Product.js');
const empty = require('../helpers/empty.js');
const {Op} = require('sequelize');
const sequelize = require('sequelize');

const purchase_orders_items = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns items
	 */
	'index-purchases_items': async function(purchase_order_id) {
		try {
			return await PurchaseOrderItem.findAll({
				attributes: { 
					include:[
						[sequelize.col('product.name'), 'product_name']
					]
				},
				include: [
					{
						model: Product,
						required: true,
						attributes: []
					}
				],
                where:{ purchase_order_id: purchase_order_id },
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
	 'create-purchase-item': async function(params) {

        try {

			if(params.price < 1) throw new Error('El precio ingresado no es correcto');
			if(params.tax < 0 ) throw new Error('El impuesto ingresado no es correcto');
			if(params.quantity < 1) throw new Error('La cantidad de producto ingresada no es correcta');

			const order = await PurchaseOrder.findOne({
				where: { id: params.purchase_order_id }
			});

			
			if(order.state_id != 1)
				throw new Error('No es posible editar esta orden de ingreso porque ya fue procesada');


			// busco si ya existe el producto en la orden
			let item = await PurchaseOrderItem.findOne({
				where: {
					[Op.and] : {
						purchase_order_id: params.purchase_order_id,
						product_id: params.product_id
					}
				}
			});


			if(item != null)
				throw new Error('Este producto ya fue agregado a la orden')
			
			params.price = params.price;
			params.tax = params.tax /100;

			params.subtotal = params.price * params.quantity;
			params.tax_amount = params.subtotal * params.tax;
			params.total = params.subtotal + params.tax_amount;

			// creo un nuevo item
			item =  await PurchaseOrderItem.create({
				purchase_order_id: order.id,
				product_id: params.product_id,
				price: params.price,
				quantity: params.quantity,
				tax: params.tax,
				tax_amount: params.tax_amount,
				subtotal: params.subtotal,
				total: params.total
			});

			order.subtotal = order.subtotal + item.subtotal;
			order.tax_amount = order.tax_amount + item.tax_amount;
			order.total = order.total + item.total;
			order.total_products = order.total_products + 1;

			await order.save();


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
	'show-purchase_item': async function(id) {
		try {
			let item = await PurchaseOrderItem.findByPk(id, {raw: true});

			if( empty(item) ) throw new Error("Este producto no existe");

			return item;

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
	'update-purchase_item': async function(params) {

		try {

			if(params.price < 1) throw new Error('Debes ingresar un precio correcto');
			if(params.quantity < 1) throw new Error('La cantidad de productos no es correcta');
			if(params.tax < 0) throw new Error('El impuesto ingresado no es correcto');
			if( empty(params.product_id) ) throw new Error('Debes seleccionar un producto');

			const item = await PurchaseOrderItem.findByPk(params.id);

			if( empty(item) ) throw new Error("Este producto no existe");

			const order = await PurchaseOrder.findByPk(item.purchase_order_id);

			if( order.state_id != 1) throw new Error('Esta orden ya fue procesada');

			// elimino los datos anteriores
			order.tax_amount = order.tax_amount - item.tax_amount; 
			order.subtotal = order.subtotal - item.subtotal;
			order.total = order.total - item.total;

			// actualizo los datos
			item.product_id = params.product_id;
			item.quantity = params.quantity;
			item.price = params.price;
			item.tax = params.tax /100;

			// recalculo el item
			item.subtotal = params.quantity * item.price;
			item.tax_amount = item.subtotal * item.tax;
			item.total = item.subtotal + item.tax_amount;

			await item.save();

			// actuliazo la orden
			order.subtotal = order.subtotal + item.subtotal;
			order.tax_amount = order.tax_amount + item.tax_amount;
			order.total = order.total + item.total;

			await order.save();

			return {message: "Actualizado Correctamente", code: 1};

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
	'destroy-purchase_item': async function(id) {
		try {
            
			const item = await PurchaseOrderItem.findByPk(id);

            if(empty(item)) throw new Error("Este producto no existe");

            const order = await PurchaseOrder.findByPk(item.purchase_order_id);

            if(order.state_id != 1) throw new Error("Esta orden ya fue procesada");

			// actualizo la orden
			order.total = order.total - item.total;
			order.subtotal = order.subtotal - item.total;
			order.tax_amount = order.tax_amount - item.tax_amount;
			order.total_products--;

			item.destroy();
			order.save();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			return {message: error.message, code: 0};
		}
	}
};

module.exports = purchase_orders_items;