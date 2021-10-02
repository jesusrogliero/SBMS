'use strict';

let routes = [
    {path: "/", component: () => import("./components/home.js") },
    {path: "/taxes", component: () => import("./components/taxes.js") },
    {path: "/clients", component: () => import("./components/clients.js") },
    {path: "/currencies", component: () => import("./components/currencies.js") },
    {path: "/products", component: () => import("./components/products.js") },
    {path: "/prices", component: () => import("./components/prices.js") },
    {path: "/purchases_orders", component: () => import("./components/purchasesOrders.js") },
    {path: "/providers", component: () => import("./components/providers.js") },
    {path: "/costs", component: () => import("./components/costs.js") },
    {path: "/invoices", component: () => import("./components/invoices.js") },

];

// exportando rutas designadas
export default routes;