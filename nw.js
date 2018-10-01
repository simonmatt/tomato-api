let Service = require('node-windows').Service;
let svc = new Service({
    name: 'node-tomato-api',
    description: 'Tomato API for Angular, Vue and React',
    script: 'G:/Projects/NodeJS/node-tomato-api/app.js'
});

svc.on('install', () => {
    svc.start();
});

svc.install();