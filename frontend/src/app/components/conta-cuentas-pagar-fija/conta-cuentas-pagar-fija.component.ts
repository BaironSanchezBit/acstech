import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgZone } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { BehaviorSubject, map, Observable, of, startWith } from 'rxjs';
declare var bootstrap: any;

interface ResponseData {
  _id: string;
  banco: string;
  disponible: number;
  updatedAt: string;
}

@Component({
  selector: 'app-conta-cuentas-pagar-fija',
  templateUrl: './conta-cuentas-pagar-fija.component.html',
  styleUrl: './conta-cuentas-pagar-fija.component.css'
})
export class ContaCuentasPagarFijaComponent implements OnInit {
  cuentaPagarFijaForm: FormGroup;
  cuentaPagarFijaEditForm: FormGroup;
  mostrarModal: boolean = false;
  daviviendaForm: FormGroup;
  bancolombiaForm: FormGroup;
  daviDisponible: any;
  bancolDisponible: any;
  daviId: any;
  efectivoForm: FormGroup;
  efectivoDisponible: any;

  proveedoresFiltrados: Observable<any[]> = of([]);
  allProveedores: any[] = [];
  proveedoresControl = new FormControl();
  filteredSuppliers = new BehaviorSubject<any[]>([]);
  
  sumaDisponible: any;
  bancolId: any;
  efectivoId: any;
  pagosEditForm: FormGroup;
  cuentaSeleccionada: any;
  fechaPagoSeleccionada: any;
  cuentasFiltrados: any[] = [];
  saldoTotal: any;
  cuentasPagarFija: any;
  private apiUrl = environment.apiUrl;
  fechaActual: string;
  dias: number[] = [];
  monthNames = [
    "enero", "febrero", "marzo",
    "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre",
    "noviembre", "diciembre"
  ];

