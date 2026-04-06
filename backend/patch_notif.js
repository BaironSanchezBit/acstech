const fs = require("fs");
const path = "/app/inventarios/inventarios.controller.js";
let c = fs.readFileSync(path, "utf8");

// Backup
fs.copyFileSync(path, path + ".bak.notif.20260325");

// Find the old checkExpirations function and replace it
const oldStart = "exports.checkExpirations = async (socket) => {";
const oldEnd = `                if (inventory.filtroBaseDatos && inventory.filtroBaseDatos.ubicacion === 'TALLER') {
                    socket.emit('tallerNotice', {
                        title: 'Vehículo en Taller',
                        message: \`El vehículo \${inventory.vehiculo.marca} con placa \${inventory.vehiculo.placa} se encuentra en el taller: \${inventory.filtroBaseDatos.tallerProveedor}.\`,
                        vehiculoId: inventory.vehiculo.marca + ' ' + inventory.vehiculo.linea + ' ' + inventory.vehiculo.version + ': ' + inventory.vehiculo.placa
                    });
                }
            }
        });
    } catch (error) {
        console.error(error);
        socket.emit('errorCheckingExpiration', { error: 'Error al verificar las fechas de vencimiento' });
    }
};`;

const startIdx = c.indexOf(oldStart);
const endIdx = c.indexOf(oldEnd);
if (startIdx === -1 || endIdx === -1) {
  console.log("ERROR: No encontré la función checkExpirations");
  console.log("startIdx:", startIdx, "endIdx:", endIdx);
  process.exit(1);
}

const before = c.substring(0, startIdx);
const after = c.substring(endIdx + oldEnd.length);

