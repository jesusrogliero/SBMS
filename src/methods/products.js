'use strict'

const sequelize = require('../connection.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');
const Product = require('../models/Product.js');
const Tax = require('../models/Tax.js');
const ProductType = require('../models/ProductType.js');
const ProductCost = require('../models/ProductCost.js');
const ComboItem = require('../models/ComboItem.js');
const Currency = require('../models/Currency.js');
const Prices = require('../models/Price.js');
const createCosts = require('./products_costs.js')['create-cost'];
const updateCosts = require('./products_costs.js')['update-cost'];


let products = {

    /**
     * Ruta que muestra todos los recursos
     * 
     * @returns products
     */
    'index-products': async function () {

        try {
            return await Product.findAll({
                attributes: {
                    include: [
                        [sequelize.col('tax.percentage'), 'percentage'],
                        [sequelize.col('products_type.type'), 'product_type'],
                        [sequelize.col('products_type.id'), 'product_type_id']
                    ],
                },
                include: [
                    {
                        model: Tax,
                        required: true,
                        attributes: []
                    },
                    {
                        model: ProductType,
                        required: true,
                        attributes: []
                    }
                ],
                raw: true
            });

        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }

    },


    /**
    * Ruta que muestra todos los productos normales
    * 
    * @returns products
    */
    'index-products-standar': async function () {
        try {
            return await Product.findAll({
                attributes: {
                    include: [
                        [sequelize.col('tax.percentage'), 'percentage'],
                        [sequelize.col('products_type.type'), 'product_type'],
                        [sequelize.col('products_type.id'), 'product_type_id']
                    ],
                },
                include: [
                    {
                        model: Tax,
                        required: true,
                        attributes: []
                    },
                    {
                        model: ProductType,
                        required: true,
                        attributes: []
                    }
                ],
                where: {
                    product_type_id: 1
                },
                raw: true
            });
        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }
    },

    /**
     * Metodo que crea un nuevo recurso
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-product': async function (params) {

        try {

            if (params.stock < 0) throw new Error('La existencia debe ser mayor a 0');

            const product = await Product.create({
                name: params.name,
                taxId: params.taxId,
                stock: params.stock,
                product_type_id: params.product_type_id
            });

            if (params.product_type_id === 2) {

                if (empty(params.cost_combo) || params.cost_combo < 0)
                    throw new Error('Debes ingresar el costo del combo');

                let stock_prd = 100;
                for (let i = 0; i < params.items.length; i++) {

                    if (params.items[i].quantity < 1)
                        throw new Error('Debes especificar la cantidad de producto que deseas agregar al combo');

                    let prd = await Product.findOne({
                        where: {
                            id: params.items[i].product_id
                        }
                    });

                    // calculo el stock del combo
                    if (stock_prd > (prd.stock / params.items[i].quantity))
                        stock_prd = prd.stock / params.items[i].quantity;


                    await ComboItem.create({
                        combo_id: product.id,
                        product_id: params.items[i].product_id,
                        quantity: params.items[i].quantity
                    });
                }

                product.stock = stock_prd;
                await product.save();

                let result = await createCosts({
                    product_id: product.id,
                    currency_id: 1,
                    cost: params.cost_combo,
                });

                if (result.code === 0) throw new Error(result.message);

        
                return { message: "Combo Agregado con exito", code: 1 };

            }

            return { message: "Producto Agregado con exito", code: 1 };


        } catch (error) {

            if (!empty(error.errors)) {
                log.error(error.errors[0].message);
                return { message: error.errors[0].message, code: 0 };

            } else {
                log.error(error);
                return { message: error.message, code: 0 };
            }

        }

    },



    /**
     * funcion que ajusta el stock de los combos
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'ajust-stock-combo': async function () {
        try {

            const combos = await Product.findAll({
                where: {
                    product_type_id: 2
                }
            });

            // recorro todos los combos
            combos.forEach(async combo => {

                // busco los item del combo
                let combo_items = await ComboItem.findAll({
                    where: {
                        combo_id: combo.id
                    },
                    raw: true
                });

                // itero los items
                let stock_combo = 100;
                for (let i = 0; i < combo_items.length; i++) {

                    let prd = await Product.findByPk(combo_items[i].product_id);

                    // calculo el stock del combo
                    if (stock_combo > (prd.stock / combo_items[i].quantity))
                        stock_combo = prd.stock / combo_items[i].quantity;

                }

                combo.stock = parseInt(stock_combo);
                await combo.save();
            });

            return { message: "Existencia de los combos ajustada correctamente", code: 1 };


        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }
    },




    /**
     * funcion que muestra la informacion de un producto
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'get_product_prices': async function (params) {
        try {

            if (empty(params.id)) throw new Error('Debes seleccionar un producto');

            if (empty(params.currency_id))
                params.currency_id = 1;


            const product = await Product.findByPk(params.id);

            if (empty(product)) throw new Error('Este producto no existe');

            const product_cost = await ProductCost.findAll({
                attributes: {
                    include: [
                        [sequelize.col('currency.symbol'), 'symbol']
                    ]
                },
                include: [
                    {
                        model: Currency,
                        required: true,
                        attributes: []
                    }
                ],
                where: {
                    product_id: product.id,
                    currency_id: params.currency_id
                },
                raw: true
            });

            const prices = await Prices.findAll({ raw: true });

            let products_prices = [];

            product_cost.forEach(prd_cost => {

                for (let i = 0; i < prices.length; i++) {
                    products_prices.push({
                        price: parseFloat(prd_cost.cost + (prd_cost.cost * prices[i].price)).toFixed(2),
                        price_name: prices[i].name,
                        currency_symbol: prd_cost.symbol
                    });
                }
            });

            return products_prices;

        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * funcion que muestra la informacion de un producto
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'get_product_info': async function (params) {
        try {

            if (empty(params.id)) throw new Error('Debes seleccionar un producto');
            if (empty(params.quantity)) throw new Error('Debes ingresar que catidad sera incluida en el combo');
            if (params.quantity < 1) throw new Error('La cantidad de producto ingresada no es correcta');

            const product = await Product.findByPk(params.id);

            const cost = await ProductCost.findOne({
                where: {
                    currency_id: 1,
                    product_id: product.id
                }
            });

            if (empty(cost)) throw new Error('Este producto aun no tiene un costo definido');

            const currency = await Currency.findByPk(1);

            let data = {
                product_id: product.id,
                name: product.name,
                price: cost.cost * params.quantity,
                quantity: params.quantity,
                currency_symbol: currency.symbol
            }
            return { data, code: 1 };

        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }
    },


    /**
     * funcion que muestra un recurso
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'show-product': async function (id) {
        try {
            const product = await Product.findByPk(id, { raw: true });

            if (product === null) throw new Error("Este producto no existe");

            let items = null;

            if (product.product_type_id === 2) {

                items = await ComboItem.findAll({
                    attributes: {
                        include: [
                            [sequelize.col('product.name'), 'name'],
                        ],
                    },
                    include: [
                        {
                            model: Product,
                            required: true,
                            attributes: []
                        },
                    ],
                    where: {
                        combo_id: product.id
                    },
                    raw: true
                });

                let cost_combo = await ProductCost.findOne({
                    where: {
                        product_id: product.id
                    }
                });

                product.cost_combo = cost_combo.cost;
            }

            product.items = items;

            return product;

        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }
    },



    /**
     * funcion que actualiza los datos de un recurso
     * 
     * @param {*} params 
     * @returns 
     */
    'update-product': async function (params) {

        try {


            // valido que hayan llegado bien los datos
            if (empty(params.name)) throw new Error("El nombre del producto es obligatorio");
            if (empty(params.stock)) throw new Error("La existencia del producto es obligatoria");
            if (empty(params.taxId)) throw new Error("El impuesto del producto es Obligatorio");
            if (params.stock < 0) throw new Error("La existencia debe ser mayor a 0");

            // busco los datos del producto
            let product = await Product.findByPk(params.id);

            // verifico que exista
            if (product === null)
                throw new Error("Este producto no existe");


            // actualizo la informacion
            product.name = params.name;
            product.stock = params.stock;
            product.taxId = params.taxId;

            // en caso que se actualice un combo
            if (product.product_type_id === 2) {

                for (let i = 0; i < params.items.length; i++) {

                    let item = await ComboItem.findOne({
                        where: {
                            combo_id: product.id,
                            product_id: params.items[i].product_id
                        }
                    });

                    item.product_id = params.items[i].product_id;
                    item.quantity = params.items[i].quantity;

                    await item.save();
                }
            }

            await product.save();

            let result = await updateCosts({
                product_id: product.id,
                cost: params.cost_combo,
                currency_id: 1
            });

            if (result.code === 0) throw new Error(result.message);


            return { message: "Actualizado Correctamente", code: 1 };

        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }


    },


    /**
     * funcion que elimina a un recurso
     * 
     * @param {*} params 
     * @returns 
     */
    'destroy-product': async function destroy(id) {
        try {

            let product = await Product.findByPk(id);

            if (product === null) throw new Error("El producto no existe");

            if (product.product_type_id === 2) {
                const combo_items = await ComboItem.destroy({
                    where: {
                        combo_id: product.id
                    }
                });
            }

            await ProductCost.destroy({
                where: {
                    product_id: product.id
                }
            });

            // elimino el producto
            await product.destroy();

            return { message: "Eliminado correctamente", code: 1 };


        } catch (error) {
            log.error(error);
            return { message: error.message, code: 0 };
        }
    }

};

module.exports = products;