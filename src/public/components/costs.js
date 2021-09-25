'use strict'

// componente home
let costs = Vue.component('costs', {

  data: () => ({
    page: 1,
    pageCount: 1,
    search: "",
    hidden: false,
    headers: [
      { text: 'Producto', value: 'product_name' },
      { text: 'Costo', value: 'cost' },
      { text: 'Creado', value: 'createdAt' },
      { text: 'Actualizado', value: 'updatedAt' },
    ],
    costs: [],
    editedIndex: -1,
    editedItem: {},
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? '' : '';
    },
  },

  created () {
    this.cleanForm();
    this.initialize();
  },

  methods: {
    initialize: async function () {
      this.costs = await execute('index-costs',{});
      this.pageCount =  Math.round ( Object.keys(this.costs).length / 16);
    },

    cleanForm: function() {
      this.editedItem = {
          id: '',
          cost: '',
        }
    },

    format: function(value) {
      return formatMoney(value);
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
        :v-model="false"
        max-width="500px"
      >
        <template v-slot:activator="{ on, attrs }">

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