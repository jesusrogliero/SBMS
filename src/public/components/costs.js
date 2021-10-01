'use strict'

import('../utils/autocomplete.js');

// componente home
let costs = Vue.component('costs', {

  data: () => ({
    dialog: false,
    dialogDelete: false,
    page: 1,
    pageCount: 1,
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
      { text: 'Costo', value: 'cost' },
      { text: 'Creado', value: 'createdAt' },
      { text: 'Actualizado', value: 'updatedAt' },
      { text: 'Acciones', value: 'actions', sortable: false },
    ],
    costs: [],
    editedIndex: -1,
    editedItem: {},
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nuevo Costo' : 'Actualizar un Costo';
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },

  created () {
    this.initialize();
    this.cleanForm();

  },

  methods: {
    initialize: async function () {
      this.costs = await execute('index-costs',{});
      this.pageCount =  Math.round ( Object.keys(this.costs).length / 16);
    },

    cleanForm: function() {
      this.editedItem = {
        id: '',
        product_id: null,
        currency_id: null,
        cost: 0
      }
    },

    getSelectProduct: function(value) {
      this.editedItem.product_id = value;
    },

    getSelectCurrency: function(value) {
      this.editedItem.currency_id = value;
    },

    format: function(val) {
      return formatMoney(val);
    },
    
    editItem: async function(item) {
      this.editedIndex = item.id
      this.editedItem = await execute('show-cost', this.editedIndex);
      this.dialog = true
    },

    deleteItem: async function(item) {
      this.editedIndex = item.id;
      this.editedItem = await execute('show-cost', this.editedIndex);

      if(this.editedItem.code == 0){
        alertApp({color:"error", text: this.editedItem, icon: "alert" });
        this.cleanForm();
      }
        
      this.dialogDelete = true
    },

    deleteItemConfirm: async function() {
      let result = await execute('destroy-cost', this.editedIndex);


      if(result.code == 1) {
        alertApp({color:"success", text: result, icon: "check" }); 
      }else{
        alertApp({color:"error", text: result, icon: "alert" }); 
      }

      this.closeDelete();
    },

    close () {
      this.dialog = false;
      this.$nextTick(() => {
        this.initialize();
        this.cleanForm();
        this.editedIndex = -1;
      })
    },

    closeDelete () {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.initialize();
        this.cleanForm();
        this.editedIndex = -1;
      })
    },

    save: async function() {
      let result = null;
      
      if (this.editedIndex > -1) {
        result = await execute('update-cost', this.editedItem);
      } else {
        result = await execute('create-cost', this.editedItem);
      }

      if(result.code === 1) {
        alertApp({color:"success", text: result, icon: "check" }); 
        this.close();
      }else{
        alertApp({color:"error", text: result, icon: "alert" }); 
      }
       
    },
  },


	template: `
  <v-container>
  
  <v-data-table
    :headers="headers"
    :items="costs"
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
      <v-toolbar-title>Costos de Productos</v-toolbar-title>
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
        max-width="500px"
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
            <v-container>
              <v-row>
              
              
                <v-col cols = "12">
                  <autocomplete-form
                      uri = "index-products"
                      label = "Selecciona un Producto"
                      column = "name"
                      itemValue = "id"
                      :defaultValue = "editedItem.product_id"
                      :getSelect = "getSelectProduct"
                  />
               </v-col>  
               
               
               <v-col cols = "12">
                <autocomplete-form
                    uri = "index-currencies"
                    label = "Selecciona una Moneda"
                    column = "name"
                    itemValue = "id"
                    :defaultValue = "editedItem.currency_id"
                    :getSelect = "getSelectCurrency"
                />
                </v-col>  


                <v-col cols="12" >
                  <v-text-field
                    v-model="editedItem.cost"
                    label="Ingresa el Costo"
                  ></v-text-field>
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
          <v-card-title class="text-h5">Estas seguro que deseas eliminar este Precio?</v-card-title>
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
    <!--
    <v-icon
      dense
      @click="deleteItem(item)"
      color="error"
    >
      mdi-delete
    </v-icon>
    !-->
  </template>

  <template v-slot:item.cost="{ item }">
      {{format(item.cost) + ' ' + item.currency_symbol}}
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

export default costs;