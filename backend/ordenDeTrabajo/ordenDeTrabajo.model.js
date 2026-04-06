const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModificacionSchema = new Schema({
    quien: { type: String, default: '' },
    fecha: { type: Date, default: Date.now }
});

const TrabajoSchema = new Schema({
    tipo: { type: String, required: false },
    estado: { type: String, required: false },
    proveedor: { type: String, required: false },
    responsable: { type: String, required: false },
    telefono: { type: String, required: false },
    tiempo: { type: String, required: false },
    diaRealizacion: { type: Date, required: false },
    atiende: { type: String, required: false },
    observacion: { type: String, required: false },
    imagenes: [String]
});

const OrdenDeTrabajoSchema = new Schema({
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculos', required: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Clientes', required: true },
    modificacion: [ModificacionSchema],
    estadoOrden: { type: String, required: false },
    pruebaDeRuta: { type: String, required: false },
    trabajos: [TrabajoSchema],
    numeroOrden: { type: Number },
    numeroInventario: { type: String },
    ultimoKilometraje: { type: String, required: false },
    lugarUltimoMantenimiento: { type: String, required: false }
}, {
    timestamps: true
});

const CounterSchema = new Schema({
    _id: String,
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('CounterOrdenes', CounterSchema);

function getNextSequence(name) {
    return Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).then(result => result.seq);
}

OrdenDeTrabajoSchema.pre('save', async function (next) {
    if (this.isNew) {
        const nextSeq = await getNextSequence('ordenes');
        this.numeroOrden = nextSeq;
        next();
    } else {
        next();
    }
});

module.exports = OrdenDeTrabajoSchema;
