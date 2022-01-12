const { Sequelize } = require('sequelize');
const appdata = require('appdata-path');
const path = require('path');


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join( appdata('sbms'), 'sbms.data'),
  logging: false
});



//const sequelize = new Sequelize('sqlite::memory:', {logging:false});



const seeds =  async function(Model, data) {
	try {
		for (let i = 0; i < data.length; i++) {
			await Model.findOrCreate({
				where: data[i]
			});
		}
		
	} catch (error) {
		console.log(error);
	}
	
  };



(async () => {
	await sequelize.sync();


	await seeds(require('./models/Currency.js'), [
		{
			name: 'Bolivares',
			symbol: 'Bs',
			exchange_rate: 1
		},
		{
			name: 'Dolar',
			symbol: '$',
		},

	]).then(e => console.log);


  	await seeds(require('./models/PurchaseOrderState.js'), [
		{state: 'Pendiente'},
		{state: 'Generada'},
		{state: 'Aprobada'},
	]).then(e => console.log);


	await seeds(require('./models/ProductType.js'), [
		{type: 'Unico'},
		{type: 'Combo'}
	]).then(e => console.log);

	await seeds(require('./models/Tax.js'), [
		{
			name: "Exento",
			percentage: 0
		},
	]).then(e => console.log);

	await seeds(require('./models/InvoiceState.js'), [
		{state: 'Pendiente'},
		{state: 'Generada'},
		{state: 'Aprobada'},
	]).then(e => console.log);

})();





module.exports = sequelize;



