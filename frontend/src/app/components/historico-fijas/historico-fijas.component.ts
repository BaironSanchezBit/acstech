import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgZone } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/app/environments/environment';
declare var bootstrap: any;

interface ResponseData {
  _id: string;
  banco: string;
  disponible: number;
  updatedAt: string;
}

@Component({
  selector: 'app-historico-fijas',
  templateUrl: './historico-fijas.component.html',
  styleUrl: './historico-fijas.component.css'
})
export class HistoricoFijasComponent implements OnInit {
  cuentaPagarFijaEditForm: FormGroup;
  mostrarModal: boolean = false;
  daviDisponible: any;
  tipoFilter: string = '';
  terceroFilter: string = '';
  fechaInicioFilter: string = '';
  fechaFinFilter: string = '';
  bancolDisponible: any;
  daviId: any;
  bancolId: any;
  pagosEditForm: FormGroup;
  efectivoDisponible: any;
  sumaDisponible: any;
  cuentaSeleccionada: any;
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
  datosUser: any;
  cargo: string = "";

  constructor(private zone: NgZone, private authService: AuthService, private formBuilder: FormBuilder, private http: HttpClient, private cdRef: ChangeDetectorRef) {
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

    this.cuentaPagarFijaEditForm = this.formBuilder.group({
      tipoEdit: ['', Validators.required],
      terceroEdit: ['', Validators.required],
      conceptoEdit: ['', Validators.required],
      numeroCuentaEdit: ['', Validators.required],
      estadoEdit: ['', Validators.required],
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
    this.loadCuentasPagarFija();
    this.verifyMonthlyPayments();

    this.http.get<any[]>(`${this.apiUrl}/api/getDisponible`).subscribe(data => {
      this.bancolDisponible = data[0].disponible;
      this.daviDisponible = data[1].disponible;
      this.efectivoDisponible = data[2].disponible;
      this.calcularDisponible();
    })

    setInterval(() =>
      this.http.get<any[]>(`${this.apiUrl}/api/getDisponible`).subscribe(data => {
        this.bancolDisponible = data[0].disponible;
        this.daviDisponible = data[1].disponible;
        this.efectivoDisponible = data[2].disponible;
        this.calcularDisponible();
      })
      , 5000);

    this.loadCuentasPagarFija();
    setInterval(() =>
      this.loadCuentasPagarFija(), 5000);

    this.authService.getUserDetails().subscribe(
      user => {
        this.datosUser = user;
        this.cargo = user.cargo;
      },
      error => {
      }
    );
  }

  loadFilters() {
    const savedFilters = localStorage.getItem('historicoFilters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      this.tipoFilter = filters.tipoFilter;
      this.terceroFilter = filters.terceroFilter;
      this.fechaInicioFilter = filters.fechaInicioFilter;
      this.fechaFinFilter = filters.fechaFinFilter;
      this.applyFilters();
    }
  }

  calcularDisponible() {
    this.sumaDisponible = this.daviDisponible + this.bancolDisponible + this.efectivoDisponible
  }

  calcularSaldoRestante(cuenta: any) {
    const totalPagado = this.sumarPagos(cuenta.pagos);
    return this.desformatearMoneda(cuenta.valor) - totalPagado;
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

  applyFilters() {
    this.cuentasFiltrados = this.cuentasPagarFija.filter((item: any) => {
      const fechaPago = new Date(item.fechaPago2).getTime();
      const inicio = this.fechaInicioFilter ? new Date(this.fechaInicioFilter).getTime() : null;
      const fin = this.fechaFinFilter ? new Date(this.fechaFinFilter).getTime() : null;

      return (!this.tipoFilter || item.tipo.includes(this.tipoFilter)) &&
        (!this.terceroFilter || item.tercero.includes(this.terceroFilter)) &&
        (!inicio || fechaPago >= inicio) &&
        (!fin || fechaPago <= fin);
    });
    this.saveFilters();
  }

  saveFilters() {
    const filters = {
      tipoFilter: this.tipoFilter,
      terceroFilter: this.terceroFilter,
      fechaInicioFilter: this.fechaInicioFilter,
      fechaFinFilter: this.fechaFinFilter
    };
    localStorage.setItem('historicoFilters', JSON.stringify(filters));
  }

  formatearFechaAdmon3(pagos: any): string {
    if (!pagos.pagosArray || pagos.pagosArray.length === 0) {
      return 'Sin pagos';
    }

    const pagosArray = pagos.pagosArray;


    const ultimoPago = pagosArray.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

    const fechaCreacion = new Date(ultimoPago.fecha);
    fechaCreacion.setHours(0, 0, 0, 0);

    const day = fechaCreacion.getDate();
    const monthIndex = fechaCreacion.getMonth();
    const year = fechaCreacion.getFullYear();
    const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

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

  onCurrencyInput(event: Event): void {
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
    this.pagosEdit.clear();

    const fechaSeleccionada = new Date(fechaPago);
    const mesSeleccionado = fechaSeleccionada.getUTCMonth();
    const añoSeleccionado = fechaSeleccionada.getUTCFullYear();

    const pagosFiltrados = cuenta.pagos
      .map((pago: any) => pago.pagosArray)
      .flat()
      .filter((subPago: any) => {
        const fechaSubPago = new Date(subPago.fecha);
        return fechaSubPago.getUTCMonth() === mesSeleccionado && fechaSubPago.getUTCFullYear() === añoSeleccionado;
      });

    if (pagosFiltrados.length > 0) {
      this.cuentaSeleccionada.pagosFiltrados = pagosFiltrados;
      pagosFiltrados.forEach((subPago: any) => {
        this.pagosEdit.push(this.formBuilder.group({
          fecha: [this.parseFecha(subPago.fecha), Validators.required],
          valor: [this.formatCurrencyWithCommas(subPago.valor), Validators.required]
        }));
      });
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

    this.pagosEdit.disable();

    this.cuentaPagarFijaEditForm.disable();

    this.mostrarModal = true;
  }

  checkLastPaymentDate(): void {
    const lastPayment = this.cuentaSeleccionada.pagos.reduce((latest: any, current: any) => {
      const currentFechaPago = new Date(current.fechaPago);
      return (new Date(latest.fechaPago) < currentFechaPago) ? current : latest;
    }, this.cuentaSeleccionada.pagos[0]);
    if (lastPayment) {
      const lastPaymentDate = new Date(lastPayment.fechaPago);
      const currentDate = new Date();
      if (lastPaymentDate.getMonth() === currentDate.getMonth() &&
        lastPaymentDate.getFullYear() === currentDate.getFullYear()) {
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
      return Math.ceil( -1 - tiempoRestante / (1000 * 3600 * 24));
    } else {
      return Math.floor(Math.abs(tiempoRestante) / (1000 * 3600 * 24));
    }
  }

  getLastPayment(cuenta: any) {
    return cuenta.pagos[cuenta.pagos.length - 1];
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cuentaPagarFijaEditForm.reset();
    this.cuentaSeleccionada = null;
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
      this.cuentasPagarFija = this.ordenarCuentasPorFechaPago(cuentasTransformadas);
      this.applyFilters();
      this.cdRef.detectChanges();
    });
  }

  ordenarCuentasPorFechaPago(cuentasTransformadas: any[]): any[] {
    return cuentasTransformadas.sort((a, b) => {
      let fechaA = a.fechaPago2 ? new Date(a.fechaPago2).getTime() : 0;
      let fechaB = b.fechaPago2 ? new Date(b.fechaPago2).getTime() : 0;

      return fechaB - fechaA;
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

        let cuentaDuplicada = {
          ...cuenta,
          fechaPago: fechaPagoFormateada,
          fechaPago2: pago.fechaPago,
          fecha: fechaFormateada,
          valor2: pago.valor,
          saldo2: pago.saldo,
          pagado2: pago.pagado,
          aprueba2: pago.aprueba,
          diasVencidos2: pago.diasVencidos,
          sumaPagos: sumaPagosPeriodo,
          sumaTotalPagos: sumaTotalPagos
        };
        cuentasTransformadas.push(cuentaDuplicada);
      });
    });

    return cuentasTransformadas;
  }


  subscribeToPayments() {
    this.pagosEdit.valueChanges.subscribe(() => {
      this.updateRemainingValue();
    });
  }

  esFechaActual(fecha: string): boolean {
    const fechaPago = new Date(fecha);
    const hoy = new Date();
    return fechaPago.getMonth() === hoy.getMonth() && fechaPago.getFullYear() === hoy.getFullYear();
  }

  updateRemainingValue() {
    const totalPagos = this.pagosEdit.value.reduce((acc: any, current: any) => acc + this.desformatearMoneda(current.valor), 0);
    const saldoRestante = Math.max(0, this.desformatearMoneda(this.cuentaSeleccionada.valor) - totalPagos);
    this.cuentaPagarFijaEditForm.get('saldoEdit')?.setValue(this.formatCurrencyWithCommas(saldoRestante));
  }
}