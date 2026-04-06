const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const costosTramitesSchema = new Schema({
    departamento: {
        type: String,
        required: false
    },
    ciudad: {
        type: String,
        required: false
    },
    proveedor: {
        type: String,
        required: false
    },
    responsable: {
        type: String,
        required: false
    },
    telefono: {
        type: String,
        required: false
    },
    correoElectronico: {
        type: String,
        required: false
    },
    direccion: {
        type: String,
        required: false
    },
    honorariosProveedor: {
        type: String,
        required: false
    },
    ciudadResidencia: {
        type: String,
        required: false
    },
    numeroCuenta: {
        type: String,
        required: false
    },
    entidad: {
        type: String,
        required: false
    },
    tipoCuenta: {
        type: String,
        required: false
    },
}, {
    timestamps: true
});

module.exports = costosTramitesSchema;