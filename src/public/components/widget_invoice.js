'use strict'

// componente home
let widget_invoice = Vue.component('widget_invoice', {

    props: ['hidde', 'active'],

	data: function() {
		return {

			key_invoice: 0,
            key_item: 0,
			disable_txt_field: true,
			editedItem_invoice: {},
			client: {},
			invoice: {},
			currencies: {},
			e1: 1,

			dialog: false,
			dialogDelete: false,
			search: "",
			hidden: false,
			headers: [
				{
					text: 'ID',
					align: 'start',
					sortable: false,
					value: 'id',
				},
				{ text: 'Producto', value: 'product_name' },
				{ text: 'Cantidad', value: 'quantity' },
				{ text: 'Precio p/u', value: 'price' },
				{ text: 'Impuesto', value: 'tax_amount' },
				{ text: 'Subtotal', value: 'subtotal' },
				{ text: 'Total', value: 'total' },
				{ text: 'Acciones', value: 'actions', sortable: false },
			],
			invoice_items: [],
			editedIndex: -1,
			editedItem_items: {},
		}
	},

	created: async function() {
        this.cleanForm();
        this.cleanFormItem();
	},

	computed: {
		formTitle() {
			return this.editedIndex === -1 ? 'Añadir un Producto' : 'Actualizar un Producto';
		},
	},

	watch: {
		dialog(val) {
			val || this.close()
		},
		dialogDelete(val) {
			val || this.closeDelete()
		},
	},

	methods: {

		stepp: async function(e) {
			switch (e) {
				
				case 1:
					this.key_invoice++;
					this.e1 = e;
					break;
				
				case 2:
					this.currencies = await execute('index-currencies');

					if(this.editedItem_invoice.client_id == undefined || this.editedItem_invoice.client_id == null) 
						this.editedItem_invoice.client_id = 1;
					
					this.invoice = await execute('show-invoice-client', this.editedItem_invoice.client_id );

					if(this.invoice === null || this.invoice === undefined)
						this.createInvoice();

					this.get_invoice_items();
					this.e1 = e;
					break;

				case 3:
					this.e1 = e;
					break;
			
				default:
					alertApp({color:"error", text: {message: 'Debes Crear una Factura antes de continuar'}, icon: "alert" });
					break;
			}
		},

		getSelectClient: function(id) {
			this.editedItem_invoice.client_id = id;
		},

		getSelectCurrency: async function(currency_id) {
			this.editedItem_invoice.currency_id = currency_id;
		},

		getSelectProduct: function(product_id) {
			this.editedItem_items.product_id = product_id;
		},

		getSelectPrice: function(price_id) {
			this.editedItem_items.price_id = price_id;
		},


		createInvoice: async function() {
			let result = await execute('create-invoice', this.editedItem_invoice );

			if(result.code === 1) {
				alertApp({color:"success", text: result, icon: "check" });
				this.invoice = result.invoice;
                this.editedItem_items.invoice_id = this.invoice.id;
				this.disable_txt_field = false;

				let currency = await execute('show-currency', this.invoice.currency_id );
				this.invoice.currency_symbol = currency.symbol;
			}else{
				alertApp({color:"error", text: result, icon: "alert" }); 
			}
				
		},


		updateInvoice: async function(currency_id) {

			const result = await execute('update-invoice', {
			  id: this.invoice.id,
			  currency_id: currency_id
			});
	  
	  
			if (result.code === 1) {
				alertApp({ color: "success", text: result, icon: "check" });

				this.invoice = await execute('show-invoice', this.invoice.id );
				this.get_invoice_items();

			} else {
				alertApp({ color: "error", text: result, icon: "alert" });
			}
			
		},


		approveInvoice: async function() {
			let result = await execute('generate-invoice', this.invoice.id);

			if (result.code == 0) {
				alertApp({ color: "error", text: result, icon: "alert" });
				return;
			}

			result = await execute('approve-invoice', this.invoice.id);

			if(result.code === 1) {
				alertApp({color:"success", text: result, icon: "check" });
				this.closeDialog();
			}else{
				alertApp({color:"error", text: result, icon: "alert" }); 
			}

		},


		createClient: async function() {
			let result = await execute('create-client', this.client );

			if(result.code === 1) {
				alertApp({color:"success", text: result, icon: "check" });
				this.editedItem_invoice.client_id = result.id;
				this.stepp(2);
			}else{
				alertApp({color:"error", text: result, icon: "alert" }); 
			}
				
		},

        cleanForm: function () {
			this.key_invoice++;
			this.editedItem_invoice = {
				invoice_id: null,
                client_id: null,
			};

			this.invoice = {
				total_product: 0,
				subtotal: 0,
				tax_amount: 0,
				total: 0
			};
		},


		cleanFormItem: function () {
			this.key_item++;
			this.invoice_items = [];
			this.editedItem_items = {
				id: '',
				invoice_id: null,
				product_id: '',
				price: null,
				price_id: ' ',
				quantity: '',
			};

		},

        format: function(value){
            return `${formatMoney(value)} ${this.invoice.currency_symbol}`; 
        },


		get_invoice_items: async function () {
			this.invoice_items = await execute('index-invoices-items', this.invoice.id);
		},

		
		editItem: async function (item) {
			
			this.editedIndex = item.id;
			this.editedItem_items = await execute('show-invoice_item', this.editedIndex);

			if (this.editedItem_items.code == 0) {
				alertApp({ color: "error", text: this.editedItem_items, icon: "alert" });
				return;
			}

			this.dialog = true;
			this.key_item++;
		},

		deleteItem: async function (item) {
			this.editedIndex = item.id;
			this.editedItem_items = await execute('show-invoice_item', this.editedIndex);

			if (this.editedItem_items.code == 0) {
				alertApp({ color: "error", text: this.editedItem_items, icon: "alert" });
				this.cleanFormItem();
			}

			this.dialogDelete = true
		},

		deleteItemConfirm: async function () {
			let result = await execute('destroy-invoice_item', this.editedIndex);


			if (result.code == 1) {
				alertApp({ color: "success", text: result, icon: "check" });
			} else {
				alertApp({ color: "error", text: result, icon: "alert" });
			}

			this.closeDelete();
		},


		close() {
			this.dialog = false;
			this.$nextTick(() => {
				this.get_invoice_items();
				this.cleanFormItem();
				this.editedIndex = -1;
			});
		},

		closeDelete() {
			this.dialogDelete = false;
			this.$nextTick(() => {
				this.get_invoice_items();
				this.cleanFormItem();
				this.editedIndex = -1;
			})
		},

		closeDialog: function() {
			this.cleanFormItem();
			this.cleanForm();
			this.hidde();
			this.e1 = 1;
		},

		save: async function () {
			let result = null;
			this.editedItem_items.invoice_id = this.invoice.id;

			if (this.editedIndex > -1) {
				result = await execute('update-invoice_item', this.editedItem_items);
			} else {
				result = await execute('create-invoice-item', this.editedItem_items);
			}

			if (result.code === 1) {
				alertApp({ color: "success", text: result, icon: "check" });

				this.invoice = await execute('show-invoice', this.invoice.id );
				
				this.invoice.subtotal = formatMoney(this.invoice.subtotal);
				this.invoice.tax_amount = formatMoney(this.invoice.tax_amount);
				this.invoice.total = formatMoney(this.invoice.total);

				this.close();
			} else {
				alertApp({ color: "error", text: result, icon: "alert" });
			}

		},

	},


	template: `
		<v-dialog
			transition="dialog-bottom-transition"
			max-width="900px"
            v-model="active"
            persistent
		>
			<v-card>

				<v-toolbar
				  color="primary"
				  dark
				>
                <span class="title text-h4">Nueva Venta</span>
                <v-spacer></v-spacer>

                <v-btn
                    color="error"
                    icon
                    @click="closeDialog"
                >
                    <v-icon class="mr-2">mdi-close</v-icon>
                </v-btn>
                </v-toolbar>

				<v-card-text>
				    <v-stepper v-model="e1" class="mt-3">
						<v-stepper-header>
						<v-stepper-step
							:complete="e1 > 1"
							step="1"
						>
							Cliente
						</v-stepper-step>

						<v-divider></v-divider>

						<v-stepper-step
							:complete="e1 > 2"
							step="2"
						>
							Detalles de la Orden
						</v-stepper-step>

						<v-divider></v-divider>

						<v-stepper-step step="3">
							Finalizar
						</v-stepper-step>
						</v-stepper-header>


						<v-stepper-items>
						<v-stepper-content step="1">
							<v-card
							class="mb-12"
							elevation="0"
							>
							<v-container>
							<v-row>
			
								<v-col cols = "7" >
									<autocomplete-form
										uri = "index-clients"
										label = "Cedula del Cliente (opcional)"
										column = "cedula"
										itemValue = "id"
										:defaultValue = "editedItem_invoice.client_id"
										:getSelect = "getSelectClient"
										:key="key_invoice"
									/>
								</v-col>


								<v-expansion-panels>
								<v-expansion-panel>
								  <v-expansion-panel-header>
									Registrar un Nuevo Cliente
								  </v-expansion-panel-header>
								  <v-expansion-panel-content>
										<v-row>
										
										<v-col cols="6" >
											<v-text-field
												v-model="client.name"
												label="Nombre"
											></v-text-field>
										</v-col>
				
										<v-col cols="6">
											<v-text-field
												v-model="client.lastname"
												label="Apellido"
											></v-text-field>
										</v-col>
	
	
										<v-col cols="6">
											<v-text-field
												v-model="client.cedula"
												label="Cedula"
												type="number"
											></v-text-field>
										</v-col>

										<v-col cols="6">
											<v-btn class="mt-4"  color="primary"  @click="createClient">
											Registrar Cliente
											<v-icon class="ml-2">mdi-account-plus</v-icon>
											</v-btn>
										</v-col>

										</v-row>
								  </v-expansion-panel-content>
								</v-expansion-panel>
							  </v-expansion-panels>


							</v-row>
							</v-container>
							</v-card>

							<v-row>

								<v-col>
									<v-btn
									color="primary"
									@click="stepp(2)"
									>
									Continuar
									<v-icon class="mr-2">mdi-chevron-right</v-icon>
									</v-btn>

								</v-col>
							</v-row>
						</v-stepper-content>
						</v-stepper-items>


						<v-stepper-content step="2">
							
							<v-card class="mb-12" >
								<v-container>

									<v-row>
										<v-col>

											<v-menu offset-y>
												<template v-slot:activator="{ on, attrs }">
													<v-btn
													color="primary"
													dark
													v-bind="attrs"
													v-on="on"
													>
														Cambiar Moneda
														<v-icon>mdi-currency-usd</v-icon>
													</v-btn>
												</template>
												<v-list>
													<v-list-item
													v-for="(currency, index) in currencies"
													:key="index"
													@click="updateInvoice(currency.id)"
													>
													<v-list-item-title>{{ currency.name }}</v-list-item-title>
													</v-list-item>
												</v-list>
											</v-menu>

										</v-col>
									</v-row>

									<v-row>


										<v-col cols="2" >
											<v-text-field
												v-model="invoice.total_products"
												label="Total de Producto"
												readonly
											></v-text-field>
										</v-col>
			
										<v-col cols="3" >
											<v-text-field
												v-model="invoice.subtotal"
												label="Subtotal"
												:prefix="invoice.currency_symbol"
												readonly
											></v-text-field>
										</v-col>

										<v-col cols="3" >
											<v-text-field
												v-model="invoice.tax_amount"
												label="Impuesto"
												:prefix="invoice.currency_symbol"
												readonly
											></v-text-field>
										</v-col>

										<v-col cols="4" >
											<v-text-field
												v-model="invoice.total"
												label="Total"
												:prefix="invoice.currency_symbol"
												readonly
											></v-text-field>
										</v-col>
		
									</v-row>
								</v-container>

								<v-data-table
									:headers="headers"
									:items="invoice_items"
									sort-by="calories"
									class="elevation-0"
									hide-default-footer
									:search="search"
								>
									<template v-slot:top>
										<v-toolbar flat >
											<v-toolbar-title>Productos en la Orden</v-toolbar-title>
											
											<v-divider
												class="mx-4"
												inset
												vertical
											></v-divider>
							
											<v-scroll-x-reverse-transition>

												<v-text-field
													v-show="hidden"
													v-model="search"
													append-icon="mdi-magnify"
													label="Buscar"
													single-line
													hide-details
												></v-text-field>

											</v-scroll-x-reverse-transition>
								
											<v-spacer></v-spacer>
										
											<v-dialog  v-model="dialog"  max-width="500px" >
												<template v-slot:activator="{ on, attrs }">
													
													<v-btn
														color="primary"
														icon
														class="mb-2"
														v-bind="attrs"
														v-on="on"
													>
														<v-icon> mdi-plus </v-icon>
													</v-btn> 
								
								
													<v-btn
													color="primary"
													icon
													class="mb-2"
													v-bind="attrs"
													@click="get_invoice_items"
													>
														<v-icon> mdi-reload </v-icon>
													</v-btn> 
								

													<v-btn
														color="primary"
														icon
														class="mb-2"
														v-bind="attrs"
														@click="hidden =!hidden"
													>
														<v-icon> mdi-magnify </v-icon>
													</v-btn> 
												</template>
											
												<v-card>
													<v-card-title>
														<span class="text-h5">{{ formTitle }}</span>
													</v-card-title>
								
													<v-card-text>
														<v-container>
														<v-row>
										
															<v-col cols = "6">
																<autocomplete-form
																	uri = "index-products"
																	label = "Selecciona el Producto"
																	column = "name"
																	itemValue = "id"
																	:defaultValue = "editedItem_items.product_id"
																	:getSelect = "getSelectProduct"
																	:key="key_item"
																/>
															</v-col>
										
															<v-col cols="6" >
																<v-text-field
																	v-model="editedItem_items.quantity"
																	label="Cantidad"
																></v-text-field>
															</v-col>
										
															<v-col cols="6" v-if="editedItem_items.price != null" >
																<v-text-field
																	v-model="editedItem_items.price"
																	label="Precio"
																	:prefix="invoice.currency_symbol"
																	disabled
																></v-text-field>
															</v-col>
										
															<v-col cols = "6" v-if="editedItem_items.price_id != null">
															<autocomplete-form
																uri = "index-prices"
																label = "Selecciona el Precio"
																column = "name"
																itemValue = "id"
																:defaultValue = "editedItem_items.price_id"
																:getSelect = "getSelectPrice"
																:key="key_item"
															/>
															</v-col>
										
										
										
															</v-row>
														</v-container>
													</v-card-text>
								
													<v-card-actions>
														<v-spacer></v-spacer>

														<v-btn
															color="error"
															text
															@click="close"
														>
															Cancelar
														</v-btn>

														<v-btn
															color="success"
															text
															@click="save"
														>
															Guardar
														</v-btn>

													</v-card-actions>
												</v-card>
											</v-dialog>
											
											<v-dialog v-model="dialogDelete" max-width="600px">
												
												<v-card>
													<v-card-title class="text-h5">Estas seguro que deseas eliminar este producto de la orden?</v-card-title>
													<v-card-actions>
														<v-spacer></v-spacer>
														<v-btn color="error" text @click="closeDelete">Cancelar</v-btn>
														<v-btn color="success" text @click="deleteItemConfirm">Confirmar</v-btn>
														<v-spacer></v-spacer>
													</v-card-actions>
												</v-card>
											</v-dialog>
										</v-toolbar>
									</template>
								
									<template v-slot:item.actions="{ item }">
										
										<v-icon
											dense
											class="mr-2"
											@click="editItem(item)"
											color="primary"
										>
											mdi-pencil
										</v-icon>

										<v-icon
											dense
											@click="deleteItem(item)"
											color="error"
										>
											mdi-delete
										</v-icon>

									</template>
							
									<template v-slot:item.price="{ item }">
										{{ format(item.price) }}
									</template>
								
									<template v-slot:item.tax_amount="{ item }">
										{{ format(item.tax_amount) }}
									</template>
								
									<template v-slot:item.subtotal="{ item }">
										{{ format(item.subtotal) }}
									</template>
								
									<template v-slot:item.total="{ item }">
										{{ format(item.total) }}
									</template>
							
							
								</v-data-table>
							</v-card>

							
							<v-btn color="error" @click="stepp(1)">
							Atras
							</v-btn>

							<v-btn
								color="primary"
								@click="approveInvoice"
							>
								Finalizar
							</v-btn>

						</v-stepper-content>
					</v-stepper>
				</v-card-text>
			</v-card>
	</v-dialog>
`
});

export default widget_invoice;