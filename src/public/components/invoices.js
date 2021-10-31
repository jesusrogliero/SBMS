'use strict'

import './dialog/invoices_dialog.js';
import '../utils/autocomplete.js';

// componente de ventas
let invoices = Vue.component('invoices', {

  data: () => ({
    dialog: false,
    dialogDelete: false,
    dialogFull: false,
    invoice_id: null,
    page: 1,
    pageCount: 1,
    search: "",
    hidden: false,
    hidden2: false,
    key_component: 0,
    menu: false,
    headers: [
      {
        text: 'ID',
        align: 'start',
        sortable: false,
        value: 'id',
      },
      { text: 'Estado', value: 'state', width: '100px'},
      { text: 'Cliente', value: 'client_name', width: '120px'},
      { text: 'Moneda', value: 'currency_name', width: '100px'},
      { text: 'Sub total', value: 'subtotal', width: '110px' },
      { text: 'Impuesto', value: 'tax_amount', width: '110px' },
      { text: 'Total', value: 'total', width: '110px' },
      { text: 'Creado', value: 'createdAt', width: '110px'},
      { text: 'Actualizado', value: 'updatedAt', width: '120px'},
      { text: 'Acciones', value: 'actions', sortable: false, width: '110px' },
    ],
    invoices: [],
    date_rage: [],
    editedIndex: -1,
    editedItem: {},
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nueva Venta' : 'Actualizar una Orden de Venta';
    },

    dateRangeText () {
      this.date_rage.sort();
      return this.date_rage.join(' ~ ');
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
    date_rage: async function(val) {
        await this.initialize();
    }
  },

  created () {
    this.cleanForm();
    this.initialize();

  },

  methods: {
    initialize: async function () {
        this.invoices = await execute('index-invoices',this.date_rage);

        if(Math.round ( Object.keys(this.invoices).length / 16) >= 1) 
          this.pageCount =  Math.round ( Object.keys(this.invoices).length / 16);
    },

    
    format: function(value) {
        return formatMoney(value);
    },

    cleanForm: function() {
        this.editedItem = {
            id: '',
            client_id: 1
        };
        this.key_component++;
    },


    btnDate: function() {
      this.hidden2 = !this.hidden2;
      this.date_rage = [];
    },

    getSelectClient: function(value) {
        this.editedItem.client_id = value;
    },

    getSelectCurrency: function(value) {
        this.editedItem.currency_id = value;
    },

    editItem: async function(item) {
      this.editedIndex = item.id
      this.editedItem = await execute('show-invoice', this.editedIndex);
      this.dialog = true;
      this.key_component++;
    },

    deleteItem: async function(item) {
      this.editedIndex = item.id;
      this.editedItem = await execute('show-invoice', this.editedIndex);

      if(this.editedItem.code == 0){
        alertApp({color:"error", text: this.editedItem, icon: "alert" });
        this.cleanForm();
      }
        
      this.dialogDelete = true
    },

    deleteItemConfirm: async function() {
      let result = await execute('destroy-invoice', this.editedIndex);


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

    openDialogFull: function(val) {
        this.invoice_id = val.id;
        this.dialogFull = true;
    },

    
    closeDialogFull: function() {
        this.invoice_id = null;
        this.dialogFull = false;
        this.initialize();
    },

    save: async function() { 
        let result = await execute('create-invoice', this.editedItem);
  
        if(result.code === 1) {
            alertApp({color:"success", text: result, icon: "check" }); 
            this.close();
        }else{
            alertApp({color:"error", text: result, icon: "alert" }); 
        }
       
    },
  },


	template: `
  <v-container max-width="2000">
    <invoices-dialog
        :active="dialogFull"
        :hidde="closeDialogFull"
        :id="invoice_id"
    ></invoices-dialog>
  
  <v-data-table
    :headers="headers"
    :items="invoices"
    class="elevation-0"
    hide-default-footer
    @page-count="pageCount = $event"
    :page.sync="page"
    :items-per-page="16"
    :search="search"
  >
  <template v-slot:top>
    <v-toolbar flat >
      <v-toolbar-title>Facturas</v-toolbar-title>
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

          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :return-value.sync="date_rage"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
              <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                  class="ml-4 mt-4"
                  v-model="dateRangeText"
                  label="Rango de Fecha"
                  v-show="hidden2"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  ></v-text-field>
              </template>
              <v-date-picker
                  v-model="date_rage"
                  no-title
                  scrollable
                  locale="ES-ve"
                  range
              >
                  <v-spacer></v-spacer>
                  <v-btn
                  text
                  color="primary"
                  @click="menu = false"
                  >
                  Cerrar
                  </v-btn>
                  <v-btn
                  text
                  color="primary"
                  @click="$refs.menu.save(date_rage)"
                  >
                  OK
                  </v-btn>
              </v-date-picker>
          </v-menu>

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
            @click="btnDate"
          >
            <v-icon
            >
            mdi-filter
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

                <v-col cols = "6">
                    <autocomplete-form
                        uri = "index-clients"
                        label = "Selecciona el Cliente"
                        column = "cedula"
                        itemValue = "id"
                        :defaultValue = "editedItem.client_id"
                        :getSelect = "getSelectClient"
                        :key="key_component"
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
          <v-card-title class="text-h5">Estas seguro que deseas eliminar esta factura?</v-card-title>
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
      @click="openDialogFull(item)"
      color="success"
    >
        mdi-format-list-bulleted
    </v-icon>
    <v-icon
      dense
      @click="deleteItem(item)"
      color="error"
    >
      mdi-delete
    </v-icon>
  </template>

    <template v-slot:item.tax_amount="{ item }">
        {{format(item.tax_amount) + ' ' + item.currency_symbol}}
    </template>

   <template v-slot:item.subtotal="{ item }">
        {{format(item.subtotal) + ' ' + item.currency_symbol}}
    </template>

    <template v-slot:item.total="{ item }">
        {{format(item.total) + ' ' + item.currency_symbol}}
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

export default invoices;