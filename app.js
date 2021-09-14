const { app, BrowserWindow } = require('electron');
const { loadMethods } = require('./methods');
const dirs = require('./dirs');

// funcion de inicio de la aplicacion
const main = function () {
  // cargando ventana
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 1100,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setMenuBarVisibility(false)
  win.setIcon('icon.png');
  win.loadFile(dirs.public + 'index.html');


  // cargando el listo de archivos
  const fs = require('fs');
  fs.readdir(dirs.methods, (error, files) => {
    if (!error) loadMethods(files);
    else console.error(error);
  });
};

app.whenReady().then(() => main());
