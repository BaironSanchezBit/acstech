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
  const estadosExcluidos = ['VENDIDO', 'TERMINADO', 'DECLINADO'];
  const estadosIniciales = ['ASIGNADO EN INICIALES', 'INGRESADO'];

  function add(key) { counts[key] = (counts[key] || 0) + 1; }

  all.forEach(inv => {
    const estado = inv.filtroBaseDatos && inv.filtroBaseDatos.estadoInventario;
    if (estadosExcluidos.includes(estado)) return;
    totalActive++;

    const dvi = inv.documentosValoresIniciales || {};
    const dt = inv.documentosTraspasos || {};
    const pp = inv.peritajeProveedor || {};
    const esInicial = estadosIniciales.includes(estado);

    // Impronta
    if (pp.impronta === 'INCOMPLETO') add('impronta_incompleta');
    // Impuesto deuda
    if (dvi.estadoCuentaImpuesto === 'REVISADO CON DEUDA') add('impuesto_deuda');
    // SIMIT multas
    if (dvi.simitPropietario === 'PAGAR MULTAS') add('simit_multas');
    // SOAT vencido
    if (dvi.estadoValorTotalSoat === 'VENCIDO COMPRAR' || dvi.estadoValorTotalSoat === 'PROVISIONAL') add('soat_vencido');
    // Imp año pendiente
    if (dvi.estadoImpAnoEnCurso === 'PARA PAGO' || dvi.estadoImpAnoEnCurso === 'LIQUIDAR' || dvi.estadoImpAnoEnCurso === 'PROVISIONAL') add('imp_ano_pendiente');
    // Desembargo NO
    if (dvi.oficioDesembargo === 'NO') add('desembargo_no');
    // Retencion liquidar
    if (dvi.estadoValorRetencion === 'POR LIQUIDAR') add('retencion_liquidar');
    // Peritaje
    if (pp.estado === 'NO ASEGURABLE' || pp.estado === 'POR SOLICITAR') add('peritaje_pendiente');
    // Manifiesto (no null, no disponible)
    if (dvi.manifiestoFactura && dvi.manifiestoFactura !== 'DISPONIBLE EN CARPETA') add('manifiesto_pendiente');

    // Documentos traspaso solo avanzados
    if (!esInicial) {
      if (dt.contratoVenta && dt.contratoVenta !== 'FIRMADO EN CARPETA' && dt.contratoVenta !== 'A NOMBRE DE AUTOMAGNO') add('contrato_pendiente');
      if (dt.funt && dt.funt !== 'FIRMADO EN CARPETA' && dt.funt !== 'A NOMBRE DE AUTOMAGNO') add('funt_pendiente');
      if (dt.mandato && dt.mandato !== 'FIRMADO EN CARPETA' && dt.mandato !== 'A NOMBRE DE AUTOMAGNO' && inv.filtroBaseDatos.proveedor !== 'AUTONAL') add('mandato_pendiente');
    }

    // Vencimientos
    if (dvi.fechaFinSoat) {
      const d = new Date(dvi.fechaFinSoat);
      if (d.getTime() !== fechaPorDefecto) {
        const dias = Math.round((d - hoy) / 86400000);
        if (dias <= DIAS) add('soat_vencimiento_fecha');
      }
    }
    if (inv.deudaFinanciera && inv.deudaFinanciera.fechaLimitePagoDeudaFinan) {
      const d = new Date(inv.deudaFinanciera.fechaLimitePagoDeudaFinan);
      if (d.getTime() !== fechaPorDefecto) {
        const dias = Math.round((d - hoy) / 86400000);
        if (dias <= DIAS) add('deuda_vencimiento');
      }
    }
    if (dvi.estadoTecnicoMecanica === 'VIGENTE' && dvi.dateTecnicoMecanica) {
      const d = new Date(dvi.dateTecnicoMecanica);
      if (d.getTime() !== fechaPorDefecto) {
        const dias = Math.round((d - hoy) / 86400000);
        if (dias <= DIAS) add('tecnico_vencimiento');
      }
    }
    // Asignado prolongado
    if (estado === 'ASIGNADO EN INICIALES') {
      const dias = Math.round((hoy - new Date(inv.createdAt)) / 86400000);
      if (dias >= DIAS) add('asignado_prolongado');
    }
  });

  let total = 0;
  console.log("Inventarios activos:", totalActive);
  console.log("\n=== NOTIFICACIONES v2 (limpias) ===");
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([k, v]) => {
    console.log("  " + v + "x " + k);
    total += v;
  });
  console.log("\nTOTAL: " + total + " (antes: ~578)");

  mongoose.disconnect();
});
