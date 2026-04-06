const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CounterSchemaCompra = new mongoose.Schema({
    _id: String,
    seq: {
        type: Number,
        default: 0
    }
});

const Counter = mongoose.model('CounterCotizacionesCompra', CounterSchemaCompra);


function getNextSequence(name) {
    return Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).then(result => result.seq);
}

const cotizacionCompraSchema = new Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Clientes', required: true
    },
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculos', required: true
    },
    valorVehiculo: {
        type: String,
        required: true
    },
    tienePrenda: {
        type: Boolean
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
    noCotizacionCompra: {
        type: Number
    },
    documentosValoresIniciales: {
        ciudadPlaca: {
            type: String
        },
        certificadoTradicion: {
            type: String
        },
        estadoCuentaImpuesto: {
            type: String
        },
        estadoCuentaImpuestoValor: {
            type: String
        },
        simitPropietario: {
            type: String
        },
        simitPropietarioValor: {
            type: String
        },
        liquidacionDeudaFin: {
            type: String
        },
        liquidacionDeudaFinValor: {
            type: String
        },
        estadoTecnicoMecanica: {
            type: String
        },
        dateTecnicoMecanica: {
            type: String
        },
        manifiestoFactura: {
            type: String
        },
        estadoValorTotalSoat: {
            type: String
        },
        totalSoatValor: {
            type: String
        },
        fechaFinSoat: {
            type: String
        },
        estadoImpAnoEnCurso: {
            type: String
        },
        impAnoEnCursoValor: {
            type: String
        },
        estadoValorRetencion: {
            type: String
        },
        valorRetencionValor: {
            type: String
        },
    },
}, {
    timestamps: true
});

cotizacionCompraSchema.pre('save', async function (next) {
    if (this.isNew) {
        const nextSeq = await getNextSequence('cotizaciones');
        this.noCotizacionCompra = nextSeq;
        next();
    } else {
        next();
    }
});

module.exports = cotizacionCompraSchema;