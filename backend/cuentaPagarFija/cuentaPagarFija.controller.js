const CuentaPagarFija = require('./cuentaPagarFija.dao');

exports.create = async (req, res) => {
    const cuentasPagarFija = new CuentaPagarFija(req.body);

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    const diaDePago = parseInt(req.body.dia);

    cuentasPagarFija.pagos.push({
        fechaPago: new Date(añoActual, mesActual, diaDePago),
        pagosArray: [],
        pagado: false,
        aprueba: false,
        diasVencidos: 0,
        valor: cuentasPagarFija.valor,
        saldo: cuentasPagarFija.valor
    });

    try {
        await cuentasPagarFija.save();
        res.status(201).send(cuentasPagarFija);
    } catch (error) {
        console.error('Failed to create fixed payment account:', error);
        res.status(400).send(error);
    }
};

async function generarPagosMensuales() {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    const cuentas = await CuentaPagarFija.find().catch(err => {
        console.error("Database operation failed:", err);
        return [];
    });

    for (let cuenta of cuentas) {
        if (cuenta.estado === 'ACTIVA') {
            let ultimoPago = cuenta.pagos[cuenta.pagos.length - 1];
            if (ultimoPago) {
                const fechaUltimoPago = new Date(ultimoPago.fechaPago);
                if (fechaUltimoPago.getMonth() !== mesActual || fechaUltimoPago.getFullYear() !== añoActual) {
                    cuenta.pagos.push({
                        fechaPago: new Date(añoActual, mesActual, cuenta.dia),
                        pagosArray: [],
                        pagado: false,
                        diasVencidos: 0,
                        valor: cuenta.valor,
                        saldo: cuenta.valor,
                    });
                    await cuenta.save();
                }
            } else {
                cuenta.pagos.push({
                    fechaPago: new Date(añoActual, mesActual, parseInt(cuenta.dia)),
                    pagosArray: [],
                    pagado: false,
                    aprueba: false,
                    diasVencidos: 0,
                    valor: cuenta.valor,
                    saldo: cuenta.valor
                });
                await cuenta.save();
            }
        }
    }
}

exports.generateMonthlyPayments = async (req, res) => {
    try {
        await generarPagosMensuales();
        res.status(200).json({ message: 'Pagos mensuales generados correctamente.' });
    } catch (error) {
        console.error('Error generando pagos mensuales:', error);
        res.status(500).json({ message: 'Error al generar pagos mensuales', error: error });
    }
};

exports.updatePago = async (req, res) => {
    try {
        const { _id } = req.params;
        const updatedData = req.body;
        const pagoId = updatedData.pagos._id;

        const cuenta = await CuentaPagarFija.findById(_id);
        if (!cuenta) {
            return res.status(404).send("Cuenta not found.");
        }

        const pago = cuenta.pagos.id(pagoId);
        if (!pago) {
            return res.status(404).send("Pago not found.");
        }

        pago.pagado = updatedData.pagos.pagado;
        pago.aprueba = updatedData.pagos.aprueba;
        pago.diasVencidos = updatedData.pagos.diasVencidos;

        await cuenta.save();

        res.status(200).json({ message: "Pago updated successfully." });
    } catch (error) {
        console.error("Error al actualizar el pago:", error);
        res.status(500).send("Server error.");
    }
};

exports.updatePagoGerencia = async (req, res) => {
    try {
        const { _id } = req.params;
        const { pagos } = req.body;

        const cuenta = await CuentaPagarFija.findById(_id);
        if (!cuenta) {
            return res.status(404).send("Cuenta not found.");
        }

        pagos.forEach(pagoActualizado => {
            let pago = cuenta.pagos.id(pagoActualizado._id);
            if (pago) {
                pago.aprueba = pagoActualizado.aprueba;
                pago.pagado = pagoActualizado.pagado;
                pago.solicita = pagoActualizado.solicita;
                pago.prioridad = pagoActualizado.prioridad;
            }
        });

        await cuenta.save();
        res.status(200).json({ message: "Pagos updated successfully." });
    } catch (error) {
        console.error("Error al actualizar los pagos:", error);
        res.status(500).send("Server error.");
    }
};


