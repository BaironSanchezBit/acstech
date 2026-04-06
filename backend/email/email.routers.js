const Email = require('./email.controller');

module.exports = (router) => {
    router.post('/send-email', Email.send_email);
};