  constructor(private zone: NgZone, private formBuilder: FormBuilder, private http: HttpClient, private cdRef: ChangeDetectorRef) {
    this.fechaActual = new Date().toISOString().substring(0, 10);
    for (let i = 1; i <= 31; i++) {
      this.dias.push(i);
    }

    this.monthNames = [
      "enero", "febrero", "marzo",
      "abril", "mayo", "junio", "julio",
      "agosto", "septiembre", "octubre",
      "noviembre", "diciembre"
    ];

    this.daviviendaForm = this.formBuilder.group({
      banco: [{ value: '', disabled: true }],
      disponible: ['$ 0', Validators.required],
    })

    this.bancolombiaForm = this.formBuilder.group({
      banco: [{ value: '', disabled: true }],
      disponible: ['$ 0', Validators.required],
    })

    this.efectivoForm = this.formBuilder.group({
      banco: [{ value: '', disabled: true }],
      disponible: ['$ 0', Validators.required],
    })

    this.cuentaPagarFijaForm = this.formBuilder.group({
      valor: ['$ 0', Validators.required],
      saldo: ['$ 0', Validators.required],
      pagos: this.formBuilder.array([]),
      tipo: [''],
      tercero: [''],
      concepto: [''],
      numeroCuenta: [''],
      estado: ['ACTIVA'],
      dia: ['']
    })

    this.cuentaPagarFijaEditForm = this.formBuilder.group({
      tipoEdit: ['', Validators.required],
      terceroEdit: ['', Validators.required],
      conceptoEdit: ['', Validators.required],
      numeroCuentaEdit: ['', Validators.required],
      estadoEdit: [{ value: '', disabled: true }],
      valorEdit: ['$ 0', Validators.required],
      saldoEdit: ['$ 0', Validators.required],
      diaEdit: ['', Validators.required],
      pagosEdit: this.formBuilder.array([]),
    });

    this.pagosEditForm = this.formBuilder.group({
      pagosEdit: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.verifyMonthlyPayments();
    this.loadCuentasPagarFija();
    this.subscribeToPayments();

    this.http.get<any[]>(`${this.apiUrl}/api/getDisponible`).subscribe(data => {
      this.bancolDisponible = data[0].disponible;
      this.daviDisponible = data[1].disponible;
      this.efectivoDisponible = data[2].disponible;
      this.bancolId = data[0]._id;
      this.daviId = data[1]._id;
      this.efectivoId = data[2]._id;

      this.bancolombiaForm.patchValue({
        banco: data[0].banco,
        disponible: this.formatSalary(data[0].disponible),
      });

      this.daviviendaForm.patchValue({
        banco: data[1].banco,
        disponible: this.formatSalary(data[1].disponible),
      });

      this.efectivoForm.patchValue({
        banco: data[2].banco,
        disponible: this.formatSalary(data[2].disponible),
      });

      this.calcularDisponible();
    })

    this.http.get<any[]>(`${this.apiUrl}/api/getSuppliers`).subscribe(data => {
      this.allProveedores = data;
      this.configureFiltering();
    });

    setInterval(() =>
      this.http.get<any[]>(`${this.apiUrl}/api/getDisponible`).subscribe(data => {
        this.bancolDisponible = data[0].disponible;
        this.daviDisponible = data[1].disponible;
        this.efectivoDisponible = data[2].disponible;
        this.calcularDisponible();
      })
      , 5000);

    setInterval(() =>
      this.loadCuentasPagarFija(), 5000);
  }

  calcularDisponible() {
    this.sumaDisponible = this.daviDisponible + this.bancolDisponible + this.efectivoDisponible
  }

  calcularSaldoRestante(cuenta: any) {
    const totalPagado = this.cuentaSeleccionada.sumaPagos;
    return this.desformatearMoneda(this.cuentaSeleccionada.valor2) - totalPagado;
  }

  get pagosEdit(): FormArray {
    return this.pagosEditForm.get('pagosEdit') as FormArray;
  }

  sumarPagos(pagos: any[]): number {
    return pagos.reduce((acc, pago) => acc + this.sumarPagosIndividuales(pago.pagosArray), 0);
  }

  sumarPagosIndividuales(pagosArray: any[]): number {
    return pagosArray.reduce((acc, pago) => acc + pago.valor, 0);
  }

  formatearFechaAdmon(cuentaPagarFija: any): string {
    const hoy = new Date();
    const monthIndex = hoy.getMonth();
    const day = cuentaPagarFija.dia;
    const formattedDay = ('0' + day).slice(-2);

    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const formattedDate = `${formattedDay} de ${monthNames[monthIndex]}`;

    return formattedDate;
  }

  formatearFechaAdmon2(dia: any, fechaPago: string): string {
    const fechaPagoDate = new Date(fechaPago);

    const monthIndex = fechaPagoDate.getMonth();

    const day = dia;
    const formattedDay = ('0' + day).slice(-2);

    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const formattedDate = `${formattedDay} de ${monthNames[monthIndex]}`;

    return formattedDate;
  }

  formatearFechaAdmonNormal(dia: any): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;
    const formattedDay = ('0' + dia).slice(-2);
    const formattedMonth = ('0' + month).slice(-2);

    const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
    return formattedDate;
  }


  crear() {
    if (this.cuentaPagarFijaForm.valid) {
      const valor = this.desformatearMoneda(this.cuentaPagarFijaForm.get('valor')?.value);

      const body = {
        ...this.cuentaPagarFijaForm.getRawValue(),
        valor: valor,
      }

      this.http.post(`${this.apiUrl}/api/postCuentaPagarFija`, body)
        .subscribe(
          response => {
            this.cuentasPagarFija.push(response);
            this.calcularSaldoTotal();
            this.filtrarCuentas();

            this.cuentaPagarFijaForm.reset({
              valor: '$ 0',
            })
          },
          error => {
          }
        );
    } else {
      Swal.fire({
        icon: "error",
        title: "Ups",
        text: "Completa los datos",
      });
    }
  }

  actualizar(id: string): void {
    if (this.cuentaPagarFijaEditForm.valid) {
      const valor = this.desformatearMoneda(this.cuentaPagarFijaEditForm.get('valorEdit')?.value);
      const saldo = this.desformatearMoneda(this.cuentaPagarFijaEditForm.get('saldoEdit')?.value);

      let diasVencidos: any;

      let pagoSeleccionado = this.cuentaSeleccionada.pagos.find((pago: any) => {
        const fechaPago = new Date(pago.fechaPago).setHours(0, 0, 0, 0);
        const fechaPagoSeleccionada = new Date(this.fechaPagoSeleccionada).setHours(0, 0, 0, 0);
        diasVencidos = this.calcularDiasVencidosAdmon(pago.fechaPago, pago.pagado);
        return fechaPago === fechaPagoSeleccionada;
      });

      if (!pagoSeleccionado) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo encontrar el pago específico para actualizar."
        });
        return;
      }

