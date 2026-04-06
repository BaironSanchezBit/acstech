import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgZone } from '@angular/core';
import { Observable, map, of, startWith } from 'rxjs';
import { VehiclesService } from 'src/app/services/vehicles.service';
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
  selector: 'app-historico-variables',
  templateUrl: './historico-variables.component.html',
  styleUrl: './historico-variables.component.css'
})
export class HistoricoVariablesComponent implements OnInit {
  cuentaPagarEditForm: FormGroup;
  mostrarModal: boolean = false;
  pagosEditForm: FormGroup;
  daviDisponible: any;
  placaFilter: string = '';
  terceroFilter: string = '';
  fechaInicioFilter: string = '';
  fechaFinFilter: string = '';
  bancolDisponible: any;
  cuentaSeleccionada: any;
  cuentasFiltrados: any[] = [];
  placaValue = '';
  efectivoDisponible: any;
  sumaDisponible: any;
  saldoTotal: any;
  filtroClasificacion: string = 'Veh';
  cuentasPagar: any;
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

  allVehicles: any[] = [];
  vehiculoControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);

  constructor(private zone: NgZone, private authService: AuthService, private formBuilder: FormBuilder, private http: HttpClient, private cdRef: ChangeDetectorRef, private vehiclesService: VehiclesService) {
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

    this.cuentaPagarEditForm = this.formBuilder.group({
      clasifEdit: ['', Validators.required],
      tipoEdit: ['', Validators.required],
      placaEdit: [''],
      terceroEdit: [''],
      conceptoEdit: ['', Validators.required],
      valorEdit: ['$ 0', Validators.required],
      saldoEdit: ['$ 0', Validators.required],
      fechaVencimientoEdit: ['', Validators.required],
      pagosEdit: this.formBuilder.array([])
    });

    this.pagosEditForm = this.formBuilder.group({
      pagosEdit: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.vehiclesService.getAllPlaca().subscribe(vehicles => {
      this.allVehicles = vehicles;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getCuentasPagar`).subscribe(data => {
      this.cuentasPagar = data.sort((a, b) => {
        let fechaA = new Date(a.pagado).getTime();
        let fechaB = new Date(b.pagado).getTime();
        return fechaA - fechaB;
      });
      this.filtrarCuentas();
    });

    this.authService.getUserDetails().subscribe(
      user => {
        this.datosUser = user;
        this.cargo = user.cargo;
      },
      error => {
      }
    );

    this.vehiclesService.getAllPlaca().subscribe(vehicles => {
      this.allVehicles = vehicles;
      this.configureFilteringVeh();
    });

    this.subscribeToPayments();

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
  }

  applyFilters() {
    this.cuentasFiltrados = this.cuentasPagar.filter((item: any) => {
      const fechaVencimiento = new Date(item.fechaVencimiento).getTime();
      const inicio = this.fechaInicioFilter ? new Date(this.fechaInicioFilter).getTime() : -Infinity;
      const fin = this.fechaFinFilter ? new Date(this.fechaFinFilter).getTime() : Infinity;

      const placa = this.vehiculoControl.value ? this.vehiculoControl.value.toLowerCase() : '';
      const tercero = this.terceroFilter ? this.terceroFilter.toLowerCase() : '';

      return (!this.vehiculoControl.value || (item.placa && item.placa.toLowerCase().includes(placa))) &&
        (!this.terceroFilter || (item.tercero && item.tercero.toLowerCase().includes(tercero))) &&
        (fechaVencimiento >= inicio && fechaVencimiento <= fin);
    });
}


  saveFilters() {
    const filters = {
      placaFilter2: this.placaFilter,
      terceroFilter2: this.terceroFilter,
      fechaInicioFilter2: this.fechaInicioFilter,
      fechaFinFilter2: this.fechaFinFilter
    };
    localStorage.setItem('historicoFilters2', JSON.stringify(filters));
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

  sumarPagos(pagos: any[]): number {
    return pagos.reduce((acc, pago) => acc + this.desformatearMoneda(pago.valor), 0);
  }

  formatearFechaAdmon2(pagos: any[]): string {
    if (pagos.length === 0) {
      return 'Sin pagos';
    }

    const ultimoPago = pagos.sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime())[0];

    const fechaCreacion = new Date(ultimoPago.fechaPago);
    fechaCreacion.setHours(0, 0, 0, 0);

    const day = fechaCreacion.getDate();
    const monthIndex = fechaCreacion.getMonth();
    const year = fechaCreacion.getFullYear();
    const formattedDate = `${day + 1} de ${this.monthNames[monthIndex]} del ${year}`;

    return formattedDate;
  }

  configureFilteringVeh() {
    this.opcionesFiltradasVeh = this.vehiculoControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVeh(value))
    );
  }

  formatearFecha(fechaVencimiento: any) {
    const fechaCreacion = new Date(fechaVencimiento);
    const day = fechaCreacion.getDate();
    const monthIndex = fechaCreacion.getMonth();
    const year = fechaCreacion.getFullYear();
    const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

    return formattedDate;
  }

  formatearFechaAdmon(cuentaPagar: any): string {
    const fecha = new Date(cuentaPagar.fechaVencimiento);
    const monthIndex = fecha.getMonth();
    const day = cuentaPagar.dia;
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

  onMayuscula(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  onPlacaInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase();

    if (value === '') {
      this.placaValue = value;
    } else if (value.match(/^[A-Z]{1,3}$/)) {
      this.placaValue = value;
    } else if (value.match(/^[A-Z]{3}[0-9]{0,3}$/)) {
      this.placaValue = value;
    }

    if (value !== this.placaValue) {
      input.value = this.placaValue;
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

  abrirModal(cuenta: any): void {
    this.cuentaSeleccionada = cuenta;
    this.pagosEdit.clear();
    cuenta.pagos.forEach((pago: any) => {
      this.pagosEdit.push(this.formBuilder.group({
        fechaPago: [new Date(pago.fechaPago).toISOString().substring(0, 10), Validators.required],
        valor: [this.formatCurrencyWithCommas(pago.valor), Validators.required]
      }));
    });

    this.updateRemainingValue();

    this.pagosEdit.disable();
    this.cuentaPagarEditForm.disable();

    this

    this.cuentaPagarEditForm.patchValue({
      clasifEdit: cuenta.clasificacion,
      tipoEdit: cuenta.tipo,
      terceroEdit: cuenta.tercero,
      placaEdit: cuenta.placa,
      conceptoEdit: cuenta.concepto,
      valorEdit: this.formatCurrencyWithCommas(cuenta.valor),
      saldoEdit: this.formatCurrencyWithCommas(cuenta.saldo),
      fechaVencimientoEdit: cuenta.fechaVencimiento,
    });

    this.mostrarModal = true;
  }

  calcularDiasVencidos(fechaVencimiento: string, pagado: boolean): number {
    if (pagado) {
      return 0;
    }

    const ahora = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const tiempoRestante = vencimiento.getTime() - ahora.getTime();

    if (tiempoRestante > 0) {
      return Math.ceil( -1 - tiempoRestante / (1000 * 3600 * 24));
    } else {
      return Math.floor(Math.abs(tiempoRestante) / (1000 * 3600 * 24));
    }
  }

  calcularDiasVencidosAdmon(dia: number, pagado: boolean): number {
    if (pagado) {
      return 0;
    }

    const ahora = new Date();
    let vencimiento = new Date(ahora.getFullYear(), ahora.getMonth(), dia);

    if (vencimiento.getTime() > ahora.getTime()) {
      vencimiento.setMonth(ahora.getMonth() - 1);
    }

    const tiempoVencido = ahora.getTime() - vencimiento.getTime();

    if (tiempoVencido > 0) {
      return Math.floor(tiempoVencido / (1000 * 3600 * 24));
    }

    return 0;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cuentaPagarEditForm.reset();
  }

  filtrarCuentas(): void {
    this.cuentasFiltrados = this.cuentasPagar.filter((cuenta: any) => {
      const matchesClasificacion = this.filtroClasificacion ? cuenta.clasificacion === this.filtroClasificacion : true;
      return matchesClasificacion;
    });
  }


  agregarPago() {
    const pagosFormGroup = this.formBuilder.group({
      fechaPago: [''],
      valor: ['']
    });

    pagosFormGroup.get('valor')?.valueChanges.subscribe(valorFormateado => {
      if (valorFormateado !== null) {
        const valorNumerico = this.desformatearMoneda(valorFormateado);
        pagosFormGroup.get('valor')?.setValue(valorNumerico.toString(), { emitEvent: false });
      }
    });

    this.pagosEdit.push(pagosFormGroup);
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
    const saldoRestante = Math.max(0, this.desformatearMoneda(this.cuentaSeleccionada.valor) - totalPagos);
    this.cuentaPagarEditForm.get('saldoEdit')?.setValue(this.formatCurrencyWithCommas(saldoRestante));
  }

  private _filterVeh(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehicles.filter(option => option.toLowerCase().includes(filterValue));
  }

  displayFnVeh(vehiculo: string): string {
    return vehiculo || '';
  }
}