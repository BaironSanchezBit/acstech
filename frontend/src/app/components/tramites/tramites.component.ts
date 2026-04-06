import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ClientsService } from 'src/app/services/clients.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription, map, of, startWith } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';


@Component({
  selector: 'app-tramites',
  templateUrl: './tramites.component.html',
  styleUrl: './tramites.component.css'
})
export class TramitesComponent implements OnInit, OnDestroy {
  tramitesForm: FormGroup;
  tramite: any = {};

  loading = false;
  btnEsconder = false;
  btnEsconder2 = false;
  mostrarSiguienteModal2 = false;
  mostrarSiguienteModal3 = false;
  buscarTramitePlacaForm: FormGroup;
  buscarInventarioPlacaForm: FormGroup;
  buscarInventarioForm: FormGroup;
  estadoSeleccionado: string = 'TODOS';
  tramites: any[] = [];
  inventarios: any[] = [];
  tramitesAll: any[] = [];
  tramitesFiltrados: any[] = [];
  lugares!: any[];
  bancos!: any[];
  tramitadores!: any[];
  vehiculo: any = {};
  tramiteId: any;
  private apiUrl = environment.apiUrl;

  allVehicles: any[] = [];
  vehiculoInvControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);
  tramiteSeleccionado: any;

  allVehiclesInv: any[] = [];
  vehiculoInvOneControl = new FormControl();
  opcionesFiltradasVehInv: Observable<any[]> = of([]);

  fechaActual: string;
  fechaInicioTramite: any;
  numeroDias: any;
  placaBusqueda = '';
  inventoryId: string = '';
  placaValue = '';
  noInventarioBusqueda = '';
  numeroInventario = '';
  tramitadorSeleccionado: string = '';
  cupoAval: boolean = false;
  btnChange = false;
  btnChange2 = false;
  btnChange3 = false;
  monthNames = [
    "enero", "febrero", "marzo",
    "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre",
    "noviembre", "diciembre"
  ];
  private routerSubscription: Subscription;

  constructor(private changeDetectorRef: ChangeDetectorRef, private router: Router, private http: HttpClient, private vehiclesService: VehiclesService, private formBuilder: FormBuilder) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.fechaActual = new Date().toISOString().substring(0, 10);

    this.buscarTramitePlacaForm = this.formBuilder.group({
      buscarTramitePlaca: ['', Validators.required]
    });

    this.tramitesForm = this.formBuilder.group({
      numeroInventario: [{ value: '', disabled: true }],
      valorImpuesto: [{ value: '', disabled: true }],
      estadoImpuesto: ['', Validators.required],
      estadoVenta: [{ value: '', disabled: false }],
      fechaVenta: [{ value: this.fechaActual, disabled: false }],
      tipoNegocio: [{ value: '', disabled: true }],
      proveedor: [{ value: '', disabled: true }],
      comprador: [{ value: '', disabled: false }],
      vendedor: [{ value: '', disabled: false }],
      levantamiento: [{ value: '', disabled: false }],
      inscripcion: [{ value: '', disabled: false }],
      sePuedeTraspaso: [{ value: '', disabled: false }],
      observacionTraspaso: [{ value: '', disabled: false }],
      ciudadTraspaso: [{ value: '', disabled: false }],
      estadoTraspaso: [{ value: '', disabled: false }],
      fechaEnvioTraspaso: [this.fechaActual],
      estadoFinal: [{ value: '', disabled: false }],
      observacionFinal: [''],
      numeroDias: [{ value: this.numeroDias, disabled: false }],
    });

    this.buscarInventarioPlacaForm = this.formBuilder.group({
      buscarInventarioPlaca: ['', Validators.required]
    });

    this.buscarInventarioForm = this.formBuilder.group({
      buscarInventario: ['', Validators.required]
    });

    this.tramitesForm.get('valorImpuesto')?.disable();
    this.tramitesForm.get('proveedor')?.disable();
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

  utilizarInventario(inventarioId: string) {
    this.buscarInventarioForm.get('buscarInventario')?.setValue(inventarioId);
    this.limpiarFormularios();
    this.buscarInventario();
  }

  buscarInventarioPlaca() {
    const placa = this.vehiculoInvOneControl.value;
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/inventarios/${placa}`).subscribe(
      data => {
        this.inventarios = data.map(inventario => {
          const fechaCreacion = new Date(inventario.createdAt);
          const day = fechaCreacion.getDate();
          const monthIndex = fechaCreacion.getMonth();
          const year = fechaCreacion.getFullYear();
          const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

          return {
            inventoryId: inventario.inventoryId,
            createdAt: formattedDate,
            primerNombreCliente: inventario.primerNombreCliente,
            primerApellidoCliente: inventario.primerApellidoCliente,
            numeroIdentificacionCliente: inventario.numeroIdentificacionCliente
          };
        }).sort((a: any, b: any) => b.inventoryId - a.inventoryId);


      },
      error => {
      }
    );
  }

  buscarInventario() {
    this.limpiarFormularios();

    if (this.buscarInventarioForm.valid) {
      const inventarioId = this.buscarInventarioForm.get('buscarInventario')?.value;
      this.http.get<any>(`${this.apiUrl}/api/getInventories/idInventories/${inventarioId}`).subscribe(
        data => {
          this.inventoryId = data.inventoryId;
          this.btnEsconder2 = true;
          this.buscarVehiculoPorId(data.vehiculo);
          this.tramitesForm.get('numeroInventario')?.setValue(data.inventoryId);
          this.tramitesForm.get('tipoNegocio')?.setValue(data.filtroBaseDatos.tipoNegocio);
          this.tramitesForm.get('proveedor')?.setValue(data.filtroBaseDatos.proveedor);
          this.tramitesForm.get('valorImpuesto')?.setValue(this.formatSalary(data.documentosValoresIniciales.impAnoEnCursoValor));

          if (data.documentosValoresIniciales.estadoImpAnoEnCurso === 'CON PAGO') {
            this.tramitesForm.get('estadoImpuesto')?.setValue('PAGO');
          } else if (data.documentosValoresIniciales.estadoImpAnoEnCurso === 'PARA PAGO') {
            this.tramitesForm.get('estadoImpuesto')?.setValue('NO PAGO');
          } else {
            this.tramitesForm.get('estadoImpuesto')?.setValue('VERIFICAR');
          }

          if (data.filtroBaseDatos.estadoInventario === 'VENDIDO') {
            this.tramitesForm.get('estadoVenta')?.setValue('VENDIDO');
          } else {
            this.tramitesForm.get('estadoVenta')?.setValue('EN INVENTARIO');
          }

          if (data.documentosValoresIniciales.estadoCuentaImpuestoValor > 0 || data.documentosValoresIniciales.simitPropietarioValor > 0) {
            this.tramitesForm.get('comprador')?.setValue('SI');
          } else {
            this.tramitesForm.get('comprador')?.setValue('NO');
          }

          if (data.variablesLiquidacionVentas.comparendosVariables > 0 || data.variablesLiquidacionVentas.comparendosVariables > 0) {
            this.tramitesForm.get('vendedor')?.setValue('SI');
          } else {
            this.tramitesForm.get('vendedor')?.setValue('NO');
          }

          if (data.documentosValoresIniciales.liquidacionDeudaFinValor > 0 || data.documentosValoresIniciales.liquidacionDeudaFinValor > 0) {
            this.tramitesForm.get('levantamiento')?.setValue('SI');
          } else {
            this.tramitesForm.get('levantamiento')?.setValue('NO');
          }

          if (data.variablesLiquidacionVentas.tieneCredito === true || data.variablesLiquidacionVentas.monto > 0) {
            this.tramitesForm.get('inscripcion')?.setValue('SI');
          } else {
            this.tramitesForm.get('inscripcion')?.setValue('NO');
          }

          this.tramitesForm.get('ciudadTraspaso')?.setValue(data.documentosValoresIniciales.ciudadPlaca);

          this.mostrarSiguienteModal3 = true;
          const fechaFinSoat = new Date(data.documentosValoresIniciales.fechaFinSoat).toISOString().substring(0, 10);

        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Inventario no encontrado!',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingresa el numero del inventario!',
      })
    }
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

  ngOnInit(): void {

    this.loading = true;

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
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
    this.http.get<any[]>(`${this.apiUrl}/api/getTramitadores`).subscribe(data => {
      this.tramitadores = data;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getAllTramites`).subscribe(data => {
      this.tramitesAll = data.map(item => {
        return {
          ...item
        };
      });

      // Ordenar tramites según el estadoFinal
      const estadoFinalPrioridad: any = {
        'PENDIENTE RECIBIR TARJETA': 1,
        'ENTREGAR TARJETA': 2,
        'POR RADICAR': 3,
        'ENTREGADO A CLIENTE': 4
      };

      this.tramitesAll.sort((a, b) => {
        const prioridadA = estadoFinalPrioridad[a.estadoFinal] || 5;
        const prioridadB = estadoFinalPrioridad[b.estadoFinal] || 5;
        return prioridadA - prioridadB;
      });

      this.tramitesFiltrados = [...this.tramitesAll];
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

    this.placaBusqueda = '';

    this.tramitesForm.get('fechaLlegadaTConcesionario')?.disable();
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

  filtrarTramites() {
    let tramitesFiltrados = this.tramitesAll;

    if (this.estadoSeleccionado !== 'TODOS') {
      tramitesFiltrados = tramitesFiltrados.filter(tramite => tramite.estadoFinal === this.estadoSeleccionado);
    }

    if (this.placaBusqueda.trim() !== '') {
      tramitesFiltrados = tramitesFiltrados.filter(tramite => tramite.placa.includes(this.placaBusqueda.toUpperCase()));
    }

    this.tramitesFiltrados = tramitesFiltrados;
  }


  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  buscarVehiculo() {
    if (this.placaBusqueda) {
      this.vehiclesService.getVehicleByPlaca(this.placaBusqueda).subscribe(
        (data) => {
          this.vehiculo = data;
          this.btnChange2 = true;
          this.vehiculo.fechaMatricula = new Date(data.fechaMatricula).toISOString().substring(0, 10);
          this.btnChange3 = true;
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

  onTramitadorSeleccionado(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.tramitadorSeleccionado = selectElement.value;
    const tramitador = this.tramitadores.find(t => t.responsable === this.tramitadorSeleccionado);
    if (tramitador) {
      this.tramitesForm.get('nombreTramitador')?.setValue(tramitador.responsable);
      this.tramitesForm.get('celularTramitador')?.setValue(tramitador.telefono);
      this.tramitesForm.get('correoTramitador')?.setValue(tramitador.correoElectronico);
      this.tramitesForm.get('direccionTramitador')?.setValue(tramitador.direccion);
      this.tramitesForm.get('celularTramitador')?.disable();
      this.tramitesForm.get('correoTramitador')?.disable();
      this.tramitesForm.get('direccionTramitador')?.disable();
    } else {
      this.tramitesForm.get('nombreTramitador')?.setValue('');
      this.tramitesForm.get('celularTramitador')?.setValue('');
      this.tramitesForm.get('correoTramitador')?.setValue('');
      this.tramitesForm.get('direccionTramitador')?.setValue('');
    }
  }

  buscarTramitePlaca() {
    const placa = this.vehiculoInvControl.value;
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/tramites/${placa}`).subscribe(
      data => {

        this.tramites = data.map(tramite => {
          const fechaCreacion = new Date(tramite.createdAt);
          const day = fechaCreacion.getDate();
          const monthIndex = fechaCreacion.getMonth();
          const year = fechaCreacion.getFullYear();
          const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

          return {
            numeroInventario: tramite.numeroInventario,
            createdAt: formattedDate,
            estadoTramite: tramite.estadoTramite,
            primerNombreCliente: tramite.primerNombreCliente,
            primerApellidoCliente: tramite.primerApellidoCliente,
          };
        }).sort((a: any, b: any) => b.numeroInventario - a.numeroInventario);

      },
      error => {
      }
    );
  }

  async crearTramite() {
    if (this.tramitesForm.valid) {
      const data = {
        vehiculo: this.vehiculo._id,
        ...this.tramitesForm.getRawValue(),
      };

      try {
        const response: any = await this.http.post(`${this.apiUrl}/api/postTramites`, data).toPromise();

        const result = await Swal.fire({
          title: '¡Éxito!',
          text: 'Información del trámite guardada correctamente',
          icon: 'success',
          confirmButtonText: 'Ok'
        });


        if (response && response.numeroInventario) {
          this.updateTramite(response.numeroInventario);
        } else {
        }

        if (result.isConfirmed || result.isDismissed) {
          window.location.reload();
        }

      } catch (error) {
        let mensajeError = 'Hubo un problema al guardar la información del trámite';

        if (error instanceof HttpErrorResponse) {
          if (error.status === 400) {
            mensajeError = 'El número de inventario ya está registrado con trámite';
          }
        }

        await Swal.fire({
          title: 'Error',
          text: mensajeError,
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    } else {
      await Swal.fire({
        title: 'Error',
        text: 'Verifica los campos de ambos formularios',
        icon: 'warning',
        confirmButtonText: 'Ok'
      });
    }
  }

  updateTramite(numeroInventario: string) {
    const vehiculoId = this.vehiculo._id;
    const body = { numeroInventario };

    this.http.put(`${this.apiUrl}/api/agregarTramite/${vehiculoId}`, body)
      .subscribe(
        response => {
        },
        error => {
        }
      );
  }

  diasTranscurridos(tramitadorSeleccionado: any): number {
    let fechaInicial = tramitadorSeleccionado.fechaEnvioTraspaso;
    let numeroDias: number;

    if (fechaInicial === null || fechaInicial === '1970-01-01') {
      return 0;
    }

    const fechaInicialDate = new Date(fechaInicial);
    const fechaActualDate = new Date();

    // Restablecer las horas para evitar ajustes
    fechaInicialDate.setHours(0, 0, 0, 0);
    fechaActualDate.setHours(0, 0, 0, 0);

    const diferenciaMs = fechaActualDate.getTime() - fechaInicialDate.getTime();

    numeroDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24) - 1);

    return numeroDias;
  }

  cargarInformacionTramite(numeroInventario: any) {

    this.limpiarFormularios();

    this.http.get<any>(`${this.apiUrl}/api/getTramites/tramites/${numeroInventario}`).subscribe(
      data => {
        this.btnEsconder = true;
        this.tramiteId = data._id;
        this.btnChange = true;
        this.mostrarSiguienteModal2 = true;
        this.buscarVehiculoPorId(data.vehiculo);

        const fechaVenta = new Date(data.fechaVenta).toISOString().substring(0, 10);
        const fechaEnvioTraspaso = new Date(data.fechaEnvioTraspaso).toISOString().substring(0, 10);


        this.fechaInicioTramite = fechaVenta;

        this.tramitesForm.patchValue({
          numeroInventario: data.numeroInventario,
          valorImpuesto: data.valorImpuesto,
          estadoImpuesto: data.estadoImpuesto,
          estadoVenta: data.estadoVenta,
          fechaVenta: fechaVenta,
          tipoNegocio: data.tipoNegocio,
          proveedor: data.proveedor,
          comprador: data.comprador,
          vendedor: data.vendedor,
          levantamiento: data.levantamiento,
          inscripcion: data.inscripcion,
          sePuedeTraspaso: data.sePuedeTraspaso,
          observacionTraspaso: data.observacionTraspaso,
          ciudadTraspaso: data.ciudadTraspaso,
          estadoTraspaso: data.estadoTraspaso,
          fechaEnvioTraspaso: fechaEnvioTraspaso,
          estadoFinal: data.estadoFinal,
          observacionFinal: data.observacionFinal,
          numeroDias: data.numeroDias,
        });

        this.btnChange = true;
      },
      (error) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la información del Trámite',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    );
  }

  buscarVehiculoPorId(vehiculoId: string) {
    this.http.get<any>(`${this.apiUrl}/api/getVehicles/${vehiculoId}`).subscribe(
      vehiculoData => {
        this.vehiculo = vehiculoData;
        this.vehiculo.fechaMatricula = new Date(vehiculoData.fechaMatricula).toISOString().substring(0, 10);
      },
      error => {
      }
    );
  }

  async actualizarTramite() {
    if (this.tramitesForm.valid) {
      const updateData = {
        vehiculo: this.vehiculo._id,
        ...this.tramitesForm.getRawValue(),
      };

      try {
        await this.http.put(`${this.apiUrl}/api/updateTramites/${this.tramiteId}`, updateData).toPromise();

        await Swal.fire({
          title: '¡Actualización Exitosa!',
          text: 'La información del Trámite se ha actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Ok'
        });

        window.location.reload();
        this.limpiarFormularios();

      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar la información del Trámite',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    } else {
      await Swal.fire({
        title: 'Error',
        text: 'Verifica los campos de ambos formularios',
        icon: 'warning',
        confirmButtonText: 'Ok'
      });
    }
  }

  async actualizarChange(tramiteSeleccionado: any) {
    try {

      let dias;

      if (tramiteSeleccionado.estadoTraspaso === 'FINALIZADO') {
        dias = tramiteSeleccionado.numeroDias;
      } else {
        dias = this.diasTranscurridos(tramiteSeleccionado)
      }

      const data = {
        numeroInventario: tramiteSeleccionado.numeroInventario,
        valorImpuesto: tramiteSeleccionado.valorImpuesto,
        estadoImpuesto: tramiteSeleccionado.estadoImpuesto,
        estadoVenta: tramiteSeleccionado.estadoVenta,
        fechaVenta: tramiteSeleccionado.fechaVenta,
        tipoNegocio: tramiteSeleccionado.tipoNegocio,
        proveedor: tramiteSeleccionado.proveedor,
        comprador: tramiteSeleccionado.comprador,
        vendedor: tramiteSeleccionado.vendedor,
        levantamiento: tramiteSeleccionado.levantamiento,
        inscripcion: tramiteSeleccionado.inscripcion,
        sePuedeTraspaso: tramiteSeleccionado.sePuedeTraspaso,
        observacionTraspaso: tramiteSeleccionado.observacionTraspaso,
        ciudadTraspaso: tramiteSeleccionado.ciudadTraspaso,
        estadoTraspaso: tramiteSeleccionado.estadoTraspaso,
        fechaEnvioTraspaso: tramiteSeleccionado.fechaEnvioTraspaso,
        estadoFinal: tramiteSeleccionado.estadoFinal,
        observacionFinal: tramiteSeleccionado.observacionFinal,
        numeroDias: dias
      }

      const response: any = await this.http.put(`${this.apiUrl}/api/updateTramites/${tramiteSeleccionado._id}`, data).toPromise();

      if (response.fechaVenta === null || response.fechaVenta === '1970-01-01') {
        tramiteSeleccionado.fechaVenta = null;
      } else {
        tramiteSeleccionado.fechaVenta = new Date(response.fechaVenta).toISOString().substring(0, 10);
      }

      if (response.fechaEnvioTraspaso === null || response.fechaEnvioTraspaso === '1970-01-01') {
        tramiteSeleccionado.fechaEnvioTraspaso = null;
      } else {
        tramiteSeleccionado.fechaEnvioTraspaso = new Date(response.fechaEnvioTraspaso).toISOString().substring(0, 10);
      }

      tramiteSeleccionado.numeroInventario = response.numeroInventario;
      tramiteSeleccionado.valorImpuesto = response.valorImpuesto;
      tramiteSeleccionado.estadoImpuesto = response.estadoImpuesto;
      tramiteSeleccionado.estadoVenta = response.estadoVenta;
      tramiteSeleccionado.tipoNegocio = response.tipoNegocio;
      tramiteSeleccionado.proveedor = response.proveedor;
      tramiteSeleccionado.comprador = response.comprador;
      tramiteSeleccionado.vendedor = response.vendedor;
      tramiteSeleccionado.levantamiento = response.levantamiento;
      tramiteSeleccionado.inscripcion = response.inscripcion;
      tramiteSeleccionado.sePuedeTraspaso = response.sePuedeTraspaso;
      tramiteSeleccionado.observacionTraspaso = response.observacionTraspaso;
      tramiteSeleccionado.ciudadTraspaso = response.ciudadTraspaso;
      tramiteSeleccionado.estadoTraspaso = response.estadoTraspaso;
      tramiteSeleccionado.estadoFinal = response.estadoFinal;
      tramiteSeleccionado.observacionFinal = response.observacionFinal;
      tramiteSeleccionado.numeroDias = response.numeroDias;
    } catch (error) {
      console.error('Error al actualizar el trámite', error);
    }
  }

  calculateDaysSince(dateString: string): number {

    const startDate = new Date(dateString);
    if (isNaN(startDate.getTime())) {
      return 0;
    }

    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - startDate.getTime();
    return Math.floor(timeDifference / (1000 * 3600 * 24));
  }


  limpiarFormularios() {
    this.btnEsconder2 = false;
    this.btnEsconder = false;

    this.tramitesForm.reset({
      tipoCliente: '',
      valorVehiculo: '',
      valorSolicitado: '',
      valorAprobado: '',
      nombreBanco: '',
      observaciones: '',
      tasaAprobacion: '',
      condicionesAprobacion: '',
      estadoSolicitud: '',
      fechaRegistro: this.fechaActual
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

    this.numeroInventario = '';
    this.placaBusqueda = '';
    this.btnChange = false;
    this.btnChange2 = false;
    this.btnChange3 = false;
  }

  deshabilitarCupoAval() {
    if (this.tramitesForm.get('cupoAval')?.value === false) {
      this.tramitesForm.get('vencimientoCupoAval')?.disable();
    } else {
      this.tramitesForm.get('vencimientoCupoAval')?.enable();
    }
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

  displayFnVeh(vehiculo: string): string {
    return vehiculo || '';
  }

  displayFnVehInv(vehiculo: string): string {
    return vehiculo || '';
  }

  getSelectedColor(prioridad: string): string {
    switch (prioridad) {
      case 'SI':
      case 'PERSONA NATURAL':
      case 'PAGO':
      case 'EN INVENTARIO':
      case 'FINALIZADO':
      case 'ENTREGADO A CLIENTE':
        return '#289b05';
      case 'NO':
      case 'SANTANDER':
      case 'VENDIDO':
      case 'NO PAGO':
      case 'DETENIDO':
      case 'PENDIENTE RECIBIR TARJETA':
        return '#be0202';
      case 'PERSONA JURÍDICA':
      case 'POR RADICAR':
        return '#edb4f5';
      case 'AUTONAL':
      case 'VERIFICAR':
      case 'EN PROCESO':
      case 'ENTREGAR TARJETA':
      case 'COMPRA':
      case 'CONSIGNACIÓN':
      case 'RETOMA':
        return '#e7eb28';
      default:
        return '';
    }
  }

  getTextColor(prioridad: string): string {
    switch (prioridad) {
      case 'SI':
      case 'NO':
      case 'PERSONA NATURAL':
      case 'SANTANDER':
      case 'NO PAGO':
      case 'PAGO':
      case 'VENDIDO':
      case 'FINALIZADO':
      case 'DETENIDO':
      case 'EN INVENTARIO':
      case 'ENTREGADO A CLIENTE':
      case 'PENDIENTE RECIBIR TARJETA':
        return '#ffffff';
      default:
        return '';
    }
  }
}
