const fs = require("fs");
const path = "/app/inventarios/inventarios.controller.js";
let c = fs.readFileSync(path, "utf8");

const old = `exports.checkExpirations = async (socket) => {
    // v2 - Limpiado 2026-03-25: Solo notificaciones accionables (no campos vacios/null)
    try {
        // Solo notificar inventarios creados desde 2026-03-25 en adelante
        const fechaCorte = new Date('2026-03-25T00:00:00.000Z');
        const inventories = await Inventories.find({ createdAt: { $gte: fechaCorte } }).populate('vehiculo');
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

const fix = `exports.checkExpirations = async (socket) => {
    // v3 - 2026-03-25: Notificaciones por estado de inventario
    try {
        const inventories = await Inventories.find({}).populate('vehiculo');
        const estadosExcluidos = ['VENDIDO', 'TERMINADO', 'DECLINADO'];

        inventories.forEach(inventory => {
            const estado = inventory.filtroBaseDatos.estadoInventario;
            if (!estado || estadosExcluidos.includes(estado)) return;
            if (!inventory.vehiculo) return;

            const veh = inventory.vehiculo;
            const vehiculoId = veh.marca + ' ' + veh.linea + ' ' + veh.version + ': ' + veh.placa;
            const dvi = inventory.documentosValoresIniciales || {};
            const dt = inventory.documentosTraspasos || {};
            const esIniciales = (estado === 'ASIGNADO EN INICIALES');
            const esVenta = (estado === 'DISPONIBLE A LA VENTA' || estado === 'SEPARADO DISPONIBLE A LA VENTA');

            // =============================================
            // ASIGNADO EN INICIALES: pendientes documentación
            // =============================================
            if (esIniciales) {
                // Impuestos con deuda
                if (dvi.estadoCuentaImpuesto === 'REVISADO CON DEUDA') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Impuestos con deuda',
                        message: \`\${veh.marca} \${veh.placa}: Estado de cuenta impuestos \${dvi.estadoCuentaImpuesto}.\`,
                        vehiculoId
                    });
                }

                // SIMIT con multas
                if (dvi.simitPropietario === 'PAGAR MULTAS') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] SIMIT con multas',
                        message: \`\${veh.marca} \${veh.placa}: SIMIT Propietario \${dvi.simitPropietario}.\`,
                        vehiculoId
                    });
                }

                // Retención por liquidar
                if (dvi.estadoValorRetencion === 'POR LIQUIDAR') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Retención pendiente',
                        message: \`\${veh.marca} \${veh.placa}: Retención \${dvi.estadoValorRetencion}.\`,
                        vehiculoId
                    });
                }

                // Impuesto año en curso
                if (dvi.estadoImpAnoEnCurso === 'PARA PAGO' || dvi.estadoImpAnoEnCurso === 'LIQUIDAR' || dvi.estadoImpAnoEnCurso === 'PROVISIONAL') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Impuesto año en curso',
                        message: \`\${veh.marca} \${veh.placa}: Impuesto año en curso \${dvi.estadoImpAnoEnCurso}.\`,
                        vehiculoId
                    });
                }

                // SOAT vencido
                if (dvi.estadoValorTotalSoat === 'VENCIDO COMPRAR' || dvi.estadoValorTotalSoat === 'PROVISIONAL') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] SOAT pendiente',
                        message: \`\${veh.marca} \${veh.placa}: SOAT \${dvi.estadoValorTotalSoat}.\`,
                        vehiculoId
                    });
                }

                // Manifiesto/Factura con problema
                if (dvi.manifiestoFactura && dvi.manifiestoFactura !== 'DISPONIBLE EN CARPETA') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Manifiesto/Factura',
                        message: \`\${veh.marca} \${veh.placa}: Manifiesto y Factura \${dvi.manifiestoFactura}.\`,
                        vehiculoId
                    });
                }

                // Oficio de desembargo
                if (dvi.oficioDesembargo === 'NO') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Desembargo faltante',
                        message: \`\${veh.marca} \${veh.placa}: Oficio de Desembargo NO se encuentra en carpeta.\`,
                        vehiculoId
                    });
                }

                // Impronta incompleta
                if (inventory.peritajeProveedor && inventory.peritajeProveedor.impronta === 'INCOMPLETO') {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Impronta incompleta',
                        message: \`\${veh.marca} \${veh.placa}: Impronta incompleta.\`,
                        vehiculoId
                    });
                }

                // Peritaje pendiente
                if (inventory.peritajeProveedor && (inventory.peritajeProveedor.estado === 'NO ASEGURABLE' || inventory.peritajeProveedor.estado === 'POR SOLICITAR')) {
                    socket.emit('expirationNotice', {
                        title: '[INICIALES] Peritaje pendiente',
                        message: \`\${veh.marca} \${veh.placa}: Peritaje \${inventory.peritajeProveedor.estado}.\`,
                        vehiculoId
                    });
                }
            }

            // =============================================
            // DISPONIBLE A LA VENTA / SEPARADO: pendientes venta
            // =============================================
            if (esVenta) {
                // Vencimientos próximos
                verificarYNotificar(inventory, socket);

                // Documentos de traspaso
                if (dt.contratoVenta && dt.contratoVenta !== 'FIRMADO EN CARPETA' && dt.contratoVenta !== 'A NOMBRE DE AUTOMAGNO') {
                    socket.emit('expirationNotice', {
                        title: '[VENTA] Contrato pendiente',
                        message: \`\${veh.marca} \${veh.placa}: Contrato de Venta \${dt.contratoVenta}.\`,
                        vehiculoId
                    });
                }
                if (dt.funt && dt.funt !== 'FIRMADO EN CARPETA' && dt.funt !== 'A NOMBRE DE AUTOMAGNO') {
                    socket.emit('expirationNotice', {
                        title: '[VENTA] FUNT pendiente',
                        message: \`\${veh.marca} \${veh.placa}: FUNT \${dt.funt}.\`,
                        vehiculoId
                    });
                }
                if (dt.mandato && dt.mandato !== 'FIRMADO EN CARPETA' && dt.mandato !== 'A NOMBRE DE AUTOMAGNO' && inventory.filtroBaseDatos.proveedor !== 'AUTONAL') {
                    socket.emit('expirationNotice', {
                        title: '[VENTA] Mandato pendiente',
                        message: \`\${veh.marca} \${veh.placa}: Mandato \${dt.mandato}.\`,
                        vehiculoId
                    });
                }

                // SOAT vencido (crítico para venta)
                if (dvi.estadoValorTotalSoat === 'VENCIDO COMPRAR') {
                    socket.emit('expirationNotice', {
                        title: '[VENTA] SOAT vencido',
                        message: \`\${veh.marca} \${veh.placa}: SOAT VENCIDO - debe comprarse antes de vender.\`,
                        vehiculoId
                    });
                }

                // Deuda financiera
                if (inventory.deudaFinanciera && inventory.deudaFinanciera.fechaLimitePagoDeudaFinan) {
                    const d = new Date(inventory.deudaFinanciera.fechaLimitePagoDeudaFinan);
                    const fechaDef = new Date('1970-01-01T00:00:00.000+00:00');
                    if (d.getTime() !== fechaDef.getTime()) {
                        const dias = Math.round((d - new Date()) / 86400000);
                        if (dias <= 15) {
                            socket.emit('expirationNotice', {
                                title: '[VENTA] Deuda financiera próxima',
                                message: \`\${veh.marca} \${veh.placa}: Deuda financiera vence en \${dias} días.\`,
                                vehiculoId
                            });
                        }
                    }
                }
            }

            // === AMBOS ESTADOS: Vehículo en taller ===
            if (inventory.filtroBaseDatos && inventory.filtroBaseDatos.ubicacion === 'TALLER') {
                socket.emit('tallerNotice', {
                    title: 'Vehículo en Taller',
                    message: \`\${veh.marca} \${veh.placa} se encuentra en el taller: \${inventory.filtroBaseDatos.tallerProveedor}.\`,
                    vehiculoId
                });
            }
        });
    } catch (error) {
        console.error(error);
        socket.emit('errorCheckingExpiration', { error: 'Error al verificar las fechas de vencimiento' });
    }
};`;

if (c.includes("exports.checkExpirations = async (socket) => {")) {
  // Find start and end
  const startIdx = c.indexOf("exports.checkExpirations = async (socket) => {");
  // Find the closing of the function - look for the next exports. after it
  const searchAfter = c.indexOf("exports.checkContractExpirations", startIdx);
  if (searchAfter === -1) {
    console.log("ERROR: no encontré checkContractExpirations");
    process.exit(1);
  }
  // Go back to find the }; before checkContractExpirations
  const beforeNext = c.lastIndexOf("};", searchAfter);
  const oldFunc = c.substring(startIdx, beforeNext + 2);

  c = c.replace(oldFunc, fix);
  fs.writeFileSync(path, c);
  console.log("OK: Notificaciones v3 por estado aplicadas");
  console.log("- ASIGNADO EN INICIALES: impuestos, SIMIT, retención, SOAT, manifiesto, desembargo, peritaje, impronta");
  console.log("- DISPONIBLE A LA VENTA / SEPARADO: vencimientos, contrato, FUNT, mandato, SOAT, deuda financiera");
  console.log("- AMBOS: vehículo en taller");
} else {
  console.log("ERROR: función checkExpirations no encontrada");
}
