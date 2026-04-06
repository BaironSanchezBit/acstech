const SitiosWeb = require('./sitiosWeb.controller');

module.exports = (router) => {
    router.post('/postWebsite', SitiosWeb.create);
    router.get('/getWebsite', SitiosWeb.getAll);
    router.get('/getWebsite/:id', SitiosWeb.getOne);
    router.put('/updateWebsite/:id', SitiosWeb.update);
    router.get('/getWebsiteById/website/:id', SitiosWeb.getWebsiteById);
    router.get('/getWebsiteByName/website/:id', SitiosWeb.getWebsiteByName);
    router.delete('/deleteWebsite/:id', SitiosWeb.delete);
};