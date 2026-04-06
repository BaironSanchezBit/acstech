const Variable = require('./variables.controller');

module.exports = (router) => {
    router.post('/postVariable', Variable.create);
    router.get('/getVariable', Variable.getAll);
    router.get('/getVariable/:id', Variable.getOne);
    router.put('/updateVariable/:id', Variable.update);
    router.get('/getVariableById/variable/:id', Variable.getVariableById);
    router.get('/getVariableByName/variable/:id', Variable.getVariableByName);
    router.delete('/deleteVariable/:id', Variable.delete);
};