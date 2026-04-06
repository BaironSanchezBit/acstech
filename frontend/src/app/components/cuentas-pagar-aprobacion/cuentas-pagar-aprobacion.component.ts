import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgZone } from '@angular/core';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-cuentas-pagar-aprobacion',
  templateUrl: './cuentas-pagar-aprobacion.component.html',
  styleUrl: './cuentas-pagar-aprobacion.component.css'
})
export class CuentasPagarAprobacionComponent implements OnInit {
  mostrarModal: boolean = false;
  mostrarModal2: boolean = false;
  cuentaSeleccionada: any;
  cuentasFiltrados: any[] = [];
  cuentasFiltradosFijas: any[] = [];
  saldoTotal: any;
  saldoTotalFijas: any;
  filtroClasificacion: string = 'Veh';
  cuentasPagar: any;
  saldoTotalAprobadosNoPagados: any;
  saldoTotalAprobadosNoPagadosFijas: any;
  cuentasPagarFija: any;
  cuentasAllFijas: any;
  daviDisponible: any;
  bancolDisponible: any;
  efectivoDisponible: any;
  sumaDisponible: any;
  daviId: any;
  bancolId: any;
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

    this.cuentasPagar = [];
    this.cuentasPagarFija = [];

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
  }

  ngOnInit(): void {
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

    this.actualizarSumaAprobadosNoPagados();
    this.loadCuentasPagar();
    this.loadCuentasPagarFija();
    setInterval(() =>
      this.loadCuentasPagarFija(), 5000);
    setInterval(() =>
      this.loadCuentasPagar(), 5000);
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

  formatearFecha(fechaVencimiento: any) {
    const fechaCreacion = new Date(fechaVencimiento);
    const day = fechaCreacion.getDate();
    const monthIndex = fechaCreacion.getMonth();
    const year = fechaCreacion.getFullYear();
    const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

    return formattedDate;
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

  desformatearMoneda(valorFormateado: any): number {
    const valorComoCadena = (valorFormateado ?? '').toString();
    const valorNumerico = valorComoCadena.replace(/[^\d-]/g, '');
    const resultado = parseFloat(valorNumerico);
    return !isNaN(resultado) ? resultado : 0;
  }

  convertirArrayAObjeto(formArray: FormArray): any {
    return formArray.controls.map(control => {
      const formGroup = control as FormGroup;
      const valor = this.desformatearMoneda(formGroup.get('valor')?.value);
      return {
        fechaPago: formGroup.get('fechaPago')?.value,
        valor: valor
      };
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

  calcularDisponible() {
    this.sumaDisponible = this.daviDisponible + this.bancolDisponible + this.efectivoDisponible
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

  getLastPayment(cuenta: any) {
    return cuenta.pagos[cuenta.pagos.length - 1];
  }

  calcularDiasVencidos(fechaVencimiento: string, pagado: boolean): number {
    if (pagado) {
      return 0;
    }

    const ahora = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const tiempoVencido = ahora.getTime() - vencimiento.getTime();

    if (tiempoVencido > 0) {
      return Math.floor(tiempoVencido / (1000 * 3600 * 24));
    }

    return 0;
  }

  calcularDiasVencidosAdmon(fechaPago: any, pagado: boolean): number {
    if (pagado) return 0;

    const hoy = new Date();
    let fechaVencimiento = new Date(fechaPago);

    const diasVencidos = (hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 3600 * 24);
    return Math.max(0, Math.floor(diasVencidos));
  }


  actualizarEstadoPago(cuenta: any): void {
    const data = {
      aprueba: true
    };

    this.http.put(`${this.apiUrl}/api/apruebaCuentaPagar/${cuenta._id}`, data).subscribe({
      next: (response) => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Cuenta por pagar actualizada',
          showConfirmButton: false,
          timer: 1500
        });

        const index = this.cuentasPagar.findIndex((c: any) => c._id === cuenta._id);
        if (index !== -1) {
          this.cuentasPagar[index] = { ...this.cuentasPagar[index], aprueba: data.aprueba };
          this.cdRef.markForCheck();
        }
        this.filtrarCuentas();
      },
      error: (error) => {
        console.error('Error al actualizar el estado de pago', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el estado de la cuenta."
        });
        cuenta.aprueba = !cuenta.aprueba;
      }
    });
  }

  actualizarPrioridad(cuenta: any): void {
    const data = {
      prioridad: cuenta.prioridad
    };

    this.http.put(`${this.apiUrl}/api/updateCuentaPagar/${cuenta._id}`, data).subscribe({
      next: (response) => {
        const index = this.cuentasPagar.findIndex((c: any) => c._id === cuenta._id);
        if (index !== -1) {
          this.cuentasPagar[index] = { ...this.cuentasPagar[index], prioridad: data.prioridad };
          this.cdRef.markForCheck();
        }
        this.filtrarCuentas();
      },
      error: (error) => {
        console.error('Error al actualizar el estado de pago', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el estado de la cuenta."
        });
      }
    });
  }

  actualizarEstadoPagoFija(cuenta: any, fechaPago: string): void {
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
    pagos[index] = { ...pagos[index], aprueba: true };

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

  loadCuentasPagar(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/getCuentasPagar`).subscribe(data => {
      this.cuentasPagar = data.map(cuenta => ({
        ...cuenta,
      }));
      this.ordenarCuentasPorPrioridad(this.cuentasPagar);
      this.filtrarCuentas();
      this.calcularSaldoTotal();
      this.actualizarSumaAprobadosNoPagados();
    });
  }

  loadCuentasPagarFija(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/getCuentasPagarFija`).subscribe(data => {
      this.cuentasAllFijas = this.transformarCuentasAll(data);
      let cuentasTransformadas = this.transformarCuentas(data);
      this.cuentasPagarFija = this.ordenarCuentasPorPrioridadFija(cuentasTransformadas);
      this.cdRef.detectChanges();
      this.calcularSaldoTotalFijas();
      this.actualizarSumaAprobadosNoPagados();
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

        if (!pago.aprueba) {
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

  ordenarCuentasPorPrioridad(cuentasTransformadas: any[]): any[] {
    const prioridadValor: { [key: string]: number } = {
      'CRÍTICO': 1,
      'ALTO': 2,
      'MEDIO': 3,
      'BAJO': 4
    };

    return cuentasTransformadas.sort((a, b) => {
      let prioridadA = prioridadValor[a.prioridad] || 5;
      let prioridadB = prioridadValor[b.prioridad] || 5;

      return prioridadA - prioridadB;
    });
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

  transformarCuentasAll(data: any[]): any[] {
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
          solicita2: pago.solicita,
          prioridad2: pago.prioridad,
          diasVencidos2: pago.diasVencidos,
          sumaPagos: sumaPagosPeriodo,
          sumaTotalPagos: sumaTotalPagos
        };
        cuentasTransformadas.push(cuentaDuplicada);
      });
    });

    return cuentasTransformadas;
  }

  calcularSaldoTotal(): void {
    this.saldoTotal = this.cuentasFiltrados.reduce((acc: any, cuenta: any) => acc + this.desformatearMoneda(cuenta.saldo), 0);
  }

  calcularSaldoTotalFijas(): void {
    this.saldoTotalFijas = this.cuentasPagarFija.reduce((acc: any, cuenta: any) => {
      const ultimoPago = cuenta;
      const saldo = ultimoPago && ultimoPago.saldo2 ? this.desformatearMoneda(ultimoPago.saldo2) : 0;
      return acc + saldo;
    }, 0);
  }

  filtrarCuentas(): void {
    this.cuentasFiltrados = this.cuentasPagar.filter((cuenta: any) => {
      const matchesClasificacion = this.filtroClasificacion ? cuenta.clasificacion === this.filtroClasificacion : true;
      return matchesClasificacion && !cuenta.aprueba;
    });
    this.calcularSaldoTotal();
  }

  filtrarCuentasFijas(): void {
    const hoy = new Date();
    this.cuentasFiltradosFijas = this.cuentasPagarFija.filter((cuenta: any) => {
      const lastPayment = this.getLastPayment(cuenta);
      return !lastPayment.aprueba;
    });

    this.cuentasFiltradosFijas.forEach(cuenta => {
      cuenta.pagos = cuenta.pagos.filter((pago: any) => {
        const fechaPago = new Date(pago.fechaPago);
        return fechaPago.getMonth() === hoy.getMonth() && fechaPago.getFullYear() === hoy.getFullYear();
      });
    });
    this.calcularSaldoTotalFijas();
  }

  formatearFechaAdmon2(dia: any): string {
    const hoy = new Date();
    const monthIndex = hoy.getMonth();
    const day = dia;
    const formattedDay = ('0' + day).slice(-2);

    const monthNames = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const formattedDate = `${formattedDay} de ${monthNames[monthIndex]}`;

    return formattedDate;
  }

  sumarAprobadosNoPagados(): number {
    return this.cuentasPagar
      .filter((cuenta: any) => cuenta.aprueba && !cuenta.pagado)
      .reduce((acc: any, cuenta: any) => acc + cuenta.valor, 0);
  }

  sumarAprobadosNoPagadosFijas(): number {
    if (!this.cuentasAllFijas || this.cuentasAllFijas.length === 0) {
      return 0;
    }
    return this.cuentasAllFijas.reduce((acc: any, cuenta: any) => acc + this.desformatearMoneda(cuenta.saldo2), 0);
  }

  actualizarSumaAprobadosNoPagados(): void {
    this.saldoTotalAprobadosNoPagados = this.sumarAprobadosNoPagados();
    this.saldoTotalAprobadosNoPagadosFijas = this.sumarAprobadosNoPagadosFijas();
  }

}