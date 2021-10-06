const { app, BrowserWindow } = require('electron');
const { loadMethods } = require('./methods');
const dirs = require('./dirs');
const path = require('path');
const log = require('electron-log').transports.file.resolvePath = () => path.join('logs/main.log');

// funcion de inicio de la aplicacion
const main = function () {
  // cargando ventana
  const win = new BrowserWindow({
    show:false,
    minWidth: 1110,
    minHeight: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.maximize();
  win.setMenuBarVisibility(false)
  win.loadFile(dirs.public + 'index.html');


  // cargando el listado de archivos
  const fs = require('fs');
  fs.readdir(dirs.methods, (error, files) => {
    if (!error) loadMethods(files);
    else console.error(error);
  });

  win.once('ready-to-show', () => {
    win.show();
  });

};

app.whenReady().then(() => main());

