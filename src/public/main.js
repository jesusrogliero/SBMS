'use strict'

import routes from './routes.js'; 
import Snapback from "./utils/SnackbarApp.js";
const router = new VueRouter({ routes: routes });

let vue = new Vue({
  el: '#app',
  vuetify: new Vuetify({
    theme: {
      themes: {
        light: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
    },
  }),
  router: router,

  data: function() {
    return {
      alert: false,
      textAlert: "",
      colorAlert: "",
      iconAlert: null,
      timeAlert: null,
      drawer: false,
      group: null,
    }
  },


  methods: {
    // funcion que activa la alert
    activeAlert: function (params = {}) {
      this.alert = true;
      this.colorAlert = params.color != null ? params.color : "info";
      this.textAlert = params.text != null ? params.text : "";
      this.iconAlert = params.icon;
    },

    toHome: function() {
      console.log('toHome');
      this.$router.push('/');
    },
    
    toProducts: function() {
      console.log('toProducts');
      this.$router.push('/products');
    },
    
    toConfig: function() {
      console.log('toConfig');
    },

    toHistory: function() {
      console.log('toHistory');
      this.$router.push('/histories');
    },

    toNotes: function() {
      console.log('toNotes');
      this.$router.push('/notes');
    },
  },
  
  watch: {
    group () {
      this.drawer = false
    },
},


});

window.appInstance = vue;
