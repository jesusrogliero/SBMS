const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'data/data.db',
  logging: false
});



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
			symbol: 'Bs.S',
			exchange_rate: 1
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



