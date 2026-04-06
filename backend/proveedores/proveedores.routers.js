const Suppliers = require('./proveedores.controller');

module.exports = (router) => {
    router.post('/postSuppliers', Suppliers.create);
    router.get('/getSuppliers', Suppliers.getAll);
    router.get('/getSuppliers/:id', Suppliers.getOne);
    router.put('/updateSuppliers/:id', Suppliers.update);
    router.get('/getSuppliers/name/:name', Suppliers.getByName);
    router.delete('/deleteSuppliers/:id', Suppliers.delete);
};