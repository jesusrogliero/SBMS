'use strict'

import './dialog/purchases_orders_dialog.js';
import '../utils/autocomplete.js';

// componente home
let costs = Vue.component('purchases-orders', {

  data: () => ({
    dialog: false,
    dialogDelete: false,
    dialogFull: false,
    purchases_id: null,
    page: 1,
    pageCount: 1,
    search: "",
    hidden: false,
    menu: false,
    headers: [
      {
        text: 'ID',
        align: 'start',
        sortable: false,
        value: 'id',
      },
      { text: 'Estado', value: 'state' },
      { text: 'Observacion', value: 'observation', width: '120px'},
      { text: 'Fecha', value: 'date', width: '110px'},
      { text: 'Provedor', value: 'full_name', width: '110px' },
      { text: 'Moneda', value: 'currency_name', width: '110px' },
      { text: 'Impuesto', value: 'tax_amount', width: '110px' },
      { text: 'Subtotal', value: 'subtotal', width: '110px'},
      { text: 'Total', value: 'total', width: '110px'},
      { text: 'Creado', value: 'createdAt', width: '110px'},
      { text: 'Actualizado', value: 'updatedAt', width: '120px'},
      { text: 'Acciones', value: 'actions', sortable: false, width: '110px' },
    ],
    purchases: [],
    editedIndex: -1,
    editedItem: {},
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nueva Orden de Ingreso' : 'Actualizar una Orden de Ingreso';
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
    this.cleanForm();
    this.initialize();

  },

  methods: {
    initialize: async function () {
        this.purchases = await execute('index-purchases',{});
        this.pageCount =  Math.round ( Object.keys(this.purchases).length / 16);
    },

    
    format: function(value) {
        return formatMoney(value);
    },

    cleanForm: function() {
        this.editedItem = {
            id: '',
            observation: '',
            date:  (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
            provider_id: '',
            currency_id: '',
          }
    },

    getSelectProvider: function(value) {
        this.editedItem.provider_id = value;
    },

    getSelectCurrency: function(value) {
        this.editedItem.currency_id = value;
    },

    editItem: async function(item) {
      this.editedIndex = item.id
      this.editedItem = await execute('show-price', this.editedIndex);
      this.dialog = true
    },

    deleteItem: async function(item) {
      this.editedIndex = item.id;
      this.editedItem = await execute('show-purchase', this.editedIndex);

      if(this.editedItem.code == 0){
        alertApp({color:"error", text: this.editedItem, icon: "alert" });
        this.cleanForm();
      }
        
      this.dialogDelete = true
    },

    deleteItemConfirm: async function() {
      let result = await execute('destroy-purchase', this.editedIndex);


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
        this.purchases_id = val.id;
        this.dialogFull = true;
    },

    
    closeDialogFull: function() {
        this.purchases_id = null;
        this.dialogFull = false;
    },

    save: async function() { 
        let result = await execute('create-purchase', this.editedItem);
  
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

  <purchases-orders-dialog
    :active="dialogFull"
    :hidde="closeDialogFull"
    :id="purchases_id"
  >
  </purchases-orders-dialog>
  
  <v-data-table
    :headers="headers"
    :items="purchases"
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
      <v-toolbar-title>Ordenes de Ingreso</v-toolbar-title>
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
                        uri = "index-providers"
                        label = "Selecciona el Provedor"
                        column = "full_name"
                        itemValue = "id"
                        :defaultValue = "editedItem.provider_id"
                        :getSelect = "getSelectProvider"
                    />
                </v-col>

                <v-col cols = "6">
                    <autocomplete-form
                        uri = "index-currencies"
                        label = "Selecciona la Moneda"
                        column = "name"
                        itemValue = "id"
                        :defaultValue = "editedItem.currency_id"
                        :getSelect = "getSelectCurrency"
                    />
                </v-col>

                <v-col cols="12" >
                    <v-textarea
                    label="Observación"
                    v-model="editedItem.observation"
                    auto-grow
                    rows="1"
                    ></v-textarea>
                </v-col>
                

                <v-col cols="6" class="mt-5">
                    <v-slider
                    v-model="editedItem.tax"
                    thumb-label
                    label="Impuesto %"
                    ></v-slider>
                </v-col>

                <v-col cols="6">
                    <v-menu
                    ref="menu"
                    v-model="menu"
                    :close-on-content-click="false"
                    :return-value.sync="editedItem.date"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                            v-model="editedItem.date"
                            label="Fecha"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="editedItem.date"
                            no-title
                            scrollable
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
                            @click="$refs.menu.save(editedItem.date)"
                            >
                            OK
                            </v-btn>
                        </v-date-picker>
                    </v-menu>
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

export default costs;