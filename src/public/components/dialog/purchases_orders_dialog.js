'use strict'

// componente home
let purchasesOrdersDialog = Vue.component('purchases-orders-dialog', {
    
    props: ['id', 'hidde', 'active'],

  data: () => ({
    dialog: false,
    dialogDelete: false,
    dialog_approve: false,
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
      { text: 'Producto', value: 'product_name'},
      { text: 'Cantidad', value: 'quantity'},
      { text: 'Precio p/u', value: 'price'},
      { text: 'Impuesto', value: 'tax_amount' },
      { text: 'Subtotal', value: 'subtotal'},
      { text: 'Total', value: 'total'},
      { text: 'Creado', value: 'createdAt'},
      { text: 'Actualizado', value: 'updatedAt'},
      { text: 'Acciones', value: 'actions', sortable: false},
    ],
    purchases_items: [],
    purchase: {},
    currency: {},
    provider: {},
    editedIndex: -1,
    editedItem: {},
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Añadir un Producto' : 'Actualizar un Producto';
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
    
    id: async function (val) {
       
        if(val != null) {
            this.cleanForm();
             await this.initialize();

            this.currency = await execute('show-currency', this.purchase.currency_id);
            this.provider = await execute('show-provider', this.purchase.provider_id);
        }
    }
  },


  methods: {
    initialize: async function () {
        this.purchase = await execute('show-purchase', this.id);
        this.purchases_items = await execute('index-purchases_items', this.id);
        this.pageCount =  Math.round ( Object.keys(this.purchases_items).length / 16); 
    },

    
    format: function(value) {
        return `${formatMoney(value)} ${this.currency.symbol} `;
    },

    cleanForm: function() {
        this.editedItem = {
            id: '',
            purchase_order_id: this.id,
            product_id: '',
            price: '',
            quantity: '',
            tax: '',
          }
    },

    getSelectProduct: function(value) {
        this.editedItem.product_id = value;
    },

    saveOrder: async function() {
      let result = await execute('generate-purchase', this.id);

      if(result.code == 1) {
        alertApp({color:"success", text: result, icon: "check" }); 
      }else{
        alertApp({color:"error", text: result, icon: "alert" }); 
      }

      this.initialize();

    },

    approveOrderDialog:  function() {
      this.dialog_approve = true;
    },

    approveOrder: async function(generate_cost) {
      let result = await execute('approve-purchase', {
        id: this.id,
        generate_cost: generate_cost
      });

      if(result.code == 1) {
        alertApp({color:"success", text: result, icon: "check" }); 
      }else{
        alertApp({color:"error", text: result, icon: "alert" }); 
      }

      this.dialog_approve = false;
      this.initialize();

    },

    editItem: async function(item) {
      this.editedIndex = item.id
      this.editedItem = await execute('show-purchase_item', this.editedIndex);
      this.dialog = true
    },

    deleteItem: async function(item) {
      this.editedIndex = item.id;
      this.editedItem = await execute('show-purchase_item', this.editedIndex);

      if(this.editedItem.code == 0){
        alertApp({color:"error", text: this.editedItem, icon: "alert" });
        this.cleanForm();
      }
        
      this.dialogDelete = true
    },

    deleteItemConfirm: async function() {
      let result = await execute('destroy-purchase_item', this.editedIndex);


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
          result = await execute('update-purchase_item', this.editedItem);
        } else {
          result = await execute('create-purchase-item', this.editedItem);
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

    <v-row justify="center">
      <v-dialog
        v-model="dialog_approve"
        persistent
        max-width="300"
      >
        <v-card>
          <v-card-title class="text-h5">
            Importante!!
          </v-card-title>
          <v-card-text class="text-h6">¿Deseas que ajuste los costos de los productos por ti?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="red darken-1"
              text
              @click="approveOrder(false)"
            >
              No
            </v-btn>
            <v-btn
              color="green darken-1"
              text
              @click="approveOrder(true)"
            >
              Si
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>


    <v-dialog
      v-model="active"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >

    <v-toolbar
          dark
          color="primary"
        >
          <v-btn
            icon
            dark
            @click="hidde()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Detalles de la Orden de Ingreso</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              dark
              text
              v-show="purchase.state_id == 2"
              @click="approveOrderDialog"
            >
            Aprobar
            <v-icon>mdi-clipboard-check</v-icon>
            </v-btn>

            <v-btn
            dark
            text
            v-show="purchase.state_id == 1"
            @click="saveOrder"
            >
          Generar 
          <v-icon>mdi-content-save</v-icon>
          </v-btn>

          </v-toolbar-items>
        </v-toolbar>


        <v-card class="m-n6">
        <v-container>
        <v-row>
        
        <v-col>
        <v-card
        elevation="2"
        height="16em"
        >
          <v-card-title >Datos de la Orden</v-card-title>

          <v-card-text>
          
          <v-row>
          <v-col cols="6" class="font-weight-black" >Moneda:</v-col>
          <v-col cols="6">{{currency.name + ' ' + currency.symbol}}</v-col>
          </v-row>


          <v-row>
          <v-col cols="6" class="font-weight-black" >Estado:</v-col>
          <v-col cols="6" v-if="purchase.state_id == 1">Pendiente</v-col>
          <v-col cols="6" v-if="purchase.state_id == 2">Generada</v-col>
          <v-col cols="6" v-if="purchase.state_id == 3">Aprobada</v-col>
          </v-row>

          <v-row>
          <v-col cols="6" class="font-weight-black" >Cantidad de Productos:</v-col>
          <v-col cols="6">{{purchase.total_products}}</v-col>
          </v-row>

          <v-row>
          <v-col cols="6" class="font-weight-black" >Observación</v-col>
          <v-col cols="6">{{purchase.observation}}</v-col>
          </v-row>

          </v-card-text>
        </v-card>
        </v-col>

        <v-col>
        <v-card
        elevation="2"
        height="16em"
        >
          <v-card-title>Totalizacion</v-card-title>

          <v-card-text>

          <v-row>
          <v-col cols="6" class="font-weight-black" >Impuesto total:</v-col>
          <v-col cols="6">{{format(purchase.tax_amount)}}</v-col>
          </v-row>

          <v-row>
          <v-col cols="6" class="font-weight-black" >SubTotal:</v-col>
          <v-col cols="6">{{format(purchase.subtotal)}}</v-col>
          </v-row>

          <v-row>
          <v-col cols="6" class="font-weight-black" >Total:</v-col>
          <v-col cols="6">{{format(purchase.total)}}</v-col>
          </v-row>

          </v-card-text>
          </v-card>
        </v-col>


        <v-col>
        <v-card
        elevation="2"
        height="16em"
        >
          <v-card-title>Datos del Provedor</v-card-title>

          <v-card-text>
          
          <v-row>
          <v-col cols="6" class="font-weight-black" >Nombre:</v-col>
          <v-col cols="6">{{provider.full_name}}</v-col>
          </v-row>

          <v-row>
          <v-col cols="6" class="font-weight-black" >Telefono:</v-col>
          <v-col cols="6">{{provider.phone}}</v-col>
          </v-row>

          </v-card-text>
          </v-card>
        </v-col>

        
        </v-row>
      
      </v-container>


        <v-data-table
        :headers="headers"
        :items="purchases_items"
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
                            uri = "index-products"
                            label = "Selecciona el Producto"
                            column = "name"
                            itemValue = "id"
                            :defaultValue = "editedItem.product_id"
                            :getSelect = "getSelectProduct"
                        />
                    </v-col>

                    <v-col cols="6" >
                        <v-text-field
                            v-model="editedItem.quantity"
                            label="Cantidad"
                        ></v-text-field>
                    </v-col>

                    <v-col cols="6" >
                        <v-text-field
                            v-model="editedItem.price"
                            label="Precio"
                        ></v-text-field>
                    </v-col>

                    <v-col cols="6" class="mt-5">
                        <v-slider
                        v-model="editedItem.tax"
                        thumb-label
                        label="Impuesto %"
                        ></v-slider>
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
      {{format(item.price)}}
    </template>

    <template v-slot:item.tax_amount="{ item }">
    {{format(item.tax_amount)}}
    </template>

    <template v-slot:item.subtotal="{ item }">
        {{format(item.subtotal)}}
    </template>

    <template v-slot:item.total="{ item }">
        {{format(item.total)}}
    </template>


    </v-data-table>
    <div class="text-center pt-2">
        <v-pagination
            v-model="page"
            :length="pageCount"
        ></v-pagination>
    </div>
    </v-card>
    </v-dialog>
  </v-container>

  `
});

export default purchasesOrdersDialog;







