// Gmail SMTP deshabilitado - servicio cloud ya no activo (2026-03-20)
// const transporter = require('../mailer');

exports.send_email = async (req, res) => {
    // Gmail deshabilitado (2026-03-20)
    console.log('[Email deshabilitado] Intento de envio:', req.body.subject);
    res.json({
        success: true,
        message: 'Servicio de correo deshabilitado - operacion solo local',
    });
};
