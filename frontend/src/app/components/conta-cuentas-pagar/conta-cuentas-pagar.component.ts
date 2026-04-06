import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgZone } from '@angular/core';
import { BehaviorSubject, Observable, map, of, startWith } from 'rxjs';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { environment } from 'src/app/environments/environment';
declare var bootstrap: any;

interface ResponseData {
  _id: string;
  banco: string;
  disponible: number;
  updatedAt: string;
}

@Component({
  selector: 'app-conta-cuentas-pagar',
  templateUrl: './conta-cuentas-pagar.component.html',
  styleUrl: './conta-cuentas-pagar.component.css'
})
export class ContaCuentasPagarComponent implements OnInit {
  cuentaPagarForm: FormGroup;
  cuentaPagarEditForm: FormGroup;
  daviviendaForm: FormGroup;
  bancolombiaForm: FormGroup;
  efectivoForm: FormGroup;
  mostrarModal: boolean = false;
  pagosEditForm: FormGroup;
  daviDisponible: any;
  bancolDisponible: any;
  efectivoDisponible: any;
  sumaDisponible: any;
  daviId: any;
  efectivoId: any;
  bancolId: any;
  cuentaSeleccionada: any;
  cuentasFiltrados: any[] = [];
  placaValue = '';
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
  proveedoresFiltrados: Observable<any[]> = of([]);
  proveedoresFiltradosEdit: Observable<any[]> = of([]);

  allProveedores: any[] = [];
  proveedoresControl = new FormControl();
  filteredSuppliers = new BehaviorSubject<any[]>([]);

  allProveedoresEdit: any[] = [];
  proveedoresControlEdit = new FormControl();

