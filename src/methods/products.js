'use strict'

const empty = require('../helpers/empty.js');
const Product = require('../models/Product.js');

let products = {

    /**
     * Ruta que muestra todos los empleados
     * 
     * @returnsproducts
     */
     'index-products': async function() {

        return await Product.findAll({raw:true});

    },


    /**
     * Metodo que crea un nuevo producto
     * 
     * @param {Json} params 
     * @returns message
     */
    'create-product': async function(params) {

        try {

            await Product.create({
                department_id: params.department_id,
                brand: params.brand,
                model: params.model,
                stock: params.stock
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
            if(empty(params.department_id)) throw new Error("El departamento es Obligatorio");
            if(empty(params.brand)) throw new Error("La marca es Obligatoria");
            if(empty(params.model)) throw new Error("El modelo es Obligatorio");
            if(empty(params.stock)) throw new Error("La existencia es Obligatoria");

            // busco los datos del del empleado
            let product = await Product.findByPk(params.id);

            // verifico que exista
            if(product === null) {
                throw new Error("Este producto no existe");
            }

            // actualizo la informacion
            product.department_id = params.department_id;
            product.brand = params.brand;
            product.model = params.model;
            product.stock = params.stock;

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