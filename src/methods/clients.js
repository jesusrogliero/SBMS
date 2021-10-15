'use strict'

const Client = require('../models/Client.js');
const empty = require('../helpers/empty.js');
const log = require('electron-log');

const clients = {

	/**
	 * Ruta que muestra todos los Clientes
	 * 
	 * @returns clients
	 */
	'index-clients': async function() {
		try {
			return await Client.findAll({raw:true});
		} catch (error) {
			log.error(error.message);
			return { message: error.message, code:0} ;
		}
	},



    /**
     * Metodo que crea un nuevo cliente
     * 
     * @param {Json} params 
     * @returns message
     */
	 'create-client': async function(params) {
        try {

			const client = await Client.findOne({ where: { cedula: params.cedula } });

			if(!empty(client))
				throw new Error("Este cliente ya esta registrado");

            // creo un nuevo cliente
            const new_client =  await Client.create({
                name: params.name,
                lastname: params.lastname,
                cedula: params.cedula
            });
			

            return {id: new_client.id, message: "Agregado con exito", code: 1};
        } catch (error) {

			if( !empty( error.errors ) ){
				log.error(error.errors[0].message);
				return {message: error.errors[0].message, code: 0};
			}	
			else{
				log.error(error.errors[0].message);
				return { message: error.message, code: 0 };
			}
				
        }
    },


	/**
	 * funcion que muestra un cliente
	 * 
	 * @param {int} id 
	 * @returns {json} client
	 */
	'show-client': async function(id) {
		try {
			let client = await Client.findByPk(id, {raw: true});

			if(client === null) throw new Error("Este cliente no existe");

			return client;

		} catch (error) {
			log.error(error.message);
			return {message: error.message, code: 0};
		}
	},


	/**
	 * funcion que actualiza un cliente
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	'update-client': async function(params) {

		try {

			if( empty(params.name) ) throw new Error("El nombre del cliente es obligatorio");
			if( empty(params.lastname) ) throw new Error("El apellido del cliente es obligatorio");
			if( empty(params.cedula) ) throw new Error("La cedula del cliente es obligatorio");

			let client = await Client.findByPk(params.id);
			
			if( client === null) throw new Error("El cliente no existe");

			client.name = params.name;
			client.lastname = params.lastname;
			client.cedula = params.cedula;

			await client.save();

			return {message: "Actualizado Correctamente", code: 1};
			
		} catch (error) {
			log.error(error.message);
			return { message: error.message, code: 0 };
		}
	},



	/**
	 * funcion que elimina un cliente
	 * 
	 * @param {*} params 
	 * @returns message
	 */
	'destroy-client': async function(id) {
		try {
			let client = await Client.findByPk(id);

			if(client === null) throw new Error("Este cliente no existe");

			client.destroy();

			return {message: "Eliminado Correctamente", code: 1};

		} catch (error) {
			log.error(error.message);
			return {message: error.message, code: 0};
		}
	}
};

module.exports = clients;
