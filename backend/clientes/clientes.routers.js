const Clients = require('./clientes.controller');

module.exports = (router) => {
    router.post('/postClients', Clients.create);
    router.get('/getClients', Clients.getAll);
    router.get('/getAllNumerosIdent', Clients.getAllNumerosIdent);
    router.get('/getClients/:id', Clients.getOne);
    router.put('/updateClients/:id', Clients.update);
    router.get('/getClientsById/client/:client', Clients.getClientsById);
    router.get('/getClientsByName/client/:client', Clients.getClientsByName);
    router.delete('/deleteClients/:id', Clients.delete);
};