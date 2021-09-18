'use strict'

const PurchaseOrderItem = require('../models/PurchaseOrderItem.js');
const PurchaseOrder = require('../models/PurchaseOrder.js');
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

        const t = await sequelize.Transaction();

        try {

            // validaciones

            const order = PurchaseOrder.findOne({
                where: { id: params.purchase_order_id },
				transaction: t
            });

            if(order.state_id != 1)
                throw new Error('No es posible editar esta orden de ingreso porque ya fue procesada');


            // busco si ya existe el producto en la orden
            const item = PurchaseOrderItem.findOne({
                where: {
                    [Op.and] : {
                        purchase_order_id: params.purchase_order_id,
                        product_id: params.product_id
                    }
                },
				transaction: t
            });

            if(item != null)
                throw new Error('Este producto ya fue agregado a la orden')
            
            params.price = params.price.toFixed(2);
            params.tax = params.tax /100;

            params.subtotal = params.price * params.quantity;
            params.tax_amount = params.subtotal * params.tax;
            params.total = params.subtotal + params.tax_amount;

            // creo un nuevo item
            item =  await PurchaseOrderItem.create({
                purchase_order_id: params.purchase_order_id,
				product_id: params.product_id,
                price: params.price,
                quantity: params.quantity,
                tax: params.tax,
                tax_amount: params.tax_amount,
                subtotal: params.subtotal,
                total: params.total
            }, { transaction: t });

            order.subtotal = order.subtotal + item.subtotal;
            order.tax_amount = order.tax_amount + item.tax_amount;
            order.total = order.total + item.total;
            order.total_products = order.total_products + 1;

            await order.save({transaction: t});

			await t.commit();

            return {message: "Agregado con exito", code: 1};
            
        } catch (error) {
			await t.rollback();
			
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

			if( empty(order) ) throw new Error("Este producto no existe");

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
		const t = await sequelize.Transaction();

		try {

			const item = await PurchaseOrderItem.findByPk(id, {raw: true});

			if( empty(item) ) throw new Error("Este producto no existe");

			const order = PurchaseOrder.findByPk(item.purchase_order_id);

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

			await item.save({transaction: t});

			// actuliazo la orden
			order.subtotal = order.subtotal + item.subtotal;
			order.tax_amount = order.tax_amount + item.tax_amount;
			order.total = order.total + item.total;

			await order.save({transaction: t});

			await t.commit();
			return {message: "Actualizado Correctamente", code: 1};

		} catch (error) {
			await t.rollback();
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

		const t = await sequelize.transaction();
		try {
            
			const item = await PurchaseOrderItem.findByPk(id);

            if(empty(item)) throw new Error("Este producto no existe");

            const order = await PurchaseOrderItem.findByPk(item.purchase_order_id);

            if(order.state_id != 1) throw new Error("Esta orden ya fue procesada");

			// actualizo la orden
			order.total = order.total - item.total;
			order.subtotal = order.subtotal - item.total;
			order.tax_amount = order.tax_amount - item.tax_amount;
			order.total_products--;

			item.destroy({transaction: t});
			order.save({transaction: t});

			await t.commit();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			await t.rollback();
			return {message: error.message, code: 0};
		}
	}
};

module.exports = purchase_orders_items;