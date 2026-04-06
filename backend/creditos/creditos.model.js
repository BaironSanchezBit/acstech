const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CounterSchema = new mongoose.Schema({
    _id: String,
    seq: {
        type: Number,
        default: 0
    }
});

const Counter = mongoose.model('CounterCreditos', CounterSchema);


function getNextSequence(name) {
    return Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).then(result => result.seq);
}

const creditosSchema = new Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Clientes', required: true
    },
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculos', required: true
    },
    tipoCliente: {
        type: String,
        required: false
    },
    valorVehiculo: {
        type: String,
        required: false
    },
    valorSolicitado: {
        type: String,
        required: false
    },
    valorAprobado: {
        type: String,
        required: false
    },
    nombreBanco: {
        type: String,
        required: false
    },
    observaciones: {
        type: String,
        required: false
    },
    tasaAprobacion: {
        type: String,
        required: false
    },
    condicionesAprobacion: {
        type: String,
        required: false
    },
    estadoSolicitud: {
        type: String,
        required: false
    },
    fechaRegistro: {
        type: String,
        required: false
    },
    estadoSolicitudPoliza: {
        type: String,
        required: false
    },
    aseguradora: {
        type: String,
        required: false
    },
    asesorComercialAutomagno: {
        type: String,
        required: false
    },
    asesorEntidadFinanciera: {
        type: String,
        required: false
    },
    celularAsesorFinanciera: {
        type: String,
        required: false
    },
    correoAsesorEntidadFinanciera: {
        type: String,
        required: false
    },
    numeroSolicitud: {
        type: Number
    },
}, {
    timestamps: true
});

creditosSchema.pre('save', async function (next) {
    if (this.isNew) {
        const nextSeq = await getNextSequence('creditos');
        this.numeroSolicitud = nextSeq;
        next();
    } else {
        next();
    }
});
module.exports = creditosSchema;