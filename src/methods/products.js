'use strict'

const empty = require('../helpers/empty.js');
const Product = require('../models/Product.js');

let products = {

    /**
     * Ruta que muestra todos los empleados
     * 
     * @returns products
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

            if(params.stock < 0) throw new Error('La existencia debe ser mayor a 0');

            await Product.create({
                name: params.name,
                stock: params.stock,
                tax_id: params.tax_id,
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
            if(empty(params.tax_id)) throw new Error("El impuesto del producto es Obligatorio");
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
            product.tax_id = params.tax_id;

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