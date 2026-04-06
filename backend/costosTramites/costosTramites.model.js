const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const costosTramitesSchema = new Schema({
    ciudad: {
        type: String,
        required: false
    },
    traspaso100: {
        type: Number,
        required: false
    },
    inscripcionPrenda: {
        type: Number,
        required: false
    },
    levantamientoPrenda: {
        type: Number,
        required: false
    },
    trasladoDeCuenta: {
        type: Number,
        required: false
    },
    radicacionDeCuenta: {
        type: Number,
        required: false
    },
    duplicadoDePlacas: {
        type: Number,
        required: false
    },
    certificadoDeTradicion: {
        type: Number,
        required: false
    },
    certificacionDeImpuestos: {
        type: Number,
        required: false
    },
    historicoVehicular: {
        type: Number,
        required: false
    },
    honorariosTramitado: {
        type: Number,
        required: false
    },
    honorariosAutomagno: {
        type: Number,
        required: false
    },
}, {
    timestamps: true
});

module.exports = costosTramitesSchema;