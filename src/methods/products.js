'use strict'

const sequelize = require('sequelize');
const empty = require('../helpers/empty.js');
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
     'index-products': async function() {

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
            raw:true
        });

    },


     /**
     * Ruta que muestra todos los productos normales
     * 
     * @returns products
     */
      'index-products-standar': async function() {

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
            raw:true
        });

    },

    /**
     * Metodo que crea un nuevo recurso
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-product': async function(params) {

        try {

            return await Product.sequelize.transaction(async (t) => {
                
                if(params.stock < 0) throw new Error('La existencia debe ser mayor a 0');

                const product = await Product.create({
                    name: params.name,
                    stock: params.stock,
                    taxId: params.taxId,
                    product_type_id: params.product_type_id
                }, {transaction: t});

                if(params.product_type_id === 2) {

                    if( empty(params.cost_combo) || params.cost_combo < 0)
                        throw new Error('Debes ingresar el costo del combo');
                    
                    for (let i = 0; i < params.items.length; i++) {

                        if( params.items[i].quantity < 1)
                            throw new Error('Debes especificar la cantidad de producto que deseas agregar al combo');

                        await ComboItem.create({
                            combo_id: product.id,
                            product_id: params.items[i].product_id,
                            quantity: params.items[i].quantity
                        }, {transaction: t});
                    }

                    let result = await createCosts({
                        product_id: product.id,
                        currency_id: 1,
                        cost: params.cost_combo,
                    });

                    if(result.code === 0) throw new Error(result.message);

                }
        
                return {message: "Agregado con exito", code: 1};

            });

        
        } catch (error) {
            if( !empty( error.errors ) )
                return {message: error.errors[0].message, code: 0};
            else
                return { message: error.message, code: 0 };
        }

    },

    /**
     * funcion que muestra la informacion de un producto
     * 
     * @param {int} id 
     * @returns {json} product
     */
        'get_product_prices': async function(params) {
            try {
    
                if( empty(params.id) ) throw new Error('Debes seleccionar un producto');
                
                if( empty(params.currency_id)) 
                    params.currency_id = 1;


                const product = await Product.findByPk(params.id);

                if( empty(product )) throw new Error('Este producto no existe');

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

                const prices = await Prices.findAll({raw: true});

                let products_prices = [];

                product_cost.forEach( prd_cost => {
                    
                    for (let i = 0; i < prices.length; i++) {
                        products_prices.push({
                            price: parseFloat(prd_cost.cost + (prd_cost.cost * prices[i].price) ).toFixed(2),
                            price_name: prices[i].name,
                            currency_symbol: prd_cost.symbol
                        });
                    }
                });
    
                return products_prices;
    
            }catch(error) {
                console.error(error);
                return {message: error.message, code: 0};
            }
        },

    
    /**
     * funcion que muestra la informacion de un producto
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'get_product_info': async function(params) {
        try {

            if( empty(params.id) ) throw new Error('Debes seleccionar un producto');
            if( empty(params.quantity) ) throw new Error('Debes ingresar que catidad sera incluida en el combo');
            if( params.quantity < 1 ) throw new Error('La cantidad de producto ingresada no es correcta');

            const product = await Product.findByPk(params.id);

            const cost = await ProductCost.findOne({
                where: {
                    currency_id: 1,
                    product_id: product.id
                }
            });

            if( empty(cost) ) throw new Error('Este producto aun no tiene un costo definido');      

            const currency = await Currency.findByPk(1);

            let data = {
                product_id: product.id,
                name: product.name,
                price: cost.cost * params.quantity,
                quantity: params.quantity,
                currency_symbol: currency.symbol
            }
            return {data, code:1};

        }catch(error) {
            console.error(error);
            return {message: error.message, code: 0};
        }
    },


    /**
     * funcion que muestra un recurso
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'show-product': async function(id) {
        try {
            const product = await Product.findByPk(id, {raw: true});

            if(product === null) throw new Error("Este producto no existe");

            let items = null;

            if(product.product_type_id === 2) {

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
                    where:{
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
            
            console.log(product);
            return product;

        }catch(error) {
            console.error(error);
            return {message: error.message, code: 0};
        }
    },
    


    /**
     * funcion que actualiza los datos de un recurso
     * 
     * @param {*} params 
     * @returns 
     */
    'update-product': async function(params) {

        try {

            return await ProductCost.sequelize.transaction(async (t) => {

                // valido que hayan llegado bien los datos
                if(empty(params.name)) throw new Error("El nombre del producto es obligatorio");
                if(empty(params.stock)) throw new Error("La existencia del producto es obligatoria");
                if(empty(params.taxId)) throw new Error("El impuesto del producto es Obligatorio");
                if(params.stock < 0) throw new Error("La existencia debe ser mayor a 0");

                // busco los datos del producto
                let product = await Product.findByPk(params.id);

                // verifico que exista
                if(product === null) 
                    throw new Error("Este producto no existe");
                

                // actualizo la informacion
                product.name = params.name;
                product.stock = params.stock;
                product.taxId = params.taxId;

                // en caso que se actualice un combo
                if( product.product_type_id === 2) {

                    for (let i = 0; i < params.items.length; i++) {
                        
                        let item = await ComboItem.findOne({
                            where:{
                                combo_id: product.id,
                                product_id: params.items[i].product_id
                            }
                        });

                        item.product_id = params.items[i].product_id;
                        item.quantity = params.items[i].quantity;

                        await item.save({transaction: t});
                    }
                }

                await product.save({transaction: t});

                let result = await updateCosts({
                    product_id: product.id,
                    cost: params.cost_combo,
                    currency_id: 1
                });

                if( result.code === 0 ) throw new Error(result.message);


                return { message: "Actualizado Correctamente", code: 1 };
            
            });
            
        } catch (error) {
            console.error(error);
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

            return await Product.sequelize.transaction(async (t) => {

                let product = await Product.findByPk(id);

                if (product === null) throw new Error("El producto no existe");
    
                if( product.product_type_id === 2) {
                    const combo_items = await ComboItem.destroy({
                        where: {
                            combo_id: product.id
                        },
                        transaction: t
                    });
                }
                
                // elimino el producto
                await product.destroy({transaction: t});

                return { message: "Eliminado correctamente", code: 1 };
            });


        } catch (error) {
            return { message: error.message, code: 0 };
        }
    }

};

module.exports = products;