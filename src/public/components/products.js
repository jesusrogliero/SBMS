'use strict'

import "../utils/autocomplete.js";

// componente clients
let products = Vue.component('products', {

	data: () => ({
		dialog: false,
		dialogDelete: false,
		page: 1,
		pageCount: 0,
		search: "",
		tab_combo: true,
		tab: null,
		hidden: false,
		key_component: 0,
		headers: [
			{
				text: 'ID',
				align: 'start',
				value: 'id',
			},
			{ text: 'Nombre', value: 'name' },
			{ text: 'Existencia', value: 'stock' },
			{ text: 'Impuesto', value: 'percentage' },
			{ text: 'Tipo de Producto', value: 'product_type' },
			{ text: 'Creado', value: 'createdAt' },
			{ text: 'Actualizado', value: 'updatedAt' },
			{ text: 'Acciones', value: 'actions', sortable: false },
		],
		products: [],
		editedIndex: -1,
		editedItem: {},
		suggested_price: 0,
		product_id: null,
		quantity: null
	}),

	computed: {
		formTitle() {
			return this.editedIndex === -1 ? 'Nuevo Producto' : 'Actualizar un Producto';
		},
	},

	watch: {
		dialog(val) {
			val || this.close()
		},
		dialogDelete(val) {
			val || this.closeDelete()
		}
	},

	created() {
		this.cleanForm();
		this.initialize();

	},

	methods: {
		initialize: async function () {
			this.products = await execute('index-products', {});
			this.pageCount = Math.round(Object.keys(this.products).length / 16);
		},


		cleanForm: function () {
			this.key_component++;
			this.editedItem = {
				id: '',
				name: '',
				stock: 0,
				taxId: null,
				cost_combo: 0,
				items: []
			};

			this.tab = null;
			this.product_id = null;
			this.quantity = null;
			this.suggested_price = 0;

		},


		// calcula un posible precio del combo
		suggestedPrice: function (val) {

			if (typeof this.suggested_price === 'string')
				this.suggested_price = parseFloat(this.suggested_price.split(' ').join('').split(',').join('').split('Bs.S').join(''));

			this.suggested_price = this.suggested_price + val;
			this.suggested_price = formatMoney(this.suggested_price);
		},

		getSelectTaxe: function (value) {
			this.editedItem.taxId = value;
		},

		getSelectProductType: function (value) {
			this.editedItem.product_type_id = value;

			if (value === 1) {
				this.tab_combo = true;
			}

			if (value === 2)
				this.tab_combo = false;
		},

		getSelectItemCombo: function (value) {
			this.product_id = value;
		},


		format: function (val) {
			return formatMoney(val);
		},

		// añade un producto al combo
		addItem: async function () {

			for (let i = 0; i < this.editedItem.items.length; i++) {

				if (this.product_id === this.editedItem.items[i].product_id) {
					alertApp({ color: "error", text: { message: 'Este Producto ya fue agregado al combo' }, icon: "alert" });
					return;
				}
			}

			let prd = await execute('get_product_info', { id: this.product_id, quantity: this.quantity });

			if (prd.code == 0) {
				alertApp({ color: "error", text: prd, icon: "alert" });
				return;
			}

			this.editedItem.items.push(prd.data);

			this.suggestedPrice(prd.data.price);
		},


		// elimina un producto del combo
		removeItem: async function (item) {

			for (let i = 0; i < this.editedItem.items.length; i++) {

				if (item.product_id === this.editedItem.items[i].product_id)
					this.editedItem.items.splice(i, 1);
			}

			if (typeof this.suggested_price === 'string')
				this.suggested_price = parseFloat(this.suggested_price.split(' ').join('').split(',').join('').split('Bs.S').join(''));

			this.suggested_price = this.suggested_price - item.price;
			this.suggested_price = formatMoney(this.suggested_price);
		},

		editItem: async function (item) {
			this.editedIndex = item.id
			this.editedItem = await execute('show-product', this.editedIndex);
			this.dialog = true;
			this.key_component++;
		},

		deleteItem: async function (item) {
			
			this.editedIndex = item.id;
			this.editedItem = await execute('show-product', this.editedIndex);

			if (this.editedItem.code == 0) {
				alertApp({ color: "error", text: this.editedItem, icon: "alert" });
				this.cleanForm();
			}

			this.dialogDelete = true
		},

		deleteItemConfirm: async function () {
			let result = await execute('destroy-product', this.editedIndex);


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
				this.initialize();
				this.cleanForm();
				this.editedIndex = -1;
			})
		},

		closeDelete() {
			this.dialogDelete = false;
			this.$nextTick(() => {
				this.initialize();
				this.cleanForm();
				this.editedIndex = -1;
			})
		},

		save: async function () {
			let result = null;

			if (this.editedIndex > -1)
				result = await execute('update-product', this.editedItem);
			else
				result = await execute('create-product', this.editedItem);


			if (result.code === 1) {
				alertApp({ color: "success", text: result, icon: "check" });
				this.close();
			} else {
				alertApp({ color: "error", text: result, icon: "alert" });
			}

		},
	},


	template: `
  <v-container>
  
  <v-data-table
	:headers="headers"
	:items="products"
	sort-by="calories"
	class="elevation-0"
	hide-default-footer
	@page-count="pageCount = $event"
	:page.sync="page"
	:items-per-page="16"
	:search="search"
  >
  <template v-slot:top>
	<v-toolbar flat >
	  <v-toolbar-title>Productos</v-toolbar-title>
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
	  
	  <v-dialog
		v-model="dialog"
	   max-width="700px"
	  >
		<template v-slot:activator="{ on, attrs }">
		  <v-btn
			color="primary"
			icon
			class="mb-2"
			v-bind="attrs"
			v-on="on"
		  >
			<v-icon
			>
			  mdi-plus
			</v-icon>
			</v-btn>

			<v-btn
			color="primary"
			icon
			class="mb-2"
			v-bind="attrs"
			@click="initialize"
		  >
			<v-icon
			>
			mdi-reload
			</v-icon>
		  </v-btn> 

		  <v-btn
			color="primary"
			icon
			class="mb-2"
			v-bind="attrs"
			@click="hidden =!hidden"
		  >
			<v-icon
			>
			mdi-magnify
			</v-icon>
		  </v-btn> 
		</template>
		
		<v-card>
		  <v-card-title>
			<span class="text-h5">{{ formTitle }}</span>
		  </v-card-title>

		  <v-card-text>

			<v-tabs v-model="tab">
			  <v-tab>Producto</v-tab>
			  <v-tab
  				:disabled="tab_combo"
			  >Combo</v-tab>
			</v-tabs>


			<v-tabs-items v-model="tab">
			  
			  <v-tab-item>
			  <v-container>
			  <v-row>
				
				<v-col cols="6">
					<v-text-field
					  v-model="editedItem.name"
					  label="Nombre"
					></v-text-field>
				</v-col>
				  
				  <v-col cols="6">
					<v-text-field
					  v-model="editedItem.stock"
					  label="Existencia"
					  hint="El stock de un combo es calculado automaticamente."
					></v-text-field>
				  </v-col>


				  <v-col cols = "6" class="mt-n4">
					  <autocomplete-form
						  uri = "index-taxes"
						  label = "Impuesto"
						  column = "name"
						  itemValue = "id"
						  :defaultValue = "editedItem.taxId"
						  :getSelect = "getSelectTaxe"
						  :key="key_component"
					  />
				  </v-col>


				  <v-col cols = "6" class="mt-n4">
				  <autocomplete-form
					  uri = "index-products_types"
					  label = "Tipo de Producto"
					  column = "type"
					  itemValue = "id"
					  :defaultValue = "editedItem.product_type_id"
					  :getSelect = "getSelectProductType"
					  :key="key_component"
				  />
				  </v-col>
			  </v-row>
			  </v-container>
			  </v-tab-item>
			
			  
			  <v-tab-item>
			  
			  <v-row>

			  <v-col class="ml-3 mt-4" cols="6" sm="5">
				<v-text-field
				v-model="editedItem.cost_combo"
				label="Costo del combo"
				prefix="Bs.S"
			  ></v-text-field>
			  </v-col>

			  <v-col class="mt-4" cols="6" sm="5">
				<v-text-field
				v-if="editedIndex === -1"
				disabled
				v-model="suggested_price"
				prefix="Bs.S"
				label="Costo Sugerido"
				></v-text-field>
			  </v-col>
			  
			  <v-col class="ml-3" cols="6" sm="5">
				<autocomplete-form
					uri = "index-products-standar"
					label = "Selecciona un producto"
					column = "name"
					itemValue = "id"
					:defaultValue = "product_id"
					:getSelect = "getSelectItemCombo"
					:key="key_component"
				/>
			  </v-col>

				<v-col cols="5" sm="5">
				  <v-text-field
					v-model="quantity"
					label="Cantidad"
				  ></v-text-field>
				</v-col>

				<v-col cols="1">
				<v-btn
				@click="addItem"
				class="mt-4"
				color="success"
				small
			  >
				+
			  </v-btn>
				</v-col>

			  </v-row>
			  </v-col>
			  

			  <v-col cols="12" >
				<v-simple-table
				fixed-header
				height="200px"
				>
				  <template v-slot:default>
					<thead>
					  <tr>
						<th class="text-left">Name</th>
						<th class="text-left">Cantidad</th>
									<th class="text-left">Acciones</th>
					  </tr>
					</thead>
					<tbody>
					<tr
					v-for=" item in editedItem.items"
					:key="item.name"
					>
					  <td>{{ item.name }}</td>
					  <td>{{ item.quantity }}</td>
						<td>
						<v-icon
						dense
						@click="removeItem(item)"
						color="error"
						>
						mdi-delete
						</v-icon>
					  </td>
					  </tr>
					  </tbody>
					</template>
				  </v-simple-table>
				</v-col>

			  </v-row>
			  </v-tab-item>

			</v-tabs-items>


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
		  <v-card-title class="text-h5">Estas seguro que deseas eliminar este producto?</v-card-title>
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

  <template v-slot:item.percentage="{ item }">
	{{(item.percentage * 100 ) + "%"}}
  </template>

</v-data-table>
<div class="text-center pt-2">
	  <v-pagination
		v-model="page"
		:length="pageCount"
	  ></v-pagination>
	</div>
  </v-container>

  `
});

export default products;