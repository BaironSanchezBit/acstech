// Google Calendar deshabilitado - servicio cloud ya no activo (2026-03-20)
// Este archivo se auto-ejecutaba al ser importado, causando errores de autenticacion.

console.log('[GoogleCalendar] Servicio deshabilitado - operacion solo local');

// Exportar funciones vacias por si algun modulo las importa
module.exports = {
    authorize: async () => null,
    listEvents: async () => []
};