const newFunction = `exports.checkExpirations = async (socket) => {
    // v2 - Limpiado 2026-03-25: Solo notificaciones accionables (no campos vacios/null)
    try {
        const inventories = await Inventories.find({}).populate('vehiculo');
        const estadosExcluidos = ['VENDIDO', 'TERMINADO', 'DECLINADO'];
        // Estados donde aun no se esperan documentos completos
        const estadosIniciales = ['ASIGNADO EN INICIALES', 'INGRESADO'];

        inventories.forEach(inventory => {
            const estado = inventory.filtroBaseDatos.estadoInventario;
            if (estadosExcluidos.includes(estado)) return;
            if (!inventory.vehiculo) return;

            const veh = inventory.vehiculo;
            const vehiculoId = veh.marca + ' ' + veh.linea + ' ' + veh.version + ': ' + veh.placa;
            const dvi = inventory.documentosValoresIniciales || {};
            const dt = inventory.documentosTraspasos || {};
            const esInicial = estadosIniciales.includes(estado);

            // === VENCIMIENTOS REALES (siempre notificar) ===
            verificarYNotificar(inventory, socket);

            // === PROBLEMAS ACTIVOS (estados problemáticos, no nulls) ===

            // Impronta incompleta
            if (inventory.peritajeProveedor && inventory.peritajeProveedor.impronta === 'INCOMPLETO') {
                socket.emit('expirationNotice', {
                    title: 'Impronta Incompleta',
                    message: \`La impronta del vehículo \${veh.marca} con placa \${veh.placa} está incompleta.\`,
                    vehiculoId
                });
            }

            // Impuestos con deuda
            if (dvi.estadoCuentaImpuesto === 'REVISADO CON DEUDA') {
                socket.emit('expirationNotice', {
                    title: \`Estado de cuenta impuestos \${dvi.estadoCuentaImpuesto}\`,
                    message: \`El estado de cuenta impuestos del vehículo \${veh.marca} con placa \${veh.placa} está \${dvi.estadoCuentaImpuesto}.\`,
                    vehiculoId
                });
            }

            // SIMIT con multas
            if (dvi.simitPropietario === 'PAGAR MULTAS') {
                socket.emit('expirationNotice', {
                    title: \`SIMIT Propietario \${dvi.simitPropietario}\`,
                    message: \`El SIMIT Propietario del vehículo \${veh.marca} con placa \${veh.placa} está \${dvi.simitPropietario}.\`,
                    vehiculoId
                });
            }

            // SOAT vencido o provisional
            if (dvi.estadoValorTotalSoat === 'VENCIDO COMPRAR' || dvi.estadoValorTotalSoat === 'PROVISIONAL') {
                socket.emit('expirationNotice', {
                    title: \`SOAT \${dvi.estadoValorTotalSoat}\`,
                    message: \`El SOAT del vehículo \${veh.marca} con placa \${veh.placa} está \${dvi.estadoValorTotalSoat}.\`,
                    vehiculoId
                });
            }

            // Impuesto año en curso pendiente
            if (dvi.estadoImpAnoEnCurso === 'PARA PAGO' || dvi.estadoImpAnoEnCurso === 'LIQUIDAR' || dvi.estadoImpAnoEnCurso === 'PROVISIONAL') {
                socket.emit('expirationNotice', {
                    title: \`Impuesto año en curso \${dvi.estadoImpAnoEnCurso}\`,
                    message: \`El Impuesto año en curso del vehículo \${veh.marca} con placa \${veh.placa} está \${dvi.estadoImpAnoEnCurso}.\`,
                    vehiculoId
                });
            }

            // Oficio de desembargo faltante (solo si explícitamente NO)
            if (dvi.oficioDesembargo === 'NO') {
                socket.emit('expirationNotice', {
                    title: 'Oficio de Desembargo',
                    message: \`El Oficio de Desembargo del vehículo \${veh.marca} con placa \${veh.placa} NO se encuentra en carpeta.\`,
                    vehiculoId
                });
            }

            // Retención por liquidar
            if (dvi.estadoValorRetencion === 'POR LIQUIDAR') {
                socket.emit('expirationNotice', {
                    title: \`Retención \${dvi.estadoValorRetencion}\`,
                    message: \`La Retención del vehículo \${veh.marca} con placa \${veh.placa} está \${dvi.estadoValorRetencion}.\`,
                    vehiculoId
                });
            }

            // Peritaje no asegurable o por solicitar
            if (inventory.peritajeProveedor && (inventory.peritajeProveedor.estado === 'NO ASEGURABLE' || inventory.peritajeProveedor.estado === 'POR SOLICITAR')) {
                socket.emit('expirationNotice', {
                    title: \`Peritaje \${inventory.peritajeProveedor.estado}\`,
                    message: \`El Peritaje del vehículo \${veh.marca} con placa \${veh.placa} es \${inventory.peritajeProveedor.estado}.\`,
                    vehiculoId
                });
            }

            // Manifiesto/Factura con problema (no null, no disponible)
            if (dvi.manifiestoFactura && dvi.manifiestoFactura !== 'DISPONIBLE EN CARPETA') {
                socket.emit('expirationNotice', {
                    title: \`Manifiesto y Factura \${dvi.manifiestoFactura}\`,
                    message: \`El Manifiesto y factura del vehículo \${veh.marca} con placa \${veh.placa} está \${dvi.manifiestoFactura}.\`,
                    vehiculoId
                });
            }

            // === DOCUMENTOS DE TRASPASO (solo para carros en estados avanzados) ===
            if (!esInicial) {
                if (dt.contratoVenta && dt.contratoVenta !== 'FIRMADO EN CARPETA' && dt.contratoVenta !== 'A NOMBRE DE AUTOMAGNO') {
                    socket.emit('expirationNotice', {
                        title: \`Contrato de Venta \${dt.contratoVenta}\`,
                        message: \`El Contrato de Venta del vehículo \${veh.marca} con placa \${veh.placa} está \${dt.contratoVenta}.\`,
                        vehiculoId
                    });
                }
                if (dt.funt && dt.funt !== 'FIRMADO EN CARPETA' && dt.funt !== 'A NOMBRE DE AUTOMAGNO') {
                    socket.emit('expirationNotice', {
                        title: \`FUNT \${dt.funt}\`,
                        message: \`El FUNT del vehículo \${veh.marca} con placa \${veh.placa} está \${dt.funt}.\`,
                        vehiculoId
                    });
                }
                if (dt.mandato && dt.mandato !== 'FIRMADO EN CARPETA' && dt.mandato !== 'A NOMBRE DE AUTOMAGNO') {
                    if (inventory.filtroBaseDatos.proveedor !== "AUTONAL") {
                        socket.emit('expirationNotice', {
                            title: \`Mandato \${dt.mandato}\`,
                            message: \`El Mandato del vehículo \${veh.marca} con placa \${veh.placa} está \${dt.mandato}.\`,
                            vehiculoId
                        });
                    }
                }
            }

            // Vehículo en taller
            if (inventory.filtroBaseDatos && inventory.filtroBaseDatos.ubicacion === 'TALLER') {
                socket.emit('tallerNotice', {
                    title: 'Vehículo en Taller',
                    message: \`El vehículo \${veh.marca} con placa \${veh.placa} se encuentra en el taller: \${inventory.filtroBaseDatos.tallerProveedor}.\`,
                    vehiculoId
                });
            }
        });
    } catch (error) {
        console.error(error);
        socket.emit('errorCheckingExpiration', { error: 'Error al verificar las fechas de vencimiento' });
    }
};`;

c = before + newFunction + after;
fs.writeFileSync(path, c);
console.log("OK: checkExpirations limpiado");
console.log("Eliminados: chequeos null, copias documentos faltantes, link, mantenimiento, fecha entrega");
console.log("Mantenidos: vencimientos, deudas, multas, SOAT, peritaje, impronta, taller, documentos traspaso (solo avanzados)");
