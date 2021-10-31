'use strict'

import '../utils/autocomplete.js';
import './widget_invoice.js';

// componente home
let home = Vue.component('home', {

	data: function() {
		return {
			exchange_rate: 0,
			sales_today: null,
			sales_week: null,
			currency_default: "",
			products_prices: [],
			product_id: null,
			currency_id: 1,
			widget_invoice_dialog: false,
			sold_today: {},
			sold_week: {}

		}
	},

	created: async function() {
		let currency = await execute('show-currency', 2);
		this.currency_default = await execute('show-currency', 1);

		this.exchange_rate = formatMoney( currency.exchange_rate);
		this.sold_today = await execute('get-sold-today');
		this.sold_week = await execute('get-sold-week');
	},

	computed: {
		formTitle() {
			return this.editedIndex === -1 ? 'Añadir un Producto' : 'Actualizar un Producto';
		},
	},

	watch: {
		product_id: function() {
			this.getProductPrice();
		},
		currency_id: function() {
			this.getProductPrice();
		}
	},

	methods: {

		format: function(val) {
			if( typeof val === 'string')
				this.exchange_rate = parseFloat(val.split(' ').join('').split(',').join('').split('Bs.S').join(''));
		},

		format_money: function(price, symbol) {
			return `${formatMoney(price)} ${symbol}`;
		},

		updateSales: async function() {
			this.sold_today = await execute('get-sold-today');
			this.sold_week = await execute('get-sold-week');
		},

		adjust_exchange: async function() {
			try {
				let result = await execute('update-exchange_rate', {id: 2, exchange_rate: this.exchange_rate} );

				if(result.code == 0) throw new Error(result.message);
							
				result = await execute('adjust-costs', 2);

				if(result.code === 1) {
					alertApp({color:"success", text: result, icon: "check" }); 
					this.exchange_rate = formatMoney(this.exchange_rate);
				}else{
					throw new Error(result.message);
				}
				
			} catch (error) {
				alertApp({color:"error", text: error, icon: "alert" }); 
			} 


		},

		getSelectProduct: function(product_id) {
			this.product_id = product_id;
		},

		getSelectCurrency: function(currency_id) {
			this.currency_id = currency_id;
		},

		getProductPrice: async function() {

			try {
				let result = await execute('get_product_prices', {
					id: this.product_id,
					currency_id: this.currency_id
				});
				
				if(result.code === 0) 
					throw new Error(result.message);

				this.products_prices = result;

			} catch (error) {
				alertApp({color:"error", text: error, icon: "alert" }); 
			} 

		},

		openWidgetInvoiceDialog: function(){
			this.widget_invoice_dialog = true;
		},

		closeWidgetInvoiceDialog: function() {
			this.widget_invoice_dialog = false;
			this.updateSales();
		},

		toClients: function() { this.$router.push('/clients'); },

		toPurchases: function() { this.$router.push('/purchases_orders')},
	},


	template: `
		<v-container class="mt-10">

			<v-row>

				<v-col>
				<v-card color="pink lighten-4">
					<v-card-title class="text-h5">Vendido Hoy <v-btn class="ml-2" icon @click="updateSales"> <v-icon>mdi-refresh</v-icon> </v-btn></v-card-title>

					<v-card-text class="text-h4">{{sold_today.sold + ' ' + sold_today.symbol}}</v-card-text>
				</v-card>
				</v-col>

				<v-col>
				<v-card color="indigo lighten-4">
					<v-card-title class="text-h5">Ventas ultimos 7 dias</v-card-title>
					<v-card-text class="text-h4">{{sold_week.sold + ' ' + sold_week.symbol}}</v-card-text>
				</v-card>
				</v-col>


				<v-col>
				<v-card color="teal lighten-4">
					<v-card-title class="text-h5">Tasa del Dolar</v-card-title>
					<v-text-field
						class="ml-4 mr-4 mt-n2 text-h5"
						v-model="exchange_rate"
						:prefix="currency_default.symbol"
						v-on:keyup.enter="adjust_exchange"
						@click="format(exchange_rate)"
					> </v-text-field>
					
				</v-card>
				</v-col>
			</v-row>


			<v-row>


			<v-col>


			<widget_invoice
				:active="widget_invoice_dialog"
				:hidde="closeWidgetInvoiceDialog"
			></widget_invoice>


			<v-card color="indigo lighten-4" class="pb-2" elevation="5" @click="openWidgetInvoiceDialog">
				<p class="text-h5 text-center"> Nueva venta</p>
				<v-img
				class="mx-auto"
				height="100"
				max-width="100"
				src="../public/resources/images/venta.png"
			></v-img>
			</v-card>

			</v-col>

			<v-col>
			<v-card color="indigo lighten-4" class="pb-2" elevation="5" @click="toPurchases">
			<p class="text-h5 text-center"> Ingresar Mercancia</p>
				<v-img
				class="mx-auto"
				height="100"
				max-width="100"
				src="../public/resources/images/ingreso.png"
			></v-img>
			</v-card>
			</v-col>

			<v-col>
			<v-card color="indigo lighten-4" class="pb-2" elevation="5" @click="toClients">
			<p class="text-h5 text-center">Clientes</p>
				<v-img
					class="mx-auto"
					height="100"
					max-width="100"
					src="../public/resources/images/clientes.png"
				></v-img>
			</v-card>
			</v-col>

			</v-row>


			<v-row>
				<v-col>
					<v-card 
					class="mx-left"
					
					elevation="3"
					color="indigo lighten-5"
					>
						<v-card-text>
						<p class="text-h4 text--primary">
							Consultar Precio de Venta
						</p>
				
							<v-container>
								<v-row>
									<v-col cols = "5">
										<autocomplete-form
											uri = "index-products"
											label = "Selecciona el Producto"
											column = "name"
											itemValue = "id"
											:defaultValue = "product_id"
											:getSelect = "getSelectProduct"
										/>
									</v-col>

									<v-col cols = "5">
									<autocomplete-form
										uri = "index-currencies"
										label = "Selecciona la moneda (opcional)"
										column = "name"
										itemValue = "id"
										:defaultValue = "currency_id"
										:getSelect = "getSelectCurrency"
									/>
								</v-col>

								<v-col cols = "2">
									<v-btn
										class="ml-2 mt-2"
										small
										fab
										color="primary"
										@click="getProductPrice"
									>
										<v-icon dark>
										mdi-magnify
										</v-icon>
									</v-btn>
								</v-col>
								</v-row>
							</v-container>

							<v-container class="ml-5" >
								<v-row>
									
								<v-card
									tile
									width="1000"
									elevation="0"
									color="indigo lighten-5"
							  	>

								  <v-row>
								  <v-col
								  	cols="6" sm="4"
									v-for="(item, i) in products_prices"
									:key="i"
								  >
									<p class="title">Precio: {{item.price_name}}</p>
									<p class="text-h5">{{ format_money(item.price, item.currency_symbol) }}</p>
								  
								  </v-col>
							  </v-row>

								
							
							  </v-card>
									
								</v-row>
						</v-container>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-container>

		`
});

export default home;
