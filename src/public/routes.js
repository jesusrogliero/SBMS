'use strict';

let routes = [
    {path: "/", component: () => import("./components/home.js") },
    {path: "/taxes", component: () => import("./components/taxes.js") },
    {path: "/clients", component: () => import("./components/clients.js") },
    {path: "/currencies", component: () => import("./components/currencies.js") },
    {path: "/products", component: () => import("./components/products.js") },
    {path: "/prices", component: () => import("./components/prices.js") },

];

// exportando rutas designadas
export default routes;