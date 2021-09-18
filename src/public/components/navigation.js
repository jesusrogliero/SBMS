'use strict'

// componente home
let navigation = Vue.component('navigation', {

    data: function() {
        return {
        }
    },

    methods: {


        toHome: function() { this.$router.push('/'); },

        toTaxes: function() { this.$router.push('/taxes'); },

        toClients: function() { this.$router.push('/clients'); },

        toCurrencies: function() { this.$router.push('/currencies'); },

        toProducts: function() { this.$router.push('/products'); },

        toPrices: function() { this.$router.push('/prices')},

        toPurchases: function() { this.$router.push('/purchases_orders')},

        toProviders: function() { this.$router.push('/providers')}


    },


	template: `
    <v-navigation-drawer 
        app 
        permanent
        color="#263043"
    >

    <v-list>
    <v-list-item>
        <v-list-item-content>
        <v-list-item-title style="color: white;" class="text-h6">
            LA Bodega C.A
        </v-list-item-title>
        </v-list-item-content>
    </v-list-item>
    </v-list>



    <v-list class="mt-4" dense nav>

    <v-list-item link>
        <v-list-item-icon>
        <v-icon color="#8e97a5">mdi-home</v-icon>
        </v-list-item-icon>

        <v-list-item-content @click="toHome">
        <v-list-item-title class="text-body-1" style="color: white;">Home</v-list-item-title>
        </v-list-item-content>
    </v-list-item>

    <v-subheader class="mt-2" style="font-size: medium; color:#8e97a5;">Finanzas</v-subheader>
    
     
    <v-list-item link>
        <v-list-item-icon>
          <v-icon color="#8e97a5">mdi-calculator</v-icon>
        </v-list-item-icon>

        <v-list-item-content @click="toTaxes">
          <v-list-item-title class="text-body-1" style="color: white;">Impuestos</v-list-item-title>
        </v-list-item-content>
    </v-list-item>

    <v-list-item link>
        <v-list-item-icon>
            <v-icon color="#8e97a5">mdi-chart-line</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
            <v-list-item-title class="text-body-1" style="color: white;">Costos</v-list-item-title>
        </v-list-item-content>
    </v-list-item>

    <v-list-item link>
        <v-list-item-icon>
            <v-icon color="#8e97a5">mdi-cash-multiple</v-icon>
        </v-list-item-icon>

        <v-list-item-content @click="toPrices">
            <v-list-item-title class="text-body-1" style="color: white;">Precios</v-list-item-title>
        </v-list-item-content>
    </v-list-item>

    <v-list-item link>
        <v-list-item-icon>
            <v-icon color="#8e97a5">mdi-currency-usd</v-icon>
        </v-list-item-icon>

        <v-list-item-content @click="toCurrencies">
            <v-list-item-title class="text-body-1" style="color: white;">Monedas</v-list-item-title>
        </v-list-item-content>
    </v-list-item>

    <v-subheader class="mt-4" style="font-size: medium; color:#8e97a5;" >Productos</v-subheader>
    
    <v-list-item link>
        <v-list-item-icon>
            <v-icon color="#8e97a5">mdi-food-variant</v-icon>
        </v-list-item-icon>

        <v-list-item-content @click="toProducts">
            <v-list-item-title class="text-body-1" style="color: white;">Productos</v-list-item-title>
        </v-list-item-content>
    </v-list-item>

    <v-subheader class="mt-4" style="font-size: medium; color:#8e97a5;" >Clientes</v-subheader>

    <v-list-item link>
        <v-list-item-icon>
            <v-icon color="#8e97a5">mdi-account</v-icon>
        </v-list-item-icon>

        <v-list-item-content @click="toClients">
            <v-list-item-title class="text-body-1" style="color: white;">Clientes</v-list-item-title>
        </v-list-item-content>
    </v-list-item>


    <v-list-item link>
        <v-list-item-icon>
            <v-icon color="#8e97a5">mdi-account-multiple</v-icon>
        </v-list-item-icon>

        <v-list-item-content @click="toProviders">
            <v-list-item-title class="text-body-1" style="color: white;">Provedores</v-list-item-title>
        </v-list-item-content>
    </v-list-item>

    <v-subheader class="mt-4" style="font-size: medium; color:#8e97a5;" >Ingresos y Facturas</v-subheader>

    <v-list-item link>
        <v-list-item-icon>
            <v-icon class="" color="#8e97a5">mdi-cart-outline</v-icon>
        </v-list-item-icon>

        <v-list-item-content @click="toPurchases" >
            <v-list-item-title class="text-body-1" style="color: white;">Compras</v-list-item-title>
        </v-list-item-content>
    </v-list-item>

    <v-list-item link>
        <v-list-item-icon>
            <v-icon class="" color="#8e97a5">mdi-file-document</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
            <v-list-item-title class="text-body-1" style="color: white;">Facturas</v-list-item-title>
        </v-list-item-content>
    </v-list-item>

    </v-list>


    <template v-slot:append>
        <div class="pa-2">
            <v-btn block color="primary">
            Salir
            </v-btn>
        </div>
    </template>

  </v-navigation-drawer>

  `
});

export default navigation;
