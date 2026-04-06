require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_MONGO).then(async () => {
  const col = mongoose.connection.db.collection('inventarios');
  const all = await col.find({}).toArray();

  const fechaPorDefecto = new Date('1970-01-01T00:00:00.000+00:00').getTime();
  const hoy = new Date();
  const DIAS = 5;
  let counts = {};
  let totalActive = 0;

  function add(key) { counts[key] = (counts[key] || 0) + 1; }

  all.forEach(inv => {
    const estado = inv.filtroBaseDatos && inv.filtroBaseDatos.estadoInventario;
    if (estado === 'VENDIDO' || estado === 'TERMINADO' || estado === 'DECLINADO') return;
    totalActive++;

    const dvi = inv.documentosValoresIniciales || {};
    const dt = inv.documentosTraspasos || {};
    const ca = inv.controlAccesorios || {};
    const pp = inv.peritajeProveedor || {};
    const fb = inv.filtroBaseDatos || {};

    // Maintenance date missing
    if (ca.fechaUltimoMantenimiento && new Date(ca.fechaUltimoMantenimiento).getTime() === fechaPorDefecto) add('mantenimiento_faltante');

    // Impronta incompleta
    if (pp.impronta === 'INCOMPLETO') add('impronta_incompleta');

    // Estado cuenta impuesto
    if (dvi.estadoCuentaImpuesto === 'REVISADO CON DEUDA') add('impuesto_deuda');
    if (dvi.estadoCuentaImpuesto === null || dvi.estadoCuentaImpuesto === undefined) add('impuesto_null');

    // Fecha entrega
    if (inv.formaPagoCompra && inv.formaPagoCompra.fechaEntrega === null) add('fecha_entrega_null');

    // SIMIT
    if (dvi.simitPropietario === 'PAGAR MULTAS') add('simit_multas');
    if (dvi.simitPropietario === null || dvi.simitPropietario === undefined) add('simit_null');

    // Manifiesto factura
    if (dvi.manifiestoFactura !== 'DISPONIBLE EN CARPETA' && dvi.manifiestoFactura !== null && dvi.manifiestoFactura !== undefined) add('manifiesto_pendiente');
    if (dvi.manifiestoFactura === null || dvi.manifiestoFactura === undefined) add('manifiesto_null');

    // SOAT estado
    if (dvi.estadoValorTotalSoat === null || dvi.estadoValorTotalSoat === undefined) add('soat_null');
    if (dvi.estadoValorTotalSoat === 'VENCIDO COMPRAR' || dvi.estadoValorTotalSoat === 'PROVISIONAL') add('soat_vencido');

    // Oficio desembargo
    if (dvi.oficioDesembargo === 'NO') add('desembargo_no');
    if (dvi.oficioDesembargo === null || dvi.oficioDesembargo === undefined) add('desembargo_null');

    // Impuesto año en curso
    if (dvi.estadoImpAnoEnCurso === null || dvi.estadoImpAnoEnCurso === undefined) add('imp_ano_null');
    if (dvi.estadoImpAnoEnCurso === 'PARA PAGO' || dvi.estadoImpAnoEnCurso === 'LIQUIDAR' || dvi.estadoImpAnoEnCurso === 'PROVISIONAL') add('imp_ano_pendiente');

    // Peritaje
    if (pp.estado === 'NO ASEGURABLE' || pp.estado === 'POR SOLICITAR') add('peritaje_pendiente');

    // Retencion
    if (dvi.estadoValorRetencion === 'POR LIQUIDAR') add('retencion_liquidar');
    if (dvi.estadoValorRetencion === null || dvi.estadoValorRetencion === undefined) add('retencion_null');

    // Cedula propietario
    if (dt.copiaCedulaPropietario === false || (dt.fotosCedulaPropietario && dt.fotosCedulaPropietario.length === 0)) add('cedula_faltante');

    // Tarjeta propietario
    if (dt.copiaTarjetaPropietario === false || (dt.fotosTarjetaPropietario && dt.fotosTarjetaPropietario.length === 0)) add('tarjeta_faltante');

    // SOAT copia
    if (dt.copiaSoat === false || (dt.fotosSoat && dt.fotosSoat.length === 0)) add('soat_copia_faltante');

    // Contrato venta
    if (dt.contratoVenta && dt.contratoVenta !== 'FIRMADO EN CARPETA' && dt.contratoVenta !== 'A NOMBRE DE AUTOMAGNO') add('contrato_pendiente');

    // FUNT
    if (dt.funt && dt.funt !== 'FIRMADO EN CARPETA' && dt.funt !== 'A NOMBRE DE AUTOMAGNO') add('funt_pendiente');

    // Mandato
    if (dt.mandato && dt.mandato !== 'FIRMADO EN CARPETA' && dt.mandato !== 'A NOMBRE DE AUTOMAGNO' && fb.proveedor !== 'AUTONAL') add('mandato_pendiente');

    // Link archivo digital
    if (!inv.link || (typeof inv.link === 'string' && inv.link.trim() === '')) add('link_faltante');

    // verificarYNotificar: SOAT fecha
    if (dvi.fechaFinSoat) {
      const d = new Date(dvi.fechaFinSoat);
      if (d.getTime() !== fechaPorDefecto) {
        const dias = Math.round((d - hoy) / 86400000);
        if (dias <= DIAS) add('soat_vencimiento_fecha');
      }
    }

    // Deuda financiera fecha
    if (inv.deudaFinanciera && inv.deudaFinanciera.fechaLimitePagoDeudaFinan) {
      const d = new Date(inv.deudaFinanciera.fechaLimitePagoDeudaFinan);
      if (d.getTime() !== fechaPorDefecto) {
        const dias = Math.round((d - hoy) / 86400000);
        if (dias <= DIAS) add('deuda_vencimiento');
      }
    }

    // Tecnico mecanica
    if (dvi.estadoTecnicoMecanica === 'VIGENTE' && dvi.dateTecnicoMecanica) {
      const d = new Date(dvi.dateTecnicoMecanica);
      if (d.getTime() !== fechaPorDefecto) {
        const dias = Math.round((d - hoy) / 86400000);
        if (dias <= DIAS) add('tecnico_vencimiento');
      }
    }

    // Asignado en iniciales > 5 dias
    if (estado === 'ASIGNADO EN INICIALES') {
      const dias = Math.round((hoy - new Date(inv.createdAt)) / 86400000);
      if (dias >= DIAS) add('asignado_prolongado');
    }
  });

  let total = 0;
  console.log("Inventarios activos:", totalActive);
  console.log("\n=== DESGLOSE NOTIFICACIONES ===");
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([k, v]) => {
    console.log("  " + v + "x " + k);
    total += v;
  });
  console.log("\nTOTAL NOTIFICACIONES:", total);

  mongoose.disconnect();
});
