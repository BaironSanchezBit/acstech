// Gmail SMTP deshabilitado - servicio cloud ya no activo (2026-03-20)
// const nodemailer = require('nodemailer');

// Transporter mock que no intenta conectar a Gmail
const transporter = {
    sendMail: async (options) => {
        console.log('[Mailer deshabilitado] Intento de envio a:', options.to, '| Asunto:', options.subject);
        return { messageId: 'disabled-' + Date.now() };
    }
};

module.exports = transporter;
