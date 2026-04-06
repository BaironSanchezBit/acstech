import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClientsService } from 'src/app/services/clients.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Observable, Subscription, map, of, startWith } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-credito',
  templateUrl: './credito.component.html',
  styleUrls: ['./credito.component.css']
})
export class CreditoComponent implements OnInit, OnDestroy {
  loading = false;
  btnEsconder = false;
  creditoForm: FormGroup;
  creditoForm2: FormGroup;
  financiamientoForm: FormGroup;
  estadoSeleccionado: string = 'TODOS';
  lugares!: any[];
  bancos!: any[];
  clients: any = {};
  vehiculo: any = {};
  variables!: any[];
  creditos: any[] = [];
  creditosFiltrados: any[] = [];
  creditosAll: any[] = [];
  fechaActual: string;
  placaBusqueda = '';
  placaValue = '';
  clienteBusqueda = '';
  numeroSolicitudBusqueda = '';
  btnChange = false;
  btnChange2 = false;
  btnChange3 = false;
  bancoSeleccionado: string = '';
  asesorEntidadFinanciera: string = '';
  celularAsesorFinanciera: string = '';
  correoAsesorEntidadFinanciera: string = '';
  creditoId: any;
  principal: number = 0;

  allClients: any[] = [];
  clienteControl = new FormControl();
  opcionesFiltradas: Observable<any[]> = of([]);

