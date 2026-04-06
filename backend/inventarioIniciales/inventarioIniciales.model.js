const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CounterSchema = new mongoose.Schema({
    _id: String,
    seq: {
        type: Number,
        default: 0
    }
});

const Counter = mongoose.model('ContadorIniciales', CounterSchema);

function getNextSequence(name) {
    return Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    ).then(result => result.seq);
}

const TramiteSchema = new mongoose.Schema({
    descripcion: {
        type: String
    },
    valor: {
        type: String
    }
});


const ProvisionTramiteSchema = new mongoose.Schema({
    descripcion2: {
        type: String
    },
    valor2: {
        type: String
    }
});

const TramiteVentasSchema = new mongoose.Schema({
    descripcion: {
        type: String
    },
    valor: {
        type: String
    }
});

const ProvisionTramiteVentasSchema = new mongoose.Schema({
    descripcion2: {
        type: String
    },
    valor2: {
        type: String
    }
});

const CampoExtraSchema = new mongoose.Schema({
    descripcionExtra: {
        type: String,
        required: false
    },
    campoExtra: {
        type: Number,
        required: false
    }
});

const infoExtraSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: false
    },
    campo: {
        type: String,
        required: false
    }
});

const CampoExtraSalidaSchema = new Schema({
    descripcionExtra: {
        type: String,
        required: false
    },
    campoExtra: {
        type: Number,
        required: false
    },
    asumeExtra: {
        type: Boolean,
        required: false
    },
    provExtra: {
        type: Boolean,
        required: false
    }
});