  allVehicles: any[] = [];
  vehiculoControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);

  placaEdit = new FormControl();
  opcionesFiltradasVehModal: Observable<any[]> = of([]);

  constructor(private zone: NgZone, private formBuilder: FormBuilder, private http: HttpClient, private cdRef: ChangeDetectorRef, private vehiclesService: VehiclesService) {
    this.fechaActual = new Date().toISOString().substring(0, 10);
    for (let i = 1; i <= 31; i++) {
      this.dias.push(i);
    }

    this.daviviendaForm = this.formBuilder.group({
      banco: [{ value: '', disabled: true }],
      disponible: ['$ 0', Validators.required],
    });

    this.bancolombiaForm = this.formBuilder.group({
      banco: [{ value: '', disabled: true }],
      disponible: ['$ 0', Validators.required],
    });

    this.efectivoForm = this.formBuilder.group({
      banco: [{ value: '', disabled: true }],
      disponible: ['$ 0', Validators.required],
    });

    this.cuentaPagarForm = this.formBuilder.group({
      clasificacion: ['', Validators.required],
      tipo: [''],
      tercero: [''],
      placa: [''],
      concepto: [''],
      valor: ['$ 0', Validators.required],
      saldo: ['$ 0', Validators.required],
      pagos: this.formBuilder.array([]),
      fechaVencimiento: [this.fechaActual],
      diasVencidos: [''],
      aprueba: [false],
      pagado: [false],
      aCargo: [''],
      entidadFinanciera: [''],
      prioridad: [''],
      numeroCuentas: [''],
      formasPago: [''],
      dia: ['']
    });

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
      this.configureFilteringVeh();
      this.configureFilteringModal();
    });

    this.loadCuentasPagar();
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

      this.http.get<any[]>(`${this.apiUrl}/api/getSuppliers`).subscribe(data => {
        this.allProveedores = data;
        this.allProveedoresEdit = data;
        this.configureFiltering();
        this.configureFilteringEdit();
      });

      this.calcularDisponible();
    });

    setInterval(() => this.http.get<any[]>(`${this.apiUrl}/api/getDisponible`).subscribe(data => {
      this.bancolDisponible = data[0].disponible;
      this.daviDisponible = data[1].disponible;
      this.efectivoDisponible = data[2].disponible;
      this.calcularDisponible();
    }), 5000);

    setInterval(() => this.loadCuentasPagar(), 5000);
  }

  loadCuentasPagar(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/getCuentasPagar`).subscribe(data => {
      this.cuentasPagar = data.map(cuenta => ({
        ...cuenta,
        pagable: this.calcularSaldoRestante(cuenta) === 0 && cuenta.aprueba
      }));
      this.ordenarCuentasPorPrioridad(this.cuentasPagar);
      this.calcularSaldoTotal();
      this.filtrarCuentas();
    });
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

  calcularDisponible() {
    this.sumaDisponible = this.daviDisponible + this.bancolDisponible + this.efectivoDisponible;
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

  configureFiltering() {
    this.proveedoresFiltrados = this.proveedoresControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSuppliers(value))
    );
  }  

  configureFilteringEdit() {
    this.proveedoresFiltradosEdit = this.proveedoresControlEdit.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSuppliersEdit(value))
    );
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

  formatearFecha(fechaVencimiento: any) {
    const fechaCreacion = new Date(fechaVencimiento);
    const day = fechaCreacion.getDate();
    const monthIndex = fechaCreacion.getMonth();
    const year = fechaCreacion.getFullYear();
    const formattedDate = `${day + 1} de ${this.monthNames[monthIndex]} del ${year}`;

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

    const formattedDate = `${formattedDay + 1} de ${monthNames[monthIndex]}`;

    return formattedDate;
  }

  crear() {
    if (this.cuentaPagarForm.valid) {
      const valor = this.desformatearMoneda(this.cuentaPagarForm.get('valor')?.value);

      const body = {
        ...this.cuentaPagarForm.getRawValue(),
        tercero: this.proveedoresControl.value,
        valor: valor,
        saldo: valor,
        diasVencidos: 0,
        aprueba: false,
        pagado: false,
      };

      this.http.post(`${this.apiUrl}/api/postCuentaPagar`, body).subscribe(
        response => {
          this.cuentasPagar.push(response);
          this.calcularSaldoTotal();
          this.filtrarCuentas();
          this.cuentaPagarForm.patchValue({
            clasificacion: '',
            placa: '',
            tipo: '',
            tercero: '',
            saldo: '',
            concepto: '',
            valor: '$ 0',
            fechaVencimiento: this.fechaActual,
          });
        },
        error => {
          Swal.fire({
            icon: "error",
            title: "Ups",
            text: "Error al crear la cuenta.",
          });
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

  actualizar(id: string) {
    if (this.cuentaPagarEditForm.valid) {
      const valor = this.desformatearMoneda(this.cuentaPagarEditForm.get('valorEdit')?.value);
      const saldo = this.desformatearMoneda(this.cuentaPagarEditForm.get('saldoEdit')?.value);
      const pagosEdit = this.convertirArrayAObjeto(this.pagosEditForm.get('pagosEdit') as FormArray);

      const body = {
        clasificacion: this.cuentaPagarEditForm.get('clasifEdit')?.value,
        tipo: this.cuentaPagarEditForm.get('tipoEdit')?.value,
        placa: this.cuentaPagarEditForm.get('placaEdit')?.value,
        tercero: this.proveedoresControlEdit.value,
        concepto: this.cuentaPagarEditForm.get('conceptoEdit')?.value,
        valor: valor,
        saldo: saldo,
        fechaVencimiento: this.cuentaPagarEditForm.get('fechaVencimientoEdit')?.value,
        pagos: pagosEdit
      };

      this.http.put(`${this.apiUrl}/api/updateCuentaPagar/${id}`, body).subscribe(
        response => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Cuenta por pagar actualizada',
            showConfirmButton: false,
            timer: 1000
          });

          const index = this.cuentasPagar.findIndex((c: any) => c._id === id);
          if (index !== -1) {
            this.cuentasPagar[index] = { ...this.cuentasPagar[index], ...body, pagos: pagosEdit };
            this.filtrarCuentas();
          }

          this.cerrarModal();
        },
        error => {
          Swal.fire({
            icon: "error",
            title: "Ups",
            text: "Error al actualizar la cuenta.",
          });
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

  actualizarDavi() {
    if (this.daviviendaForm.valid) {
      const disponible = this.desformatearMoneda(this.daviviendaForm.get('disponible')?.value);

      const body = {
        ...this.daviviendaForm.value,
        disponible: disponible
      };

      this.http.put<ResponseData>(`${this.apiUrl}/api/updateDisponible/${this.daviId}`, body).subscribe(
        response => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Disponible actualizado',
            showConfirmButton: false,
            timer: 1000
          });

          this.daviDisponible = response.disponible;

          this.closeAllModals();
        },
        error => {
          Swal.fire({
            icon: "error",
            title: "Ups",
            text: "Error al actualizar el disponible.",
          });
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

      this.http.put<ResponseData>(`${this.apiUrl}/api/updateDisponible/${this.bancolId}`, body).subscribe(
        response => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Disponible actualizado',
            showConfirmButton: false,
            timer: 1000
          });

          this.bancolDisponible = response.disponible;

          this.closeAllModals();
        },
        error => {
          Swal.fire({
            icon: "error",
            title: "Ups",
            text: "Error al actualizar el disponible.",
          });
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

      this.http.put<ResponseData>(`${this.apiUrl}/api/updateDisponible/${this.efectivoId}`, body).subscribe(
        response => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Disponible actualizado',
            showConfirmButton: false,
            timer: 1000
          });

          this.efectivoDisponible = response.disponible;

          this.closeAllModals();
        },
        error => {
          Swal.fire({
            icon: "error",
            title: "Ups",
            text: "Error al actualizar el disponible.",
          });
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

    if (!(this.cuentaSeleccionada?.aprueba && !(this.sumarPagos(this.cuentaSeleccionada?.pagos) === this.desformatearMoneda(this.cuentaSeleccionada.valor)))) {
      this.pagosEdit.disable();
    } else {
      this.pagosEdit.enable();
    }

    this.cuentaPagarEditForm.patchValue({
      clasifEdit: cuenta.clasificacion,
      tipoEdit: cuenta.tipo,
      placaEdit: cuenta.placa,
      terceroEdit: cuenta.tercero,
      conceptoEdit: cuenta.concepto,
      valorEdit: this.formatCurrencyWithCommas(cuenta.valor),
      saldoEdit: this.formatCurrencyWithCommas(cuenta.saldo),
      fechaVencimientoEdit: cuenta.fechaVencimiento,
    });

    // Reset the filtered options when opening the modal
    this.configureFilteringVehModal();
    this.configureFilteringEdit();

    this.mostrarModal = true;
}

configureFilteringVehModal() {
  const placaControl = this.cuentaPagarEditForm.get('placaEdit');
  if (placaControl) {
    this.opcionesFiltradasVehModal = placaControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterModal(value))
    );
  } else {
    this.opcionesFiltradasVehModal = of([]);
  }
}

  calcularDiasVencidos(fechaVencimiento: string, pagado: boolean): number {
    if (pagado) {
      return 0;
    }

    const ahora = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const tiempoRestante = vencimiento.getTime() - ahora.getTime();

    if (tiempoRestante > 0) {
      return Math.ceil(-1 - tiempoRestante / (1000 * 3600 * 24));
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

  actualizarEstadoPago(cuenta: any): void {
    if (cuenta.saldo === 0) {
      cuenta.pagado = true;
      const diasVencidosActualizados = this.calcularDiasVencidos(cuenta.fechaVencimiento, false);

      const data = {
        ...cuenta,
        pagado: true,
        diasVencidos: diasVencidosActualizados
      };

      this.http.put(`${this.apiUrl}/api/updateCuentaPagar/${cuenta._id}`, data).subscribe({
        next: (response) => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Cuenta por pagar actualizada',
            showConfirmButton: false,
            timer: 1500
          });

          this.zone.run(() => {
            this.cuentasPagar = this.cuentasPagar.map((c: any) => c._id === cuenta._id ? { ...c, pagado: true, diasVencidos: diasVencidosActualizados } : c);
            this.cuentasFiltrados = this.cuentasFiltrados.filter(c => c._id !== cuenta._id);
            this.calcularSaldoTotal();
            this.cdRef.detectChanges();
          });
        },
        error: (error) => {
          console.error('Error al actualizar el estado de pago', error);
          cuenta.pagado = false;
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Ups",
        text: "Por favor ingresa los pagos",
      });
      cuenta.pagado = false;
    }
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

  solicitarAprobacion(cuenta: any): void {
    cuenta.solicita = true;

    const data = {
      ...cuenta,
      solicita: true
    };

    this.http.put(`${this.apiUrl}/api/updateCuentaPagar/${cuenta._id}`, data).subscribe({
      next: (response) => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Solicitud Enviada',
          showConfirmButton: false,
          timer: 1500
        });

        this.zone.run(() => {
          this.cuentasPagar = this.cuentasPagar.map((c: any) => c._id === cuenta._id ? { ...c, solicita: true } : c);
          this.cuentasFiltrados = this.cuentasFiltrados.filter(c => c._id !== cuenta._id);
          this.cdRef.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error al actualizar el estado de pago', error);
        cuenta.solicita = false;
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cuentaPagarEditForm.reset();
  }

  calcularSaldoTotal(): void {
    this.saldoTotal = this.cuentasFiltrados.reduce((acc: any, cuenta: any) => acc + this.desformatearMoneda(cuenta.saldo), 0);
  }

  filtrarCuentas(): void {
    this.cuentasFiltrados = this.cuentasPagar.filter((cuenta: any) => {
      const matchesClasificacion = this.filtroClasificacion ? cuenta.clasificacion === this.filtroClasificacion : true;
      return matchesClasificacion && !cuenta.pagado;
    });
    this.calcularSaldoTotal();
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

  configureFilteringVeh() {
    const placaControl = this.cuentaPagarForm.get('placa');
    if (placaControl) {
      this.opcionesFiltradasVeh = placaControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterVeh(value))
      );
    } else {
      this.opcionesFiltradasVeh = of([]);
    }
  }

  private _filterVeh(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehicles.filter(option => option.toLowerCase().includes(filterValue));
  }

  displayFnVeh(vehiculo: string): string {
    return vehiculo || '';
  }

  configureFilteringModal() {
    const placaControl = this.cuentaPagarEditForm.get('placaEdit');
    if (placaControl) {
      this.opcionesFiltradasVehModal = placaControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterModal(value))
      );
    } else {
      this.opcionesFiltradasVehModal = of([]);
    }
  }

  private _filterModal(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehicles.filter(option => option.toLowerCase().includes(filterValue));
  }

  displayFnPlacaEdit(vehiculo: string): string {
    return vehiculo || '';
  }

  private _filterSuppliers(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.allProveedores.filter(option => option.tercero.toLowerCase().includes(filterValue));
  }  

  displayFn(proveedor: string): string {
    return proveedor || '';
  }

  private _filterSuppliersEdit(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.allProveedoresEdit.filter(option => option.tercero.toLowerCase().includes(filterValue));
  }

  displayFnEdit(proveedor: string): string {
    return proveedor || '';
  }
}