      const nuevoPago = this.convertirArrayAObjeto(this.pagosEditForm.get('pagosEdit') as FormArray);
      pagoSeleccionado.pagosArray = nuevoPago;
      pagoSeleccionado.diasVencidos = diasVencidos;
      pagoSeleccionado.saldo = saldo;
      pagoSeleccionado.valor = valor;

      const body = {
        valor: valor,
        pagos: [pagoSeleccionado],
        fechaPagoSeleccionada: this.fechaPagoSeleccionada,
        tipo: this.cuentaPagarFijaEditForm.get('tipoEdit')?.value,
        tercero: this.cuentaPagarFijaEditForm.get('terceroEdit')?.value,
        concepto: this.cuentaPagarFijaEditForm.get('conceptoEdit')?.value,
        numeroCuenta: this.cuentaPagarFijaEditForm.get('numeroCuentaEdit')?.value,
        estado: this.cuentaPagarFijaEditForm.get('estadoEdit')?.value,
        dia: this.cuentaPagarFijaEditForm.get('diaEdit')?.value,
      };

      this.http.put(`${this.apiUrl}/api/updateCuentaPagarFija/${id}`, body, { responseType: 'text' })
        .subscribe({
          next: (response) => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Cuenta actualizada',
              showConfirmButton: false,
              timer: 1500
            });
            this.loadCuentasPagarFija();
            this.cerrarModal();
          },
          error: (error) => {
            Swal.fire({
              icon: "error",
              title: "Error al actualizar",
              text: error.error.message || "No se pudo actualizar la cuenta por pagar."
            });
          }
        });
    } else {
      Swal.fire({
        icon: "error",
        title: "Datos incompletos",
        text: "Completa todos los campos requeridos.",
      });
    }
  }


  togglePagado(pago: any, cuenta: any): void {
    pago.pagado = !pago.pagado;
    const updateData = {
      pagos: cuenta.pagos
    };

    this.http.put(`${this.apiUrl}/api/updatePago/${cuenta._id}`, updateData)
      .subscribe({
        next: (response) => {
          Swal.fire('Success', 'Payment status updated successfully!', 'success');
          this.loadCuentasPagarFija();
        },
        error: (error) => {
          console.error('Failed to update payment status', error);
          Swal.fire('Error', 'Failed to update payment status.', 'error');
          pago.pagado = !pago.pagado;
        }
      });
  }
  desformatearMoneda(valorFormateado: any): number {
    const valorComoCadena = (valorFormateado ?? '').toString();
    const valorNumerico = valorComoCadena.replace(/[^\d-]/g, '');
    const resultado = parseFloat(valorNumerico);
    return !isNaN(resultado) ? resultado : 0;
  }

  convertirArrayAObjeto(formArray: FormArray): any[] {
    return formArray.controls.map((control: AbstractControl) => {
      const fecha = control.get('fecha')?.value;
      const valor = this.desformatearMoneda(control.get('valor')?.value);
      return { fecha, valor };
    });
  }

  subscribeToPaymentChanges() {
    this.pagosEdit.controls.forEach(control => {
      control.get('valor')?.valueChanges.subscribe(() => {
        this.updateRemainingValue();
      });
    });
  }

  onCurrencyInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.replace(/[^\d.-]/g, '');
    const numericValue = parseFloat(inputValue);

    if (!isNaN(numericValue)) {
      inputElement.value = this.formatCurrencyWithCommas(numericValue);
    }
  }

  onCurrencyInput2(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.replace(/[^\d-]/g, '');
    const numericValue = parseInt(inputValue, 10);

    if (!isNaN(numericValue)) {
      const formattedValue = this.formatCurrencyWithCommas(numericValue);
      inputElement.value = formattedValue;
    }
  }


  formatCurrencyWithCommas(value: number): string {
    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(value));

    return (value < 0 ? '-' : '') + formatted;
  }

  formatSalary(salary: any): string {
    if (typeof salary === 'string' && salary.includes('$')) {
      return salary;
    }

    let numberSalary = typeof salary === 'string' ? parseFloat(salary) : salary;

    if (isNaN(numberSalary) || numberSalary === null) {
      return '-';
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numberSalary);
  }

  abrirModal(cuenta: any, fechaPago: string): void {
    this.cuentaSeleccionada = { ...cuenta };
    this.fechaPagoSeleccionada = fechaPago;
    this.pagosEdit.clear();

    const fechaSeleccionada = new Date(fechaPago);
    const mesSeleccionado = fechaSeleccionada.getUTCMonth();
    const añoSeleccionado = fechaSeleccionada.getUTCFullYear();

    const pagosFiltrados = cuenta.pagos
      .filter((pago: any) => {
        const fechaPago = new Date(pago.fechaPago);
        return fechaPago.getUTCMonth() === mesSeleccionado && fechaPago.getUTCFullYear() === añoSeleccionado;
      })
      .map((pago: any) => pago.pagosArray)
      .flat();

    if (pagosFiltrados.length > 0) {
      this.cuentaSeleccionada.pagosFiltrados = pagosFiltrados;
      pagosFiltrados.forEach((subPago: any) => {
        this.pagosEdit.push(this.formBuilder.group({
          fecha: [this.parseFecha(subPago.fecha), Validators.required],
          valor: [this.formatCurrencyWithCommas(subPago.valor), Validators.required]
        }));
      });
    }

    const isFullyPaid = this.cuentaSeleccionada.sumaPagos >= this.cuentaSeleccionada.valor2;
    if (this.cuentaSeleccionada.aprueba2 && !isFullyPaid) {
      this.pagosEdit.enable();
    } else {
      this.pagosEdit.disable();
    }

    this.updateFormValues();
  }

  private updateFormValues(): void {
    const isFullyPaid = this.sumarPagos(this.cuentaSeleccionada.pagos) >= this.desformatearMoneda(this.cuentaSeleccionada.valor);

    this.cuentaPagarFijaEditForm.patchValue({
      tipoEdit: this.cuentaSeleccionada.tipo,
      terceroEdit: this.cuentaSeleccionada.tercero,
      conceptoEdit: this.cuentaSeleccionada.concepto,
      numeroCuentaEdit: this.cuentaSeleccionada.numeroCuenta,
      estadoEdit: this.cuentaSeleccionada.estado,
      diaEdit: this.cuentaSeleccionada.dia,
      valorEdit: this.formatCurrencyWithCommas(this.cuentaSeleccionada.valor),
      saldoEdit: this.formatCurrencyWithCommas(this.calcularSaldoRestante(this.cuentaSeleccionada)),
    });

    this.mostrarModal = true;
  }

  checkLastPaymentDate(): void {
    const lastPayment = this.cuentaSeleccionada.pagos.reduce((latest: any, current: any) => {
      const currentFechaPago = new Date(current.fechaPago2);
      return (new Date(latest.fechaPago2) < currentFechaPago) ? current : latest;
    }, this.cuentaSeleccionada.pagos[0]);
    if (lastPayment) {
      const lastPaymentDate = new Date(lastPayment.fechaPago2);
      const currentDate = new Date();
      if (lastPaymentDate.getMonth() === currentDate.getMonth() &&
        lastPaymentDate.getFullYear() === currentDate.getFullYear()) {
        this.disablePaymentAddition();
      }
    }
  }

  removeModalBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  closeAllModals(): void {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
      const instance = bootstrap.Modal.getInstance(modal);
      if (instance) {
        instance.hide();
      }
    });
    this.removeModalBackdrop();
  }

  disablePaymentAddition(): void {
  }

  parseFecha(fecha: string): string {
    const date = new Date(fecha);
    return !isNaN(date.getTime()) ? date.toISOString().substring(0, 10) : '';
  }

  calcularDiasVencidosAdmon(fechaPago: any, pagado: boolean): number {
    if (pagado) return 0;

    const hoy = new Date();
    let fechaVencimiento = new Date(fechaPago);

    const tiempoRestante = fechaVencimiento.getTime() - hoy.getTime();

    if (tiempoRestante > 0) {
      return Math.ceil(-1 - tiempoRestante / (1000 * 3600 * 24));
    } else {
      return Math.floor(Math.abs(tiempoRestante) / (1000 * 3600 * 24));
    }
  }

  actualizarPrioridadFija(cuenta: any, fechaPago: string): void {
    const index = cuenta.pagos.findIndex((pago: any) => pago.fechaPago === fechaPago);
    if (index === -1) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el pago para la fecha especificada."
      });
      return;
    }

    const pagos = [...cuenta.pagos];
    pagos[index] = { ...pagos[index], prioridad: cuenta.prioridad2 };

    const data = {
      pagos: pagos
    };

    this.http.put(`${this.apiUrl}/api/updatePagoGerencia/${cuenta._id}`, data)
      .subscribe({
        next: (response) => {
          this.loadCuentasPagarFija();
        },
        error: (error) => {
          console.error('Error al actualizar el estado de pago', error);
          this.loadCuentasPagarFija();
        }
      });
  }

  getSelectedColor(prioridad: string): string {
    switch (prioridad) {
      case 'CRÍTICO':
        return '#505157';
      case 'ALTO':
        return '#6645A9';
      case 'MEDIO':
        return '#6365B7';
      case 'BAJO':
        return '#79AFFD';
      default:
        return '';
    }
  }

  getTextColor(prioridad: string): string {
    switch (prioridad) {
      case 'CRÍTICO':
      case 'ALTO':
        return '#ffffff';
      case 'MEDIO':
      case 'BAJO':
        return '#ffffff';
      default:
        return '';
    }
  }

  getLastPayment(cuenta: any) {
    return cuenta.pagos && cuenta.pagos.length > 0 ? cuenta.pagos[cuenta.pagos.length - 1] : {};
  }

  actualizarEstadoPagoFija(cuenta: any, fechaPago: string): void {
    const index = cuenta.pagos.findIndex((pago: any) => pago.fechaPago === fechaPago);
    if (cuenta.sumaPagos === 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el pago para la fecha especificada."
      });
      return;
    }

    const pagos = [...cuenta.pagos];
    pagos[index] = {
      ...pagos[index], pagado: true, diasVencidos: this.calcularDiasVencidosAdmon(fechaPago,
        false)
    };

    const data = {
      pagos: pagos
    };

    this.http.put(`${this.apiUrl}/api/updatePagoGerencia/${cuenta._id}`, data)
      .subscribe({
        next: (response) => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Cuenta por pagar actualizada',
            showConfirmButton: false,
            timer: 1500
          });
          this.loadCuentasPagarFija();
        },
        error: (error) => {
          console.error('Error al actualizar el estado de pago', error);
          this.loadCuentasPagarFija();
        }
      });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cuentaPagarFijaEditForm.reset();
    this.cuentaSeleccionada = null;
  }

  calcularSaldoTotal(): void {
    this.saldoTotal = this.cuentasPagarFija.reduce((acc: any, cuenta: any) => {
      const ultimoPago = cuenta;
      const saldo = ultimoPago && ultimoPago.saldo2 ? this.desformatearMoneda(ultimoPago.saldo2) : 0;
      return acc + saldo;
    }, 0);
  }

  filtrarCuentas(): void {
    const hoy = new Date();
    this.cuentasFiltrados = this.cuentasPagarFija.filter((cuenta: any) => {
      const lastPayment = this.getLastPayment(cuenta);
      return !lastPayment.pagado2;
    });

    this.cuentasFiltrados.forEach(cuenta => {
      cuenta.pagos = cuenta.pagos.filter((pago: any) => {
        const fechaPago = new Date(pago.fechaPago);
        return fechaPago.getMonth() === hoy.getMonth() && fechaPago.getFullYear() === hoy.getFullYear();
      });
    });
    this.calcularSaldoTotal();
  }



  verifyMonthlyPayments(): void {
    this.http.get(`${this.apiUrl}/api/verifyPayments`).subscribe({
      next: () => {
        this.loadCuentasPagarFija();
      },
      error: (error) => {
        console.error('Error al verificar los pagos mensuales:', error);
        this.loadCuentasPagarFija();
      }
    });
  }

  loadCuentasPagarFija(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/getCuentasPagarFija`).subscribe(data => {
      let cuentasTransformadas = this.transformarCuentas(data);
      this.cuentasPagarFija = this.ordenarCuentasPorPrioridadFija(cuentasTransformadas);
      this.cdRef.detectChanges();
      this.calcularSaldoTotal();
    });
  }

  configureFiltering() {
    this.proveedoresFiltrados = this.proveedoresControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSuppliers(value))
    );
  }  

  ordenarCuentasPorPrioridadFija(cuentasTransformadas: any[]): any[] {
    const prioridadValor: { [key: string]: number } = {
      'CRÍTICO': 1,
      'ALTO': 2,
      'MEDIO': 3,
      'BAJO': 4
    };

    return cuentasTransformadas.sort((a, b) => {
      let prioridadA = prioridadValor[a.prioridad2] || 5;
      let prioridadB = prioridadValor[b.prioridad2] || 5;

      return prioridadA - prioridadB;
    });
  }

  transformarCuentas(data: any[]): any[] {
    let cuentasTransformadas: any[] = [];
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    data.forEach(cuenta => {
      const sumaTotalPagos = cuenta.pagos.reduce((acc: any, pago: any) =>
        acc + pago.pagosArray.reduce((acc: any, subpago: any) => acc + subpago.valor, 0), 0);

      cuenta.pagos.forEach((pago: any) => {
        const sumaPagosPeriodo = pago.pagosArray.reduce((acc: any, subpago: any) => acc + subpago.valor, 0);
        let fechaFormateada = '';
        let fechaPagoFormateada = "";

        if (pago.fechaPago) {
          const fechaPagoDate = new Date(pago.fechaPago);
          fechaPagoFormateada = `${fechaPagoDate.getDate()} de ${monthNames[fechaPagoDate.getMonth()]} del ${fechaPagoDate.getFullYear()}`;
        }

        if (pago.pagosArray.length > 0) {
          const fechaUltimoSubPago = new Date(pago.pagosArray.sort((a: any, b: any) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0].fecha);
          fechaFormateada = `${fechaUltimoSubPago.getDate()} de ${monthNames[fechaUltimoSubPago.getMonth()]} del ${fechaUltimoSubPago.getFullYear()}`;
        } else {
          fechaFormateada = "Sin pagos";
        }

        if (!pago.pagado) {
          let cuentaDuplicada = {
            ...cuenta,
            fechaPago: fechaPagoFormateada,
            fechaPago2: pago.fechaPago,
            fecha: fechaFormateada,
            valor2: pago.valor,
            saldo2: pago.saldo,
            solicita2: pago.solicita,
            prioridad2: pago.prioridad,
            pagado2: pago.pagado,
            aprueba2: pago.aprueba,
            diasVencidos2: pago.diasVencidos,
            sumaPagos: sumaPagosPeriodo,
            sumaTotalPagos: sumaTotalPagos
          };
          cuentasTransformadas.push(cuentaDuplicada);
        }
      });
    });

    return cuentasTransformadas;
  }

  agregarPago() {
    const pagosFormGroup = this.formBuilder.group({
      fecha: [''],
      valor: ['']
    });

    pagosFormGroup.get('valor')?.valueChanges.subscribe(valorFormateado => {
      if (valorFormateado !== null) {
        const valorNumerico = this.desformatearMoneda(valorFormateado);
        pagosFormGroup.get('valor')?.setValue(valorNumerico.toString(), { emitEvent: false });
      }
    });

    this.pagosEdit.push(pagosFormGroup);
    this.subscribeToPaymentChanges();
  }

  eliminarPago(index: number): void {
    this.pagosEdit.removeAt(index);
  }

  subscribeToPayments() {
    this.pagosEdit.valueChanges.subscribe(() => {
      this.updateRemainingValue();
    });
  }

  updateRemainingValue() {
    const totalPagos = this.pagosEdit.value.reduce((acc: any, current: any) => acc + this.desformatearMoneda(current.valor), 0);
    const saldoInicial = this.desformatearMoneda(this.cuentaPagarFijaEditForm.get('valorEdit')?.value);

    const saldoRestante = Math.max(0, saldoInicial - totalPagos);

    this.cuentaPagarFijaEditForm.get('saldoEdit')?.setValue(this.formatCurrencyWithCommas(saldoRestante));
  }


  actualizarDavi() {
    if (this.daviviendaForm.valid) {
      const disponible = this.desformatearMoneda(this.daviviendaForm.get('disponible')?.value);

      const body = {
        ...this.daviviendaForm.value,
        disponible: disponible
      };

      this.http.put<ResponseData>(`${this.apiUrl}/api/updateDisponible/${this.daviId}`, body)
        .subscribe(
          response => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Disponible actualizado',
              showConfirmButton: false,
              timer: 1000
            });

            this.daviDisponible = response.disponible
            this.calcularDisponible();

            this.closeAllModals();
          },
          error => {
          }
        );
    } else {
      Swal.fire({
        icon: "error",
        title: "Ups",
        text: "Completa los datos",
      });
    }
  }

  actualizarBancol() {
    if (this.bancolombiaForm.valid) {
      const disponible = this.desformatearMoneda(this.bancolombiaForm.get('disponible')?.value);

      const body = {
        ...this.bancolombiaForm.value,
        disponible: disponible
      };

      this.http.put<ResponseData>(`${this.apiUrl}/api/updateDisponible/${this.bancolId}`, body)
        .subscribe(
          response => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Disponible actualizado',
              showConfirmButton: false,
              timer: 1000
            });

            this.bancolDisponible = response.disponible
            this.calcularDisponible();

            this.closeAllModals();
          },
          error => {
          }
        );
    } else {
      Swal.fire({
        icon: "error",
        title: "Ups",
        text: "Completa los datos",
      });
    }
  }

  actualizarEfectivo() {
    if (this.efectivoForm.valid) {
      const disponible = this.desformatearMoneda(this.efectivoForm.get('disponible')?.value);

      const body = {
        ...this.efectivoForm.value,
        disponible: disponible
      };

      this.http.put<ResponseData>(`${this.apiUrl}/api/updateDisponible/${this.efectivoId}`, body)
        .subscribe(
          response => {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Disponible actualizado',
              showConfirmButton: false,
              timer: 1000
            });

            this.efectivoDisponible = response.disponible
            this.calcularDisponible();

            this.closeAllModals();
          },
          error => {
          }
        );
    } else {
      Swal.fire({
        icon: "error",
        title: "Ups",
        text: "Completa los datos",
      });
    }
  }

  private _filterSuppliers(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.allProveedores.filter(option => option.tercero.toLowerCase().includes(filterValue));
  }  

  displayFn(proveedor: string): string {
    return proveedor || '';
  }
}