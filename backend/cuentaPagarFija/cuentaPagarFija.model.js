const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pagosArraySchema = new Schema({
    fecha: {
        type: Date,
        required: true
    },
    valor: {
        type: Number,
        required: true
    }
});

const pagoSchema = new Schema({
    fechaPago: {
        type: Date,
        required: true
    },
    diasVencidos: {
        type: Number,
        required: false
    },
    valor: {
        type: Number,
        required: false
    },
    saldo: {
        type: Number,
        required: false
    },
    pagado: {
        type: Boolean,
        required: false,
        default: false
    },
    aprueba: {
        type: Boolean,
        default: false
    },
    solicita: {
        type: Boolean,
        default: false
    },
    prioridad: {
        type: String,
        default: 'Media'
    },
    pagosArray: [pagosArraySchema]
});

const cuentaPagarFijaSchema = new Schema({
    valor: {
        type: Number,
        required: false
    },
    pagos: [pagoSchema],
    tipo: {
        type: String,
        required: false,
        trim: true
    },
    tercero: {
        type: String,
        required: false,
        trim: true
    },
    concepto: {
        type: String,
        required: false,
        trim: true
    },
    numeroCuenta: {
        type: String,
        required: false,
        trim: true
    },
    dia: {
        type: String,
        required: false,
        trim: true
    },
    estado: {
        type: String,
        required: false,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = cuentaPagarFijaSchema;