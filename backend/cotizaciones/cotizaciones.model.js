const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CounterSchema = new mongoose.Schema({
    _id: String,
    seq: {
        type: Number,
        default: 0
    }
});

const Counter = mongoose.model('CounterCotizaciones', CounterSchema);


function getNextSequence(name) {
    return Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).then(result => result.seq);
}

const cotizacionSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    tipoIdentificacion: {
        type: String,
        required: false
    },
    numeroIdentificacion: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    telefono: {
        type: String,
        required: false
    },
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculos', required: true
    },
    valorVehiculo: {
        type: String,
        required: true
    },
    tieneCredito: {
        type: Boolean
    },
    valorCredito: {
        type: String
    },
    cobraSoat: {
        type: Boolean
    },
    cobraImpuesto: {
        type: Boolean
    },
    valorTotalSoat: {
        type: String
    },
    fechaFinSoat: {
        type: Date
    },
    valorImpAnoEnCurso: {
        type: String
    },
    honorarios: {
        type: String
    },
    traspaso50: {
        type: String
    },
    propImpAnoCurso: {
        type: String
    },
    PropSoat: {
        type: String
    },
    kilometraje: {
        type: String
    },
    costoVehiculo: {
        type: String
    },
    totalDocumentacion: {
        type: String
    },
    totalNegocio: {
        type: String
    },
    prenda: {
        type: String
    },
    asesorComercial: {
        type: String
    },
    numeroAsesor: {
        type: String
    },
    separacion5: {
        type: String
    },
    valorFinanciar: {
        type: String
    },
    plazoMeses: {
        type: String
    },
    pagoMensual: {
        type: String
    },
    noCotizacion: {
        type: Number
    },
}, {
    timestamps: true
});

cotizacionSchema.pre('save', async function (next) {
    if (this.isNew) {
        const nextSeq = await getNextSequence('cotizaciones');
        this.noCotizacion = nextSeq;
        next();
    } else {
        next();
    }
});

module.exports = cotizacionSchema;