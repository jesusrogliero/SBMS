'use strict'

// componente home
let home = Vue.component('home', {

    data: function() {
        return {
        }
    },


	template: `
    <v-container>
      <v-row>
        <v-col>
        <div>
          <v-icon style="margin-left:1.5em;" size="50">mdi-account</v-icon>
          <span>Bienvenido Admin</span>
        </div>
        </v-col>
      </v-row>
    </v-container>

    `
});

export default home;
