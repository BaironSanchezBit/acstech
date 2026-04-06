const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pagoSchema = new Schema({
    fechaPago: {
        type: Date,
        required: true
    },
    valor: {
        type: Number,
        required: true
    }
});

const cuentaPagarSchema = new Schema({
    clasificacion: {
        type: String,
        required: false,
        trim: true,
    },
    tipo: {
        type: String,
        required: false,
        trim: true,
    },
    placa: {
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
    valor: {
        type: Number,
        trim: true
    },
    saldo: {
        type: Number,
        required: false,
        trim: true
    },
    pagos: [pagoSchema],
    fechaVencimiento: {
        type: String,
        required: false,
        trim: true
    },
    diasVencidos: {
        type: String,
        required: false,
        trim: true
    },
    aprueba: {
        type: Boolean,
        default: false
    },
    solicita: {
        type: Boolean,
        default: false
    },
    pagado: {
        type: Boolean,
        default: false
    },
    prioridad: {
        type: String,
        default: 'Media'
    },
    aCargo: {
        type: String,
        required: false,
        trim: true
    },
    entidadFinanciera: {
        type: String,
        required: false,
        trim: true
    },
    numeroCuentas: {
        type: String,
        required: false,
        trim: true
    },
    formasPago: {
        type: String,
        required: false,
        trim: true
    },
    dia: {
        type: String,
        required: false,
        trim: true
    },
    }, {
    timestamps: true
});

module.exports = cuentaPagarSchema;