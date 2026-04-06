require('dotenv').config({ path: 'config.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_MONGO).then(async () => {
  const col = mongoose.connection.db.collection('inventarios');
  const all = await col.find({}).toArray();
  const fechaPorDefecto = new Date('1970-01-01T00:00:00.000+00:00').getTime();
  const hoy = new Date();
  const DIAS = 5;
  let iniciales = {}, venta = {}, total = 0;

  function add(bucket, key) { bucket[key] = (bucket[key] || 0) + 1; }

  all.forEach(inv => {
    const estado = inv.filtroBaseDatos && inv.filtroBaseDatos.estadoInventario;
    if (!estado || ['VENDIDO','TERMINADO','DECLINADO'].includes(estado)) return;
    if (!inv.vehiculo) return;

    const dvi = inv.documentosValoresIniciales || {};
    const dt = inv.documentosTraspasos || {};
    const pp = inv.peritajeProveedor || {};
    const esIni = estado === 'ASIGNADO EN INICIALES';
    const esVenta = estado === 'DISPONIBLE A LA VENTA' || estado === 'SEPARADO DISPONIBLE A LA VENTA';

    if (esIni) {
      if (dvi.estadoCuentaImpuesto === 'REVISADO CON DEUDA') add(iniciales, 'impuesto_deuda');
      if (dvi.simitPropietario === 'PAGAR MULTAS') add(iniciales, 'simit_multas');
      if (dvi.estadoValorRetencion === 'POR LIQUIDAR') add(iniciales, 'retencion');
      if (['PARA PAGO','LIQUIDAR','PROVISIONAL'].includes(dvi.estadoImpAnoEnCurso)) add(iniciales, 'imp_ano');
      if (['VENCIDO COMPRAR','PROVISIONAL'].includes(dvi.estadoValorTotalSoat)) add(iniciales, 'soat');
      if (dvi.manifiestoFactura && dvi.manifiestoFactura !== 'DISPONIBLE EN CARPETA') add(iniciales, 'manifiesto');
      if (dvi.oficioDesembargo === 'NO') add(iniciales, 'desembargo');
      if (pp.impronta === 'INCOMPLETO') add(iniciales, 'impronta');
      if (pp.estado === 'NO ASEGURABLE' || pp.estado === 'POR SOLICITAR') add(iniciales, 'peritaje');
    }

    if (esVenta) {
      // vencimientos
      if (dvi.fechaFinSoat) {
        const d = new Date(dvi.fechaFinSoat);
        if (d.getTime() !== fechaPorDefecto && Math.round((d-hoy)/86400000) <= DIAS) add(venta, 'soat_vencimiento');
      }
      if (dvi.estadoTecnicoMecanica === 'VIGENTE' && dvi.dateTecnicoMecanica) {
        const d = new Date(dvi.dateTecnicoMecanica);
        if (d.getTime() !== fechaPorDefecto && Math.round((d-hoy)/86400000) <= DIAS) add(venta, 'tecnico_vencimiento');
      }
      if (dt.contratoVenta && dt.contratoVenta !== 'FIRMADO EN CARPETA' && dt.contratoVenta !== 'A NOMBRE DE AUTOMAGNO') add(venta, 'contrato');
      if (dt.funt && dt.funt !== 'FIRMADO EN CARPETA' && dt.funt !== 'A NOMBRE DE AUTOMAGNO') add(venta, 'funt');
      if (dt.mandato && dt.mandato !== 'FIRMADO EN CARPETA' && dt.mandato !== 'A NOMBRE DE AUTOMAGNO' && inv.filtroBaseDatos.proveedor !== 'AUTONAL') add(venta, 'mandato');
      if (dvi.estadoValorTotalSoat === 'VENCIDO COMPRAR') add(venta, 'soat_vencido');
      if (inv.deudaFinanciera && inv.deudaFinanciera.fechaLimitePagoDeudaFinan) {
        const d = new Date(inv.deudaFinanciera.fechaLimitePagoDeudaFinan);
        if (d.getTime() !== fechaPorDefecto && Math.round((d-hoy)/86400000) <= 15) add(venta, 'deuda');
      }
    }
  });

  console.log("=== [INICIALES] 22 carros ===");
  let subI = 0;
  Object.entries(iniciales).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => { console.log("  "+v+"x "+k); subI+=v; });
  console.log("  Subtotal:", subI);

  console.log("\n=== [VENTA] 32 carros ===");
  let subV = 0;
  Object.entries(venta).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => { console.log("  "+v+"x "+k); subV+=v; });
  console.log("  Subtotal:", subV);

  console.log("\n=== TOTAL: " + (subI+subV) + " (antes: 578) ===");
  mongoose.disconnect();
});