  allVehicles: any[] = [];
  vehiculoInvControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);

  allVehiclesInv: any[] = [];
  vehiculoInvOneControl = new FormControl();
  opcionesFiltradasVehInv: Observable<any[]> = of([]);

  plazoMeses: number = 0;
  pagoMensual: string = '';
  tasaInteres: any;
  monthNames = [
    "enero", "febrero", "marzo",
    "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre",
    "noviembre", "diciembre"
  ];
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient, private vehiclesService: VehiclesService, private formBuilder: FormBuilder, private clientsService: ClientsService) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.fechaActual = new Date().toISOString().substring(0, 10);

    this.financiamientoForm = this.formBuilder.group({
      valorFinanciar: ['$ 0'],
      plazoMeses: ['']
    });

    this.creditoForm = this.formBuilder.group({
      tipoCliente: ['', Validators.required],
      valorVehiculo: ['$ 0', Validators.required],
      valorSolicitado: ['$ 0', Validators.required],
      valorAprobado: ['$ 0', Validators.required],
      nombreBanco: ['', Validators.required],
      observaciones: ['', Validators.required],
      tasaAprobacion: ['', Validators.required],
      condicionesAprobacion: ['', Validators.required],
      estadoSolicitud: ['', Validators.required],
    });

    this.creditoForm2 = this.formBuilder.group({
      fechaRegistro: [this.fechaActual, Validators.required],
      estadoSolicitudPoliza: [''],
      aseguradora: ['', Validators.required],
      asesorComercialAutomagno: ['', Validators.required],
      asesorEntidadFinanciera: [{ value: '', disabled: true }],
      celularAsesorFinanciera: [{ value: '', disabled: true }],
      correoAsesorEntidadFinanciera: [{ value: '', disabled: true }]
    });

    this.principal = 0;
    this.plazoMeses = 0;
    this.pagoMensual = '';
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private removeModalBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
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

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  ngOnInit(): void {
    this.loading = true;

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.clientsService.getAllNumerosIdent().subscribe(clients => {
      this.allClients = clients;
      this.configureFiltering();
    });

    this.vehiclesService.getAllPlaca().subscribe(vehicles => {
      this.allVehicles = vehicles;
      this.allVehiclesInv = vehicles;
      this.configureFilteringVeh();
      this.configureFilteringVehInv();
    });

    this.http.get<any[]>(`${this.apiUrl}/api/ciudades`).subscribe(data => {
      this.lugares = data;
      this.lugares.push({ name: 'Pendiente' });
      this.organizarAlfabeticamente();
    });
    this.http.get<any[]>(`${this.apiUrl}/api/getBancos`).subscribe(data => {
      this.bancos = data;
    });
    this.http.get<any[]>(`${this.apiUrl}/api/getVariable`).subscribe(data => {
      this.variables = data;
      const tasaInteres = this.variables.find(v => v.nombre === 'tasaInteres');
      this.tasaInteres = tasaInteres ? tasaInteres.valor : undefined;
    });
    this.http.get<any[]>(`${this.apiUrl}/api/getAllCreditos`).subscribe(data => {
      this.creditosAll = data;
      this.creditosFiltrados = [...this.creditosAll];
    });

    this.vehiculo = {
      placa: '',
      marca: '',
      linea: '',
      version: '',
      modelo: '',
      cilindraje: '',
      color: '',
      servicio: '',
      clase: '',
      carroceria: '',
      combustible: '',
      pasajeros: '',
      numeroMotor: '',
      ciudadPlaca: '',
      vin: '',
      serie: '',
      chasis: '',
      fechaMatricula: '',
    };

    this.clients = {
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      tipoIdenticacion: '',
      numeroIdentificacion: '',
      ciudadIdentificacion: '',
      direccionResidencia: '',
      ciudadResidencia: '',
      celularOne: '',
      celularTwo: '',
      correoElectronico: '',
      fechaIngreso: ''
    };

    this.placaBusqueda = '';
    this.clienteBusqueda = '';
  }

  buscarCreditosPlaca() {
    const placa = this.vehiculoInvOneControl.value;
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/creditos/${placa}`).subscribe(
      data => {
        this.creditos = data.map(credito => {
          const fechaCreacion = new Date(credito.createdAt);
          const day = fechaCreacion.getDate();
          const monthIndex = fechaCreacion.getMonth();
          const year = fechaCreacion.getFullYear();
          const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

          return {
            numeroSolicitud: credito.numeroSolicitud,
            createdAt: formattedDate,
            estadoTramite: credito.estadoTramite,
            primerNombreCliente: credito.primerNombreCliente,
            primerApellidoCliente: credito.primerApellidoCliente,
            nombreBanco: credito.nombreBanco,
            valorSolicitado: credito.valorSolicitado,
          };
        }).sort((a: any, b: any) => b.numeroSolicitud - a.numeroSolicitud);

      },
      error => {
      }
    );
  }

  onBancoSeleccionado(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.bancoSeleccionado = selectElement.value;
    const asesor = this.bancos.find(b => b.nombreBanco === this.bancoSeleccionado);
    if (asesor) {
      this.creditoForm2.get('asesorEntidadFinanciera')?.setValue(asesor.nombreAsesorBancario);
      this.creditoForm2.get('celularAsesorFinanciera')?.setValue(asesor.telefonoAsesorBancario);
      this.creditoForm2.get('correoAsesorEntidadFinanciera')?.setValue(asesor.correoAsesorBancario);
    }
  }

  buscarVehiculo() {
    if (this.vehiculoInvControl.valid) {
      this.vehiclesService.getVehicleByPlaca(this.vehiculoInvControl.value).subscribe(
        (data) => {
          this.vehiculo = data;
          this.btnChange2 = true;
          this.btnChange3 = true;
          this.vehiculo.fechaMatricula = new Date(data.fechaMatricula).toISOString().substring(0, 10);
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Placa no encontrada!',
          })
        }
      );
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

  buscarCliente() {
    if (this.clienteControl.valid) {
      this.clientsService.getClientById(this.clienteControl.value).subscribe(
        (data) => {
          this.clients = data;
          this.clients.fechaIngreso = new Date(data.fechaIngreso).toISOString().substring(0, 10);
          this.btnChange2 = true;
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Cliente no encontrado!',
          })
        }
      );
    }
  }

  async crearSolicitud() {
    if (this.creditoForm.valid && this.creditoForm2.valid) {
      const data = {
        cliente: this.clients._id,
        vehiculo: this.vehiculo._id,
        ...this.creditoForm.getRawValue(),
        ...this.creditoForm2.getRawValue()
      };

      try {
        const response: any = await this.http.post(`${this.apiUrl}/api/postCreditos`, data).toPromise();

        await Swal.fire({
          title: '¡Éxito!',
          text: 'Información de crédito guardada correctamente',
          icon: 'success',
          confirmButtonText: 'Ok'
        });

        if (response && response.numeroSolicitud) {
          this.updateCredito(response.numeroSolicitud);
        } else {
        }

        location.reload();
      } catch (error: any) { // Manejo del error como tipo genérico
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al guardar la información de crédito',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Verifica los campos de ambos formularios',
        icon: 'warning',
        confirmButtonText: 'Ok'
      });
    }
  }

  organizarAlfabeticamente() {
    this.lugares.sort((a, b) => {
      const departamentoA = a.name.toLowerCase();
      const departamentoB = b.name.toLowerCase();

      if (departamentoA < departamentoB) {
        return -1;
      }
      if (departamentoA > departamentoB) {
        return 1;
      }
      return 0;
    });
  }

  updateCredito(numeroSolicitud: string) {
    const vehiculoId = this.vehiculo._id;
    const body = { numeroSolicitud };

    this.http.put(`${this.apiUrl}/api/agregarCredito/${vehiculoId}`, body)
      .subscribe(
        response => {
        },
        error => {
        }
      );
  }


  onCurrencyInput(controlName: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    const numericValue = parseInt(value, 10);

    if (!isNaN(numericValue)) {
      const formattedValue = this.formatCurrency(numericValue);
      this.creditoForm.controls[controlName].setValue(formattedValue, { emitEvent: false });
    } else {
      this.creditoForm.controls[controlName].setValue('', { emitEvent: false });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  filtrarTramites() {
    if (this.estadoSeleccionado === 'TODOS') {
      this.creditosFiltrados = [...this.creditosAll];
    } else {
      this.creditosFiltrados = this.creditosAll.filter(credito => credito.estadoSolicitud === this.estadoSeleccionado);
    }
  }

  cargarInformacionCredito(solicitudId: any) {
    this.limpiarFormularios();
    this.btnEsconder = false;

    this.http.get<any>(`${this.apiUrl}/api/getCreditos/creditos/${solicitudId}`).subscribe(
      data => {
        this.creditoId = data._id;
        this.btnEsconder = true;
        this.http.get<any>(`${this.apiUrl}/api/getClients/${data.cliente}`).subscribe(
          data => {
            this.clients = data;
            this.clients.fechaIngreso = new Date(data.fechaIngreso).toISOString().substring(0, 10);
          }
        );

        this.http.get<any>(`${this.apiUrl}/api/getVehicles/${data.vehiculo}`).subscribe(
          data => {
            this.vehiculo = data;
            this.vehiculo.fechaMatricula = new Date(data.fechaMatricula).toISOString().substring(0, 10);
          }
        );

        this.creditoForm.patchValue({
          tipoCliente: data.tipoCliente,
          valorVehiculo: data.valorVehiculo,
          valorSolicitado: data.valorSolicitado,
          valorAprobado: data.valorAprobado,
          nombreBanco: data.nombreBanco,
          observaciones: data.observaciones,
          condicionesAprobacion: data.condicionesAprobacion,
          tasaAprobacion: data.tasaAprobacion,
          estadoSolicitud: data.estadoSolicitud
        });

        this.creditoForm2.patchValue({
          fechaRegistro: data.fechaRegistro,
          estadoSolicitudPoliza: data.estadoSolicitudPoliza,
          aseguradora: data.aseguradora,
          asesorComercialAutomagno: data.asesorComercialAutomagno,
          asesorEntidadFinanciera: data.asesorEntidadFinanciera,
          celularAsesorFinanciera: data.celularAsesorFinanciera,
          correoAsesorEntidadFinanciera: data.correoAsesorEntidadFinanciera,
          numeroSolicitud: data.numeroSolicitud
        });

        const fechaFormateada = data.fechaRegistro.split('T')[0];

        this.btnChange = true;
      },
      (error) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la información del crédito',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    );
  }

  async actualizarSolicitudCredito() {
    if (this.creditoForm.valid && this.creditoForm2.valid) {
      const updateData = {
        cliente: this.clients._id,
        vehiculo: this.vehiculo._id,
        ...this.creditoForm.getRawValue(),
        ...this.creditoForm2.getRawValue()
      };

      try {
        await this.http.put(`${this.apiUrl}/api/updateCreditos/${this.creditoId}`, updateData).toPromise();

        await Swal.fire({
          title: '¡Actualización Exitosa!',
          text: 'La información del crédito se ha actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Ok'
        });

        location.reload();
      } catch (error: any) { // Manejo del error como tipo genérico
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar la información del crédito',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Verifica los campos de ambos formularios',
        icon: 'warning',
        confirmButtonText: 'Ok'
      });
    }
  }


  limpiarFormularios() {
    this.creditoForm.reset({
      tipoCliente: '',
      valorVehiculo: '',
      valorSolicitado: '',
      valorAprobado: '',
      nombreBanco: '',
      observaciones: '',
      tasaAprobacion: '',
      condicionesAprobacion: '',
      estadoSolicitud: '',
    });

    this.creditoForm2.reset({
      estadoSolicitudPoliza: '',
      aseguradora: '',
      fechaRegistro: this.fechaActual,
      asesorComercialAutomagno: '',
      asesorEntidadFinanciera: '',
      celularAsesorFinanciera: '',
      correoAsesorEntidadFinanciera: ''
    });
    this.vehiculo = {
      placa: '',
      marca: '',
      linea: '',
      version: '',
      modelo: '',
      cilindraje: '',
      color: '',
      servicio: '',
      clase: '',
      carroceria: '',
      combustible: '',
      pasajeros: '',
      numeroMotor: '',
      ciudadPlaca: '',
      vin: '',
      serie: '',
      chasis: '',
      fechaMatricula: '',
    };

    this.clients = {
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      tipoIdenticacion: '',
      numeroIdentificacion: '',
      ciudadIdentificacion: '',
      direccionResidencia: '',
      ciudadResidencia: '',
      celularOne: '',
      celularTwo: '',
      correoElectronico: '',
      fechaIngreso: ''
    };
    this.numeroSolicitudBusqueda = '';
    this.clienteBusqueda = '';
    this.placaBusqueda = '';
    this.btnChange = false;
    this.btnChange2 = false;
    this.btnChange3 = false;
  }

  calcularYFormatearPago(): void {
    const valorFinanciar = this.convertirAValorNumerico(this.financiamientoForm.get('valorFinanciar')?.value);
    const plazoMeses = this.convertirAValorNumerico(this.financiamientoForm.get('plazoMeses')?.value);

    if (valorFinanciar > 0 && this.tasaInteres > 0 && plazoMeses > 0) {
      const tasaInteresMensual = this.tasaInteres / 10 / 12;
      const pago = valorFinanciar * tasaInteresMensual / (1 - Math.pow(1 + tasaInteresMensual, -plazoMeses));
      const pagoRedondeado = Math.round(pago);
      this.pagoMensual = ` $ ${pagoRedondeado.toLocaleString('es-CO')}`;
    } else {
      this.pagoMensual = '';
    }
  }

  convertirAValorNumerico(valor: string): number {
    if (!valor) {
      return 0;
    }

    const valorNumerico = parseFloat(valor.replace(/[^\d-]/g, ''));
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  }

  convertirAValorNumerico2(valor: string): number {
    if (!valor) {
      return 0;
    }

    const valorNumerico = parseFloat(valor.replace(/[^\d-.]/g, ''));
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  }

  configureFiltering() {
    this.opcionesFiltradas = this.clienteControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allClients.filter(option => option.toLowerCase().includes(filterValue));
  }

  configureFilteringVeh() {
    this.opcionesFiltradasVeh = this.vehiculoInvControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVeh(value))
    );
  }

  private _filterVeh(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehicles.filter(option => option.toLowerCase().includes(filterValue));
  }

  configureFilteringVehInv() {
    this.opcionesFiltradasVehInv = this.vehiculoInvOneControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVehInv(value))
    );
  }

  private _filterVehInv(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehiclesInv.filter(option => option.toLowerCase().includes(filterValue));
  }

  displayFn(cliente: string): string {
    return cliente || '';
  }

  displayFnVeh(vehiculo: string): string {
    return vehiculo || '';
  }

  displayFnVehInv(vehiculo: string): string {
    return vehiculo || '';
  }
}
