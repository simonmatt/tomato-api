let Service = require('node-windows').Service;
let svc = new Service({
    name: 'node-tomato-api',
    description: 'Tomato API for Angular, Vue and React',
    script: 'G:/Projects/NodeJS/node-tomato-api/app.js'
});

svc.on('uninstall', () => {
    console.log('Uninstall complete.');
    console.log('The service exists: ', svc.exists);
});
svc.uninstall();