'use strict'

const ProductCost = require('../models/ProductCost.js');
const Currency = require('../models/Currency.js');
const empty = require('../helpers/empty.js');
const Product = require('../models/Product.js');
const Op = require('sequelize');
const sequelize = require('sequelize');

const products_costs = {

	/**
	 * Ruta que muestra todos los recursos
	 * 
	 * @returns currencies
	 */
	'index-costs': async function() {
		try {
			return await ProductCost.findAll({
                attributes: {
                    include: [
                        [sequelize.col('currency.symbol'), 'currency_symbol'],
                        [sequelize.col('product.name'), 'product_name'],
                    ]
                },
                include: [
                    {
                        model: Product,
                        required: true,
                        attributes: []
                    },
                    {
                        model: Currency,
                        required: true,
                        attributes: []
                    }
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
	 'generate_product_cost': async function(order, items) {
        try {

            // busco todas las monedas
            const currencies =  await Currency.findAll();
            const currency_order = await Currency.findByPk(order.currency_id); 

            items.forEach( async (item) => {

                currencies.forEach( async (currency) => {
                    let exchange_rate = currency_order.exchange_rate / currency.exchange_rate;
                    
                    let products_costs = await ProductCost.findOne({
                        where:{
                            product_id: item.product_id,
                            currency_id: currency.id
                        }
                    });

                    // si el costo no existe se genera uno nuevo
                    if( empty(products_costs) ) {
                        products_costs = ProductCost.build({
                            currency_id: currency.id,
                            product_id: item.product_id,
                        });
                    }

                    products_costs.cost = item.price * exchange_rate;
                    await products_costs.save();
                });
            });

            return true;

        } catch (error) {
            if( !empty( error.errors ) )
                return {message: error.errors[0].message, code: 0};
            else
                return { message: error.message, code: 0 };
        }
    },


    /**
     * Metodo que muestra un recurso
     * 
     * @param {Json} params 
     * @returns cost
     */
	 'show-cost': async function(id) {
        try {
            const cost = await ProductCost.findByPk(id, {raw: true});

            if( empty(cost) ) throw new Error('Este costo no existe');

            return cost;

        } catch (error) {
            return { message: error.message, code: 0 };
        }
    },


    /**
     * Metodo que ajusta los costos
     * 
     */
	 'adjust-costs': async function(currency_id) {
        try {
            const currency = await Currency.findByPk(currency_id);
            const currency_default = await Currency.findOne({
                where: {
                    exchange_rate: 1
                }
            });


            const products_costs = await ProductCost.findAll({
                where: {
                    currency_id: currency.id
                },
                raw: true   
            });


            let prd_cost = null;
            for (let i = 0; i < products_costs.length; i++) {
                
                prd_cost = await ProductCost.findOne({
                    where: {
                        currency_id: currency_default.id,
                        product_id: products_costs[i].product_id
                    }
                });

                prd_cost.cost = currency.exchange_rate * products_costs[i].cost;
                await prd_cost.save();
            }

            return {message: 'Costos actualizados correctamente', code:1 };

        } catch (error) {
            console.log(error);
            return { message: error.message, code: 0 };
        }
    },


};

module.exports = products_costs;