exports.getAll = async (req, res) => {
    try {
        const cuentasPagarFija = await CuentaPagarFija.find({});
        res.status(200).send(cuentasPagarFija);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getCuentaPagarFijaByName = async (req, res) => {
    try {
        const cuentaPagarFija = await CuentaPagarFija.findOne({ numeroIdentificacion: req.params.cuentaPagarFija });
        if (!cuentaPagarFija) {
            return res.status(404).send();
        }
        res.send(cuentaPagarFija);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getCuentaPagarFijaById = async (req, res) => {
    try {
        const cuentaPagarFija = await CuentaPagarFija.findOne({ id_: req.params.cuentaPagarFija });
        if (!cuentaPagarFija) {
            return res.status(404).send();
        }
        res.send(cuentaPagarFija);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getOne = async (req, res) => {
    try {
        const cuentasPagarFija = await CuentaPagarFija.findById(req.params.id);
        if (!cuentasPagarFija) {
            return res.status(404).send();
        }
        res.send(cuentasPagarFija);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.update = async (req, res) => {
    try {
        const cuentaId = req.params.id;
        const updatedData = req.body;

        const cuentaPagarFija = await CuentaPagarFija.findById(cuentaId);
        if (!cuentaPagarFija) {
            return res.status(404).send("Cuenta por pagar no encontrada.");
        }

        cuentaPagarFija.tipo = updatedData.tipo;
        cuentaPagarFija.valor = updatedData.valor;
        cuentaPagarFija.tercero = updatedData.tercero;
        cuentaPagarFija.concepto = updatedData.concepto;
        cuentaPagarFija.numeroCuenta = updatedData.numeroCuenta;
        cuentaPagarFija.dia = updatedData.dia;
        cuentaPagarFija.estado = updatedData.estado;

        const fechaPagoBuscada = new Date(updatedData.fechaPagoSeleccionada);
        fechaPagoBuscada.setHours(0, 0, 0, 0);

        let pagoMesActual = cuentaPagarFija.pagos.find(pago => {
            const fechaPago = new Date(pago.fechaPago);
            fechaPago.setHours(0, 0, 0, 0);
            return fechaPago.getTime() === fechaPagoBuscada.getTime();
        });

        if (pagoMesActual) {
            if (!Array.isArray(updatedData.pagos) || !updatedData.pagos.length) {
                return res.status(400).send("No se proporcionaron datos de pagos válidos.");
            }
            const pagosArray = updatedData.pagos[0].pagosArray;

            if (Array.isArray(pagosArray)) {
                pagoMesActual.pagosArray = pagosArray;

                const totalPagado = pagosArray.reduce((total, pago) => total + pago.valor, 0);
                pagoMesActual.saldo = cuentaPagarFija.valor - totalPagado;
            } else {
                return res.status(400).send("El array de pagos es inválido.");
            }
        } else {
            const pagosArray = updatedData.pagos[0].pagosArray;

            if (!Array.isArray(pagosArray)) {
                return res.status(400).send("El array de pagos proporcionado es inválido.");
            }

            const totalPagado = pagosArray.reduce((total, pago) => total + pago.valor, 0);
            cuentaPagarFija.pagos.push({
                fechaPago: new Date(currentYear, currentMonth, updatedData.dia),
                pagosArray: pagosArray,
                valor: cuentaPagarFija.valor,
                saldo: cuentaPagarFija.valor - totalPagado,
                pagado: false,
                diasVencidos: 0
            });
        }

        await cuentaPagarFija.save();
        res.status(200).json({ message: "Cuenta por pagar actualizada correctamente." });
    } catch (error) {
        console.error("Error al actualizar la cuenta por pagar:", error);
        res.status(500).json({ message: "Error al actualizar la cuenta por pagar.", error });
    }
};



exports.delete = async (req, res) => {
    try {
        const cuentasPagarFija = await CuentaPagarFija.findByIdAndDelete(req.params.id);
        if (!cuentasPagarFija) {
            return res.status(404).send();
        }
        res.send(cuentasPagarFija);
    } catch (error) {
        res.status(500).send(error);
    }
};