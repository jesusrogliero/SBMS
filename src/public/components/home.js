'use strict'

import '../utils/autocomplete.js';

// componente home
let home = Vue.component('home', {

	data: function() {
			return {
				exchange_rate: 0,
				sales_today: null,
				sales_week: null,
				currency_default: null
			}
	},

	created: async function() {
		let currency = await execute('show-currency', 2);
		this.currency_default = await execute('show-currency', 1);
		this.exchange_rate = currency.exchange_rate;
	},

	watch: {
		exchange_rate: function(val) {
			
			if( typeof val === 'string')
				this.exchange_rate = parseFloat(val.split(' ').join('').split(',').join('').split('Bs.S').join(''));
	 
			this.exchange_rate = formatMoney(this.exchange_rate);
		}
	},
	

	methods: {

		adjust_exchange: async function() {
			let exchange_rate = parseFloat(this.exchange_rate.split(' ').join('').split(',').join('').split('Bs.S').join(''));

			try {
				let result = await execute('update-exchange_rate', {id: 2, exchange_rate: exchange_rate} );

				if(result.code == 0) throw new Error(result.message);
							
				result = await execute('adjust-costs', 2);

				if(result.code === 1) {
					alertApp({color:"success", text: result, icon: "check" }); 
				}else{
					throw new Error(result.message);
				}
				
			} catch (error) {
				alertApp({color:"error", text: error.message, icon: "alert" }); 
			} 


		},

		get_product_costs: async function() {

		},

		get_sales_today: async function() {

		},


		get_sales_week: async function() {

		}
	},


	template: `
		<v-container class="mt-10">
			<v-row>

				<v-col>
				<v-card color="pink lighten-4">
					<v-card-title>Vendido Hoy</v-card-title>
					<v-card-text class="text-h4">$50,000</v-card-text>
				</v-card>
				</v-col>

				<v-col>
				<v-card color="indigo lighten-4">
					<v-card-title>Ventas esta semana</v-card-title>
					<v-card-text class="text-h4">$4,323.52</v-card-text>
				</v-card>
				</v-col>


				<v-col>
				<v-card color="teal lighten-4">
					<v-card-title>Tasa del dia en {{currency_default.symbol}}</v-card-title>
					<v-text-field
						class="ml-4 mr-4 mt-n2 text-h4"
						v-model="exchange_rate"
						v-on:keyup.enter="adjust_exchange"
					> </v-text-field>
					
				</v-card>
				</v-col>
			</v-row>


			<v-row>

			<v-col>
			<v-card color="indigo lighten-4" class="pb-2" elevation="5">
				<p class="title text-center"> Nueva venta</p>
				<v-img
				class="mx-auto"
				height="100"
				max-width="100"
				src="../public/resources/images/venta.png"
			></v-img>
			
			</v-card>
			</v-col>

			<v-col>
			<v-card color="indigo lighten-4" class="pb-2" elevation="5">
			<p class="title text-center"> Ingresar Mercancia</p>
				<v-img
				class="mx-auto"
				height="100"
				max-width="100"
				src="../public/resources/images/ingreso.png"
			></v-img>
			</v-card>
			</v-col>

			<v-col>
			<v-card color="indigo lighten-4" class="pb-2" elevation="5">
			<p class="title text-center">Clientes</p>
				<v-img
					class="mx-auto"
					height="100"
					max-width="100"
					src="../public/resources/images/clientes.png"
				></v-img>
			</v-card>
			</v-col>

			</v-row>
		</v-container>

		`
});

export default home;
