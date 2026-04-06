const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tramitesSchema = new Schema({
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculos', required: true
    },
    valorImpuesto: {
        type: String,
        required: false
    },
    estadoImpuesto: {
        type: String,
        required: false
    },
    estadoVenta: {
        type: String,
        required: false
    },
    fechaVenta: {
        type: Date,
        required: false
    },
    proveedor: {
        type: String,
        required: false
    },
    tipoNegocio: {
        type: String,
        required: false
    },
    comprador: {
        type: String,
        required: false
    },
    vendedor:{
        type: String,
        required: false
    },
    levantamiento: {
        type: String,
        required: false
    },
    inscripcion: {
        type: String,
        required: false
    },
    sePuedeTraspaso: {
        type: String,
        required: false
    },
    observacionTraspaso: {
        type: String,
        required: false
    },
    ciudadTraspaso: {
        type: String,
        required: false
    },
    estadoTraspaso: {
        type: String,
        required: false
    },
    fechaEnvioTraspaso: {
        type: Date,
        required: false
    },
    estadoFinal: {
        type: String,
        required: false
    },
    observacionFinal: {
        type: String,
        required: false
    },
    numeroInventario: {
        type: String,
        required: false
    },
    numeroDias: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = tramitesSchema;