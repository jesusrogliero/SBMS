'use strict'

// componente home
let taxes = Vue.component('taxes', {

  data: () => ({
    dialog: false,
    dialogDelete: false,
    page: 1,
    pageCount: 0,
    search: "",
    hidden: false,
    headers: [
      {
        text: 'ID',
        align: 'start',
        sortable: false,
        value: 'id',
      },
      { text: 'Nombre', value: 'name' },
      { text: 'Porcentage', value: 'percentage' },
      { text: 'Creado', value: 'createdAt' },
      { text: 'Actualizado', value: 'updatedAt' },
      { text: 'Acciones', value: 'actions', sortable: false },
    ],
    taxes: [],
    editedIndex: -1,
    editedItem: {},
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nuevo Impuesto' : 'Actualizar un Impuesto';
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
      this.taxes = await execute('index-taxes',{});

      
      if( Math.round ( Object.keys(this.taxes).length / 16) >= 1)
        this.pageCount =  Math.round ( Object.keys(this.taxes).length / 16);
    },

    cleanForm: function() {
      this.editedItem = {
        id: '',
        name: '',
        percentage: 0,
      };
    },

    editItem: async function(item) {
      this.editedIndex = item.id
      this.editedItem = await execute('show-tax', this.editedIndex);
      this.dialog = true
    },

    deleteItem: async function(item) {
      this.editedIndex = item.id;
      this.editedItem = await execute('show-tax', this.editedIndex);

      if(this.editedItem.code == 0){
        alertApp({color:"error", text: this.editedItem, icon: "alert" });
        this.cleanForm();
      }
        
      this.dialogDelete = true
    },

    deleteItemConfirm: async function() {
      let result = await execute('destroy-tax', this.editedIndex);


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
        result = await execute('update-tax', this.editedItem);
      } else {
        result = await execute('create-tax', this.editedItem);
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
    :items="taxes"
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
      <v-toolbar-title>Impuestos</v-toolbar-title>
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
                <v-col
                  cols="12"
                >
                  <v-text-field
                    v-model="editedItem.name"
                    label="Nombre"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                <v-subheader class="pl-0">
                  Porcentage
                </v-subheader>
              
                <v-slider
                  v-model="editedItem.percentage"
                  class="align-center"
                  label="Precio"
                  max="100"
                  min="0"
                >
                  <template v-slot:append>
                    <v-text-field
                      v-model="editedItem.percentage"
                      class="mt-n12"
                      hide-details
                      single-line
                      type="number"
                      disabled
                      prefix="%"
                      style="width: 60px"
                    ></v-text-field>
                  </template>
                </v-slider>
      
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
          <v-card-title class="text-h5">Estas seguro que deseas eliminar el cliente?</v-card-title>
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

export default taxes;