'use strict'

const empty = require('../helpers/empty.js');
const Product = require('../models/Product.js');
const Tax = require('../models/Tax.js');
const sequelize = require('sequelize');

let products = {

    /**
     * Ruta que muestra todos los empleados
     * 
     * @returns productsa
     */
     'index-products': async function() {

        //return await Product.findAll({raw:true});

        return await Product.findAll({
            attributes: {
                include: [
                    [sequelize.col('tax.percentage'), 'percentage']
                ],
            },
            include: {
                model: Tax,
                required: true
            },
            raw:true
        });

    },


    /**
     * Metodo que crea un nuevo producto
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-product': async function(params) {

        try {

            if(params.stock < 0) throw new Error('La existencia debe ser mayor a 0');

            await Product.create({
                name: params.name,
                stock: params.stock,
                taxId: params.taxId,
            });
    
            return {message: "Agregado con exito", code: 1};
        
        } catch (error) {
            return {message: error.message, code: 0};
        }

    },
    

    /**
     * funcion que muestra un producto
     * 
     * @param {int} id 
     * @returns {json} product
     */
    'show-product': async function(id) {
        try {
            const product = await Product.findByPk(id, {raw: true});

            if(product === null) throw new Error("Este producto no existe");

            return product;

        }catch(error) {
            return {message: error.message, code: 0};
        }
    },
    


    /**
     * funcion que actualiza los datos de un producto
     * 
     * @param {*} params 
     * @returns 
     */
    'update-product': async function(params) {

        try {
            
            // valido que hayan llegado bien los datos
            if(empty(params.name)) throw new Error("El nombre del producto es obligatorio");
            if(empty(params.stock)) throw new Error("La existencia del producto es obligatoria");
            if(empty(params.taxId)) throw new Error("El impuesto del producto es Obligatorio");
            if(params.stock < 0) throw new Error("La existencia debe ser mayor a 0");

            // busco los datos del del empleado
            let product = await Product.findByPk(params.id);

            // verifico que exista
            if(product === null) {
                throw new Error("Este producto no existe");
            }

            // actualizo la informacion
            product.name = params.name;
            product.stock = params.stock;
            product.taxId = params.taxId;

            product.save();

            return { message: "Actualizado Correctamente", code: 1 };

        } catch (error) {
            return { message: error.message, code: 0 };
        }


    },
    

    /**
     * funcion que elimina a un empleado
     * 
     * @param {*} params 
     * @returns 
     */
    'destroy-product': async function destroy(id) {
        try {
            let product = await product.findByPk(id);

            if (product === null) throw new Error("El producto no existe");
            
            // elimino el producto
            product.destroy();

            return { message: error.message, code: 1 };

        } catch (error) {
            return { message: error.message, code: 0 };
        }
    }

};

module.exports = products;