const inventoriesSchema = new Schema({
    inventoryId: Number,
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    },
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehiculos',
        required: true
    },
    comprador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Compradors'
    },
    compradorTwo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompradorDoss'
    },
    filtroBaseDatos: {
        organizacion: {
            type: String,
            required: false
        },
        tipoNegocio: {
            type: String,
            required: false
        },
        proveedor: {
            type: String,
            required: false
        },
        estadoInventario: {
            type: String,
            required: false
        },
        fechaIngreso: {
            type: Date,
            trim: true
        },
        ubicacion: {
            type: String,
            required: false
        },
        tallerProveedor: {
            type: String,
            required: false
        },
        fechaExpedicion: {
            type: Date,
            trim: true
        }
    },
    peritajeProveedor: {
        lugar: {
            type: String
        },
        estado: {
            type: String
        },
        numeroInspeccion: {
            type: String
        },
        linkInspeccion: {
            type: String
        },
        impronta: {
            type: String
        }
    },
    documentosTraspasos: {
        contratoVenta: {
            type: String
        },
        funt: {
            type: String
        },
        mandato: {
            type: String
        },
        copiaCedulaPropietario: {
            type: Boolean
        },
        copiaTarjetaPropietario: {
            type: Boolean
        },
        copiaSoat: {
            type: Boolean
        },
        fotosCedulaPropietario: [{
            type: String
        }],
        fotosTarjetaPropietario: [{
            type: String
        }],
        fotosSoat: [{
            type: String
        }],
        copiaTecnicoMecanica: {
            type: String
        },
        copiaGeneralAutenticado: {
            type: String
        },
    },
    link: {
        type: String,
        required: false
    },
    observacionGlobal: {
        type: String,
        default: ''
    },
    documentosValoresIniciales: {
        ciudadPlaca: {
            type: String
        },
        certificadoTradicion: {
            type: String
        },
        oficioDesembargo: {
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
            type: Date
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
            type: Date
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
        fotosCertificadoTradicion: [{
            type: String
        }],
        fotosEstadoCuentaImpuesto: [{
            type: String
        }],
        fotosSimitPropietario: [{
            type: String
        }],
        fotosLiquidacionDeudaFinanciera: [{
            type: String
        }],
        fotosTecnoMecanica: [{
            type: String
        }],
        fotosManifiestoFactura: [{
            type: String
        }],
        fotosSoatIniciales: [{
            type: String
        }],
        fotosImpuestoAno: [{
            type: String
        }],
        fotosOficioDesembargo: [{
            type: String
        }],
    },
    obsFase3: {
        type: String
    },
    controlAccesorios: {
        copiaLlave: {
            type: String
        },
        copiaLlaveObs: {
            type: String
        },
        gato: {
            type: String
        },
        gatoObs: {
            type: String
        },
        llavePernos: {
            type: String
        },
        llavePernosObs: {
            type: String
        },
        copaSeguridad: {
            type: String
        },
        copaSeguridadObs: {
            type: String
        },
        tiroArrastre: {
            type: String
        },
        tiroArrastreObs: {
            type: String
        },
        historialMantenimiento: {
            type: String
        },
        historialMantenimientoObs: {
            type: String
        },
        manual: {
            type: String
        },
        manualObs: {
            type: String
        },
        palomera: {
            type: String
        },
        palomeraObs: {
            type: String
        },
        tapetes: {
            type: String
        },
        tapetesObs: {
            type: String
        },
        ultimoKilometraje: {
            type: String
        },
        lugarUltimoMantenimiento: {
            type: String
        },
        fechaUltimoMantenimiento: {
            type: Date
        },
        llantaRepuesto: {
            type: String
        },
        llantaRepuestoObs: {
            type: String
        },
        kitCarretera: {
            type: String
        },
        kitCarreteraObs: {
            type: String
        },
        elementosPersonales: {
            type: String
        },
        elementosPersonalesObs: {
            type: String
        },
        antena: {
            type: String
        },
        antenaObs: {
            type: String
        },
        fotosCopiaLlave: [{
            type: String
        }],
        fotosGato: [{
            type: String
        }],
        fotosLlavePernos: [{
            type: String
        }],
        fotosCopaSeguridad: [{
            type: String
        }],
        fotosTiroArrastre: [{
            type: String
        }],
        fotosHistorialMantenimiento: [{
            type: String
        }],
        fotosManual: [{
            type: String
        }],
        fotosPalomera: [{
            type: String
        }],
        fotosTapetes: [{
            type: String
        }],
        fotosLlantaRepuesto: [{
            type: String
        }],
        fotosKitCarretera: [{
            type: String
        }],
        fotosElementosPersonales: [{
            type: String
        }],
        fotosAntena: [{
            type: String
        }],
        registroActividad: [{
            image: { type: String },
            descripcion: { type: String },
            fecha: { type: Date, default: Date.now }
        }],
    },
    ImagenesIngreso: {
        tresCuartosFrente: {
            type: String
        },
        tresCuartosFrenteObs: {
            type: String
        },
        frente: {
            type: String
        },
        frenteObs: {
            type: String
        },
        frenteCapoAbierto: {
            type: String
        },
        frenteCapoAbiertoObs: {
            type: String
        },
        motor: {
            type: String
        },
        motorObs: {
            type: String
        },
        lateralDerecho: {
            type: String
        },
        lateralDerechoObs: {
            type: String
        },
        trasera: {
            type: String
        },
        traseraObs: {
            type: String
        },
        traseraBaulAbierto: {
            type: String
        },
        traseraBaulAbiertoObs: {
            type: String
        },
        baul: {
            type: String
        },
        baulObs: {
            type: String
        },
        tresCuartosTrasera: {
            type: String
        },
        tresCuartosTraseraObs: {
            type: String
        },
        lateralIzquierdo: {
            type: String
        },
        lateralIzquierdoObs: {
            type: String
        },
        asientosTraseros: {
            type: String
        },
        asientosTraserosObs: {
            type: String
        },
        asientosDelanteros: {
            type: String
        },
        asientosDelanterosObs: {
            type: String
        },
        panelCompleto: {
            type: String
        },
        panelCompletoObs: {
            type: String
        },
        fotosTresCuartosFrente: [{
            type: String
        }],
        fotosFrente: [{
            type: String
        }],
        fotosFrenteCapoAbierto: [{
            type: String
        }],
        fotosMotor: [{
            type: String
        }],
        fotosLateralDerecho: [{
            type: String
        }],
        fotosTrasera: [{
            type: String
        }],
        fotosTraseraBaulAbierto: [{
            type: String
        }],
        fotosBaul: [{
            type: String
        }],
        fotosTresCuartosTrasera: [{
            type: String
        }],
        fotosLateralIzquierdo: [{
            type: String
        }],
        fotosAsientosTraseros: [{
            type: String
        }],
        fotosAsientosDelanteros: [{
            type: String
        }],
        fotosPanelCompleto: [{
            type: String
        }],
    },
    tramitesIngreso: {
        valorAutomagno: {
            type: Number,
            default: 0,
            required: false
        },
        valorContrato: {
            type: Number,
            default: 0,
            required: false
        },
        pagoFinanciera: {
            type: Number,
            default: 0
        },
        retefuenteT: {
            type: Number,
            default: 0,
            required: false
        },
        garantiaMobiliaria: {
            type: Number,
            default: 0,
            required: false
        },
        impuestos: {
            type: Number,
            default: 0,
            required: false
        },
        soat: {
            type: Number,
            default: 0,
            required: false
        },
        revTecnoMeca: {
            type: Number,
            default: 0,
            required: false
        },
        comparendos: {
            type: Number,
            default: 0,
            required: false
        },
        documentacion: {
            type: Number,
            default: 0,
            required: false
        },
        manifiestoFactura: {
            type: Number,
            default: 0,
            required: false
        },
        semaforizacion: {
            type: Number,
            default: 0,
            required: false
        },
        camposExtra: [CampoExtraSchema],
        total: {
            type: Number,
            default: 0
        },
        valorGirarCliente: {
            type: Number,
            default: 0
        }
    },
    tramitesSalidaAutonal: {
        traspaso: {
            type: Number,
            default: 0,
            required: false
        },
        checkTraspaso: {
            type: Boolean,
            default: false
        },
        provTraspaso: {
            type: Boolean,
            default: false
        },
        servicioFueraBogota: {
            type: Number,
            default: 0,
            required: false
        },
        checkServicioFueraBogota: {
            type: Boolean,
            default: false
        },
        provServicioFueraBogota: {
            type: Boolean,
            default: false
        },
        retefuenteS: {
            type: Number,
            default: 0,
            required: false
        },
        checkRetefuenteS: {
            type: Boolean,
            default: false
        },
        provRetefuenteS: {
            type: Boolean,
            default: false
        },
        levantaPrenda: {
            type: Number,
            default: 0,
            required: false
        },
        checkLevantaPrenda: {
            type: Boolean,
            default: false
        },
        provLevantaPrenda: {
            type: Boolean,
            default: false
        },
        garantiaMobiliaria: {
            type: Number,
            default: 0,
            required: false
        },
        checkGarantiaMobiliaria: {
            type: Boolean,
            default: false
        },
        provGarantiaMobiliaria: {
            type: Boolean,
            default: false
        },
        impuestos: {
            type: Number,
            default: 0,
            required: false
        },
        checkImpuestos: {
            type: Boolean,
            default: false
        },
        provImpuestos: {
            type: Boolean,
            default: false
        },
        liquidacionImpuesto: {
            type: Number,
            default: 0,
            required: false
        },
        checkLiquidacionImpuesto: {
            type: Boolean,
            default: false
        },
        provLiquidacionImpuesto: {
            type: Boolean,
            default: false
        },
        derechosMunicipales: {
            type: Number,
            default: 0,
            required: false
        },
        checkDerechosMunicipales: {
            type: Boolean,
            default: false
        },
        provDerechosMunicipales: {
            type: Boolean,
            default: false
        },
        soat: {
            type: Number,
            default: 0,
            required: false
        },
        checkSoat: {
            type: Boolean,
            default: false
        },
        provSoat: {
            type: Boolean,
            default: false
        },
        revTecnoMeca: {
            type: Number,
            default: 0,
            required: false
        },
        checkRevTecnoMeca: {
            type: Boolean,
            default: false
        },
        provRevTecnoMeca: {
            type: Boolean,
            default: false
        },
        comparendos: {
            type: Number,
            default: 0,
            required: false
        },
        checkComparendos: {
            type: Boolean,
            default: false
        },
        provComparendos: {
            type: Boolean,
            default: false
        },
        documentosIniciales: {
            type: Number,
            default: 0,
            required: false
        },
        checkDocumentosIniciales: {
            type: Boolean,
            default: false
        },
        provDocumentosIniciales: {
            type: Boolean,
            default: false
        },
        documentacion: {
            type: Number,
            default: 0,
            required: false
        },
        checkDocumentacion: {
            type: Boolean,
            default: false
        },
        provDocumentacion: {
            type: Boolean,
            default: false
        },
        manifiestoFactura: {
            type: Number,
            default: 0,
            required: false
        },
        checkManifiestoFactura: {
            type: Boolean,
            default: false
        },
        provManifiestoFactura: {
            type: Boolean,
            default: false
        },
        ctci: {
            type: Number,
            default: 0,
            required: false
        },
        checkCtci: {
            type: Boolean,
            default: false
        },
        provCtci: {
            type: Boolean,
            default: false
        },
        semaforizacion: {
            type: Number,
            default: 0,
            required: false
        },
        checkSemaforizacion: {
            type: Boolean,
            default: false
        },
        provSemaforizacion: {
            type: Boolean,
            default: false
        },
        impuestoAnoActual: {
            type: Number,
            default: 0,
            required: false
        },
        checkImpuestoAnoActual: {
            type: Boolean,
            default: false
        },
        provImpuestoAnoActual: {
            type: Boolean,
            default: false
        },
        camposExtrasSalida: [CampoExtraSalidaSchema],
        total: {
            type: Number,
            default: 0
        },
        comisionBruta: {
            type: Number,
            default: 0
        },
        comisionNeta: {
            type: Number,
            default: 0
        },
        valorNetoVehiculo: {
            type: Number,
            default: 0
        }
    },
    fichaNegocio: {
        tipoNegocioFicha: { type: String, required: false },
        valorOfertaFinal: { type: String, required: false },
        valorCreditoPrenda: { type: String, required: false },
        entidadCreditoPrenda: { type: String, required: false },
        valorAnticipoNegocio: { type: String, required: false },
        valorSugeridoVenta: { type: String, required: false },
        porcentajeComision: { type: String, required: false },
        vehiculoRetomaPlaca: { type: String, required: false },
        vehiculoRetomaMarca: { type: String, required: false },
        vehiculoRetomaInventario: { type: String, required: false },
        vehiculoRetomaModelo: { type: String, required: false },
        vehiculoRetomaLinea: { type: String, required: false },
        vehiculoRetomaValor: { type: String, required: false },
        observacionesFicha: { type: String, required: false }
    },
    deudaFinanciera: {
        entidadDeudaFinan: {
            type: String
        },
        numeroObligacionFinan: {
            type: String
        },
        fechaLimitePagoDeudaFinan: {
            type: Date
        }
    },
    otrosTramitesAccesorios: [TramiteSchema],
    otrosTramitesVendedor: [ProvisionTramiteSchema],
    otrosTramitesAccesoriosVentas: [TramiteVentasSchema],
    otrosTramitesVendedorVentas: [ProvisionTramiteVentasSchema],
    variablesLiquidacion: {
        cobraHonorarios: {
            type: Boolean,
            default: true
        },
        promedioImpuesto: {
            type: Boolean,
            default: true
        },
        promediaSoat: {
            type: Boolean,
            default: true
        }
    },
    variablesLiquidacionVentas: {
        traslado: {
            type: Boolean,
            default: false
        },
        ciudadTraslado: {
            type: String,
            default: ''
        },
        cobraHonorarios: {
            type: Boolean,
            default: true
        },
        promedioImpuesto: {
            type: Boolean,
            default: true
        },
        tieneCredito: {
            type: Boolean,
            default: false
        },
        promediaSoat: {
            type: Boolean,
            default: true
        },
        comparendosVariables: {
            type: Number,
            default: 0
        },
        tomaImprontasVariables: {
            type: Number,
            default: 0
        },
        entidadBancaria: {
            type: String,
            default: ''
        },
        monto: {
            type: Number,
            default: 0
        }

    },
    formaPagoCompra: {
        valorCompraLetras: {
            type: String,
            required: false
        },
        valorCompraNumero: {
            type: String,
            required: false
        },
        clausulaPenalLetras: {
            type: String,
            required: false
        },
        clausulaPenalNumeros: {
            type: String,
            required: false
        },
        fechaAsignacion: {
            type: Date
        },
        fechaEntrega: {
            type: Date
        }
    },
    formaPagoVenta: {
        valorVentaLetras: {
            type: String
        },
        valorVentaNumero: {
            type: Number
        },
        clausulaPenalLetras: {
            type: String
        },
        clausulaPenalNumeros: {
            type: Number
        },
        fechaEntrega: {
            type: Date,
            default: Date.now
        }
    },
    formadePago: {
        descripcionPago1: {
            type: String
        },
        formaPagoPago1: {
            type: String
        },
        entidadDepositarPago1: {
            type: String
        },
        numeroCuentaObligaPago1: {
            type: String
        },
        tipoCuentaPago1: {
            type: String
        },
        beneficiarioPago1: {
            type: String
        },
        idBeneficiarioPago1: {
            type: String
        },
        fechaPago1: {
            type: Date
        },
        valorPago1: {
            type: Number
        },
        descripcionPago2: {
            type: String
        },
        formaPagoPago2: {
            type: String
        },
        entidadDepositarPago2: {
            type: String
        },
        numeroCuentaObligaPago2: {
            type: String
        },
        tipoCuentaPago2: {
            type: String
        },
        beneficiarioPago2: {
            type: String
        },
        idBeneficiarioPago2: {
            type: String
        },
        fechaPago2: {
            type: Date
        },
        valorPago2: {
            type: Number
        },
        descripcionPago3: {
            type: String
        },
        formaPagoPago3: {
            type: String
        },
        entidadDepositarPago3: {
            type: String
        },
        numeroCuentaObligaPago3: {
            type: String
        },
        tipoCuentaPago3: {
            type: String
        },
        beneficiarioPago3: {
            type: String
        },
        idBeneficiarioPago3: {
            type: String
        },
        fechaPago3: {
            type: Date
        },
        valorPago3: {
            type: Number
        },
        descripcionPago4: {
            type: String
        },
        formaPagoPago4: {
            type: String
        },
        entidadDepositarPago4: {
            type: String
        },
        numeroCuentaObligaPago4: {
            type: String
        },
        tipoCuentaPago4: {
            type: String
        },
        beneficiarioPago4: {
            type: String
        },
        idBeneficiarioPago4: {
            type: String
        },
        fechaPago4: {
            type: Date
        },
        valorPago4: {
            type: Number
        }
    },
    formadePagoVenta2: {
        descripcionPago12: {
            type: String,
            default: ''
        },
        formaPagoPago12: {
            type: String,
            default: ''
        },
        entidadDepositarPago12: {
            type: String,
            default: ''
        },
        numeroCuentaObligaPago12: {
            type: String,
            default: ''
        },
        tipoCuentaPago12: {
            type: String,
            default: ''
        },
        beneficiarioPago12: {
            type: String,
            default: ''
        },
        idBeneficiarioPago12: {
            type: String,
            default: ''
        },
        fechaPago12: {
            type: Date,
            default: Date.now
        },
        valorPago12: {
            type: Number,
            default: 0
        },
        descripcionPago22: {
            type: String,
            default: ''
        },
        formaPagoPago22: {
            type: String,
            default: ''
        },
        entidadDepositarPago22: {
            type: String,
            default: ''
        },
        numeroCuentaObligaPago22: {
            type: String,
            default: ''
        },
        tipoCuentaPago22: {
            type: String,
            default: ''
        },
        beneficiarioPago22: {
            type: String,
            default: ''
        },
        idBeneficiarioPago22: {
            type: String,
            default: ''
        },
        fechaPago22: {
            type: Date,
            default: Date.now
        },
        valorPago22: {
            type: Number,
            default: 0
        },
        descripcionPago32: {
            type: String,
            default: ''
        },
        formaPagoPago32: {
            type: String,
            default: ''
        },
        entidadDepositarPago32: {
            type: String,
            default: ''
        },
        numeroCuentaObligaPago32: {
            type: String,
            default: ''
        },
        tipoCuentaPago32: {
            type: String,
            default: ''
        },
        beneficiarioPago32: {
            type: String,
            default: ''
        },
        idBeneficiarioPago32: {
            type: String,
            default: ''
        },
        fechaPago32: {
            type: Date,
            default: Date.now
        },
        valorPago32: {
            type: Number,
            default: 0
        },
        descripcionPago42: {
            type: String,
            default: ''
        },
        formaPagoPago42: {
            type: String,
            default: ''
        },
        entidadDepositarPago42: {
            type: String,
            default: ''
        },
        numeroCuentaObligaPago42: {
            type: String,
            default: ''
        },
        tipoCuentaPago42: {
            type: String,
            default: ''
        },
        beneficiarioPago42: {
            type: String,
            default: ''
        },
        idBeneficiarioPago42: {
            type: String,
            default: ''
        },
        fechaPago42: {
            type: Date,
            default: Date.now
        },
        valorPago42: {
            type: Number,
            default: 0
        }
    },
    cruceDocumental: {
        esCruce: {
            type: Boolean,
            default: false
        },
        numInventario: {
            type: String,
            default: ''
        },
        placa: {
            type: String,
            default: ''
        },
        ciudad: {
            type: String,
            default: ''
        },
        traspaso: {
            type: String,
            default: ''
        },
        retencion: {
            type: String,
            default: ''
        },
        otrosImpuestos: {
            type: String,
            default: ''
        },
        levantamientoPrenda: {
            type: String,
            default: ''
        },
        comparendos: {
            type: String,
            default: ''
        },
        propImpAnoEnCurso: {
            type: String,
            default: ''
        },
        devolucionSoat: {
            type: String,
            default: ''
        },
        totalRetoma: {
            type: String,
            default: ''
        },
        totalVentaRetoma: {
            type: String,
            default: ''
        },
        placaActual: {
            type: String,
            default: ''
        },
        ciudadActual: {
            type: String,
            default: ''
        },
        traspasoActual: {
            type: String,
            default: ''
        },
        inscripcionPrendaActual: {
            type: String,
            default: ''
        },
        trasladoCuentaActual: {
            type: String,
            default: ''
        },
        radicacionCuentaActual: {
            type: String,
            default: ''
        },
        comparendosComprador: {
            type: String,
            default: ''
        },
        propImpAnoEnCursoActual: {
            type: String,
            default: ''
        },
        propSoat: {
            type: String,
            default: ''
        },
        honorariosIvaIncluido: {
            type: String,
            default: ''
        },
        totalDocumentacionActual: {
            type: String,
            default: ''
        },
    },
    liquidaciones: {
        traspaso: {
            type: String
        },
        retencion: {
            type: String
        },
        otrosImpuestos: {
            type: String
        },
        levantamientoPrenda: {
            type: String
        },
        comparendos: {
            type: String
        },
        proporcionalImpAnoCurso: {
            type: String
        },
        devolucionSoat: {
            type: String
        },
        honorariosAutomagno: {
            type: String
        },
        retencionFuente: {
            type: String
        },
        traspasoNeto: {
            type: String
        },
        soat: {
            type: String
        },
        impuestoAnoCurso: {
            type: String
        },
        otrosImpuestosProv: {
            type: String
        },
        levantamientoPrenda2: {
            type: String
        },
        comparendos2: {
            type: String
        },
        deudaFinanciera: {
            type: String
        },
        tomaImprontas: {
            type: String
        },
        honorariosTramitador: {
            type: String
        },
        totalDocumentacion: {
            type: String
        },
        totalProvision: {
            type: String
        }
    },
    liquidacionesVenta: {
        traspaso: {
            type: String
        },
        inscripcionPrenda: {
            type: String
        },
        comparendos: {
            type: String
        },
        proporcionalImpAnoCurso: {
            type: String
        },
        devolucionSoat: {
            type: String
        },
        honorariosIvaIncluido: {
            type: String
        },
        retencionFuente: {
            type: String
        },
        traspasoNeto: {
            type: String
        },
        soat: {
            type: String
        },
        impuestoAnoCurso: {
            type: String
        },
        inscripcionPrenda2: {
            type: String
        },
        comparendos2: {
            type: String
        },
        tomaImprontas: {
            type: String
        },
        manejoEnvioAutomango: {
            type: String
        },
        honorariosTramitador: {
            type: String
        },
        totalDocumentacion: {
            type: String
        },
        totalProvision: {
            type: String
        },
        trasladoCuenta: {
            type: String
        },
        radicacionCuenta: {
            type: String
        }
    },
    generadorContratos: {
        asesorComercial: {
            type: String
        },
        telefonoAsesor: {
            type: String
        },
        correoAsesor: {
            type: String
        },
        gestorDocumental: {
            type: String
        },
        telefonoGestor: {
            type: String
        },
        correoGestor: {
            type: String
        },
        kilometraje: {
            type: String
        },
        horaRecepciom: {
            type: String
        },
        fechaTecnicoMecanica: {
            type: Date
        },
        observacionesContrato: {
            type: String
        },
    },
    generadorContratosVentas: {
        asesorComercial: {
            type: String
        },
        telefonoAsesor: {
            type: String
        },
        correoAsesor: {
            type: String
        },
        gestorDocumental: {
            type: String
        },
        telefonoGestor: {
            type: String
        },
        correoGestor: {
            type: String
        },
        kilometraje: {
            type: String
        },
        horaRecepciom: {
            type: String
        },
        fechaTecnicoMecanica: {
            type: Date
        },
        empresa: {
            type: String,
            default: ''
        },
        numeroInspeccion: {
            type: String,
            default: ''
        }
    },
    infoExtra: [infoExtraSchema]
}, {
    timestamps: true
});

inventoriesSchema.pre('save', async function (next) {
    if (this.isNew) {
        const nextSeq = await getNextSequence('inventariosIniciales');
        this.inventoryId = nextSeq;
        next();
    } else {
        next();
    }
});

module.exports = inventoriesSchema;